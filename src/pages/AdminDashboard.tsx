import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, FlaskConical, Building2, UtensilsCrossed, School, Bot } from "lucide-react";
import AdminDataTable from "@/components/admin/AdminDataTable";

const categories = [
  { key: "faculty", label: "Faculty", icon: Users, fields: ["name", "department", "room"] },
  { key: "labs", label: "Labs", icon: FlaskConical, fields: ["name", "building", "location"] },
  { key: "offices", label: "Offices", icon: Building2, fields: ["name", "purpose", "location"] },
  { key: "canteen", label: "Canteen", icon: UtensilsCrossed, fields: ["name", "timings", "menu"] },
  { key: "exam_halls", label: "Exam Halls", icon: School, fields: ["hall", "details", "building"] },
] as const;

export default function AdminDashboard() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState("faculty");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">CampusBot Admin</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container py-6 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold">Knowledge Base</h2>
          <p className="text-muted-foreground">Manage campus information that students can query</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            {categories.map(cat => (
              <TabsTrigger key={cat.key} value={cat.key} className="gap-1.5">
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.key} value={cat.key}>
              <AdminDataTable
                tableName={cat.key}
                fields={cat.fields as unknown as string[]}
                label={cat.label}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
