import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useGuests, useReservations, useCreateGuest } from "@/hooks/use-hotel";
import { Mail, Phone, MapPin, Plus, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function Guests() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", vip: false });
  const { data: guests = [], isLoading } = useGuests();
  const { data: reservations = [] } = useReservations();
  const createGuest = useCreateGuest();

  const filtered = guests.filter(g =>
    !q || g.name.toLowerCase().includes(q.toLowerCase()) || (g.email ?? "").toLowerCase().includes(q.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createGuest.mutateAsync({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        country: form.country || undefined,
        vip: form.vip,
      });
      toast.success("Guest added");
      setOpen(false);
      setForm({ name: "", email: "", phone: "", country: "", vip: false });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AppShell title="Guests">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input placeholder="Search guests…" value={q} onChange={e => setQ(e.target.value)} className="sm:w-80" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add guest</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New guest</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div><Label>Name *</Label><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
              <div className="flex items-center gap-2"><Checkbox id="vip" checked={form.vip} onCheckedChange={v => setForm(f => ({ ...f, vip: !!v }))} /><Label htmlFor="vip">VIP</Label></div>
              <DialogFooter><Button type="submit" disabled={createGuest.isPending}>{createGuest.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid place-items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(g => {
          const stays = reservations.filter(r => r.guestId === g.id).length;
          return (
            <Card key={g.id} className="p-5 shadow-soft hover:shadow-elevated transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">
                  {g.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">{g.name}</div>
                    {g.vip && <Badge className="bg-accent text-accent-foreground">VIP</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{stays} stay{stays === 1 ? "" : "s"}</div>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                {g.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {g.email}</div>}
                {g.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {g.phone}</div>}
                {g.country && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {g.country}</div>}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No guests yet.</p>}
      </div>
      )}
    </AppShell>
  );
}
