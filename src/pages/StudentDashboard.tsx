import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Where is the AI lab?",
  "What are canteen timings?",
  "Where is Dr. Sharma's room?",
  "Which exam halls are available?",
];

export default function StudentDashboard() {
  const { signOut, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("campus-chat", {
        body: { messages: newMessages },
      });

      if (response.error) throw new Error(response.error.message);

      const assistantContent = response.data?.reply || "I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      toast.error("Failed to get response");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">CampusBot</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Hi there! 👋</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                I can help you find campus information — faculty rooms, lab locations, canteen timings, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map(s => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <Card className={`max-w-[80%] p-4 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "glass-card"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-card-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </Card>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center mt-1">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <Card className="glass-card p-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="container max-w-3xl flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about campus..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
