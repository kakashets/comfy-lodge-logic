import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  user_id: string;
  display_name: string | null;
  email: string | null;
  role: "admin" | "staff" | null;
}

export default function Team() {
  const { role } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantEmail, setGrantEmail] = useState("");
  const [grantRole, setGrantRole] = useState<"admin" | "staff">("staff");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, email");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const merged: TeamMember[] = (profiles ?? []).map(p => ({
      user_id: p.user_id,
      display_name: p.display_name,
      email: p.email,
      role: (roles?.find(r => r.user_id === p.user_id)?.role as any) ?? null,
    }));
    setMembers(merged);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (role !== "admin") {
    return (
      <AppShell title="Team">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Only admins can manage team access.</p>
        </Card>
      </AppShell>
    );
  }

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const m = members.find(x => x.email?.toLowerCase() === grantEmail.toLowerCase().trim());
    if (!m) { setBusy(false); return toast.error("No matching account. Ask the user to sign up first."); }
    if (m.role) await supabase.from("user_roles").delete().eq("user_id", m.user_id);
    const { error } = await supabase.from("user_roles").insert({ user_id: m.user_id, role: grantRole });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${m.email} is now ${grantRole}`);
    setGrantEmail("");
    load();
  }

  async function revoke(uid: string) {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid);
    if (error) return toast.error(error.message);
    toast.success("Access revoked");
    load();
  }

  return (
    <AppShell title="Team">
      <Card className="p-5 shadow-soft mb-4">
        <h2 className="font-semibold mb-3">Grant access</h2>
        <form onSubmit={grant} className="grid gap-3 sm:grid-cols-[1fr,160px,auto]">
          <div><Label>User email</Label><Input type="email" required value={grantEmail} onChange={e => setGrantEmail(e.target.value)} placeholder="They must sign up first" /></div>
          <div><Label>Role</Label>
            <Select value={grantRole} onValueChange={(v: any) => setGrantRole(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="staff">Staff</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex items-end"><Button type="submit" disabled={busy}>{busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Grant</Button></div>
        </form>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th><th className="text-right p-3">Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></td></tr>}
              {members.map(m => (
                <tr key={m.user_id} className="border-t">
                  <td className="p-3 font-medium">{m.display_name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{m.email}</td>
                  <td className="p-3">
                    {m.role === "admin" && <Badge className="bg-accent text-accent-foreground"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>}
                    {m.role === "staff" && <Badge variant="outline">Staff</Badge>}
                    {!m.role && <Badge variant="outline" className="text-muted-foreground"><ShieldOff className="w-3 h-3 mr-1" /> No access</Badge>}
                  </td>
                  <td className="p-3 text-right">
                    {m.role && <Button size="sm" variant="outline" onClick={() => revoke(m.user_id)}>Revoke</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
