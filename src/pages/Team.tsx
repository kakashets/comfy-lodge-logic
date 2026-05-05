import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Shield, ShieldOff, ChevronDown, Info } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  user_id: string;
  display_name: string | null;
  email: string | null;
  role: "admin" | "staff" | null;
}

export default function Team() {
  const { role, user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  async function setRole(uid: string, newRole: "admin" | "staff") {
    setBusyId(uid);
    // Insert the new role first so we don't lose admin rights mid-operation
    // (deleting our own admin row before insert would fail RLS on the insert).
    const { error: insErr } = await supabase
      .from("user_roles")
      .upsert({ user_id: uid, role: newRole }, { onConflict: "user_id,role" });
    if (insErr) { setBusyId(null); return toast.error(insErr.message); }
    // Remove any other roles for this user (keep only the new one)
    const { error: delErr } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", uid)
      .neq("role", newRole);
    setBusyId(null);
    if (delErr) return toast.error(delErr.message);
    toast.success(`Role set to ${newRole}`);
    load();
  }

  async function revoke(uid: string) {
    if (uid === user?.id) return toast.error("You can't revoke your own access.");
    setBusyId(uid);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Access revoked");
    load();
  }

  return (
    <AppShell title="Team">
      <Card className="p-5 shadow-soft mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted grid place-items-center shrink-0">
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3 text-sm">
            <h2 className="font-semibold text-base">Roles & permissions</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-md border p-3">
                <Badge className="bg-accent text-accent-foreground mb-2"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>
                <p className="text-muted-foreground">Full access. Can manage rooms, reservations, guests, housekeeping, reports — and grant or revoke team access.</p>
              </div>
              <div className="rounded-md border p-3">
                <Badge variant="outline" className="mb-2">Staff</Badge>
                <p className="text-muted-foreground">Day-to-day operations: view and edit rooms, reservations, guests and housekeeping. Cannot manage the team.</p>
              </div>
              <div className="rounded-md border p-3">
                <Badge variant="outline" className="text-muted-foreground mb-2"><ShieldOff className="w-3 h-3 mr-1" /> No access</Badge>
                <p className="text-muted-foreground">Account exists but is locked out. Sees an "awaiting access" screen until an admin grants a role.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">New users must sign up first — they then appear below for you to grant access.</p>
          </div>
        </div>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th><th className="text-right p-3">Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></td></tr>}
              {members.map(m => {
                const isMe = m.user_id === user?.id;
                const busy = busyId === m.user_id;
                return (
                  <tr key={m.user_id} className="border-t">
                    <td className="p-3 font-medium">
                      {m.display_name ?? "—"}
                      {isMe && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">{m.email}</td>
                    <td className="p-3">
                      {m.role === "admin" && <Badge className="bg-accent text-accent-foreground"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>}
                      {m.role === "staff" && <Badge variant="outline">Staff</Badge>}
                      {!m.role && <Badge variant="outline" className="text-muted-foreground"><ShieldOff className="w-3 h-3 mr-1" /> No access</Badge>}
                    </td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" disabled={busy}>
                            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Manage <ChevronDown className="w-3 h-3 ml-1" /></>}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled={m.role === "admin"} onClick={() => setRole(m.user_id, "admin")}>
                            <Shield className="w-3 h-3 mr-2" /> Make admin
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={m.role === "staff"} onClick={() => setRole(m.user_id, "staff")}>
                            Make staff
                          </DropdownMenuItem>
                          {m.role && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={isMe}
                                onClick={() => revoke(m.user_id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <ShieldOff className="w-3 h-3 mr-2" /> Revoke access
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
