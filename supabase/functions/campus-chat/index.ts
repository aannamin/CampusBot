import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userQuestion = messages[messages.length - 1]?.content || "";

    // Fetch all knowledge base data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [faculty, labs, offices, canteen, examHalls] = await Promise.all([
      supabase.from("faculty").select("name, department, room"),
      supabase.from("labs").select("name, building, location"),
      supabase.from("offices").select("name, purpose, location"),
      supabase.from("canteen").select("name, timings, menu"),
      supabase.from("exam_halls").select("hall, details, building"),
    ]);

    const knowledgeBase = {
      faculty: faculty.data || [],
      labs: labs.data || [],
      offices: offices.data || [],
      canteen: canteen.data || [],
      exam_halls: examHalls.data || [],
    };

    const hasAnyData = Object.values(knowledgeBase).some(arr => arr.length > 0);

    if (!hasAnyData) {
      return new Response(JSON.stringify({
        reply: "I don't have that information yet — contact admin@oxford.edu",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are CampusBot, a helpful college campus assistant. You answer student questions using ONLY the knowledge base data provided below. Be concise, friendly, and accurate.

KNOWLEDGE BASE:
${JSON.stringify(knowledgeBase, null, 2)}

RULES:
- Only answer using data from the knowledge base above
- If the information is not in the knowledge base, respond exactly: "I don't have that information yet — contact admin@oxford.edu"
- Be conversational but brief
- Format locations clearly
- If asked about multiple things, address each one`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Contact admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "I couldn't process that. Please try again.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("campus-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
