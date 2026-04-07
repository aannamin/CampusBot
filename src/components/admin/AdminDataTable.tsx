import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";

type TableName = "faculty" | "labs" | "offices" | "canteen" | "exam_halls";

interface Props {
  tableName: string;
  fields: string[];
  label: string;
}

export default function AdminDataTable({ tableName, fields, label }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const table = tableName as TableName;

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, [tableName]);

  const openAdd = () => {
    setEditingRow(null);
    setFormData(Object.fromEntries(fields.map(f => [f, ""])));
    setDialogOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setFormData(Object.fromEntries(fields.map(f => [f, row[f] || ""])));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const requiredFields = fields.filter(f => f !== "menu" && f !== "building");
    const missing = requiredFields.filter(f => !formData[f]?.trim());
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    if (editingRow) {
      const { error } = await supabase.from(table).update(formData as any).eq("id", editingRow.id);
      if (error) { toast.error(error.message); return; }
      toast.success(`${label} updated`);
    } else {
      const { error } = await supabase.from(table).insert(formData as any);
      if (error) { toast.error(error.message); return; }
      toast.success(`${label} added`);
    }
    setDialogOpen(false);
    fetchRows();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchRows(); }
  };

  const filtered = rows.filter(row =>
    !search || fields.some(f => String(row[f] || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">{label} ({rows.length})</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search…"
              className="pl-8 w-48"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAdd}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRow ? `Edit ${label}` : `Add ${label}`}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {fields.map(field => (
                  <div key={field} className="space-y-1">
                    <Label className="capitalize">{field.replace(/_/g, " ")}</Label>
                    <Input
                      value={formData[field] || ""}
                      onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                ))}
                <Button onClick={handleSave} className="w-full">
                  {editingRow ? "Update" : "Add"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? "No results found" : `No ${label.toLowerCase()} entries yet. Click "Add" to get started.`}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {fields.map(f => (
                    <TableHead key={f} className="capitalize">{f.replace(/_/g, " ")}</TableHead>
                  ))}
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(row => (
                  <TableRow key={row.id}>
                    {fields.map(f => (
                      <TableCell key={f}>{row[f] || "—"}</TableCell>
                    ))}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
