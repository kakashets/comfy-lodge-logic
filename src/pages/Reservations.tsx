import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useReservations, useGuests, useRooms, useCreateReservation, useUpdateReservationStatus, guestById } from "@/hooks/use-hotel";
import { RES_STATUS_META, nightsBetween, ReservationStatus } from "@/lib/hotel-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const FILTERS: (ReservationStatus | "all")[] = ["all", "confirmed", "checked_in", "checked_out", "cancelled"];

export default function Reservations() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");
  const [open, setOpen] = useState(false);

  const { data: reservations = [], isLoading } = useReservations();
  const { data: guests = [] } = useGuests();
  const { data: rooms = [] } = useRooms();
  const createRes = useCreateReservation();
  const updateStatus = useUpdateReservationStatus();

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [form, setForm] = useState({ guest_id: "", room_number: "", check_in: today, check_out: tomorrow, adults: 2, children: 0, notes: "" });

  const filtered = reservations.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (!q) return true;
    const g = guestById(guests, r.guestId);
    return (g?.name ?? "").toLowerCase().includes(q.toLowerCase()) || r.roomNumber.includes(q);
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const room = rooms.find(r => r.number === form.room_number);
    if (!room) return toast.error("Pick a room");
    if (!form.guest_id) return toast.error("Pick a guest");
    try {
      await createRes.mutateAsync({ ...form, rate_per_night: room.rate, notes: form.notes || undefined });
      toast.success("Reservation created");
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AppShell title="Reservations">
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <Input placeholder="Search by guest or room…" value={q} onChange={e => setQ(e.target.value)} className="md:w-80" />
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : RES_STATUS_META[f as ReservationStatus].label}
            </Button>
          ))}
        </div>
        <div className="md:ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New booking</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New reservation</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <Label>Guest</Label>
                  <Select value={form.guest_id} onValueChange={v => setForm(f => ({ ...f, guest_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pick a guest" /></SelectTrigger>
                    <SelectContent>{guests.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Room</Label>
                  <Select value={form.room_number} onValueChange={v => setForm(f => ({ ...f, room_number: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pick a room" /></SelectTrigger>
                    <SelectContent>{rooms.map(r => <SelectItem key={r.number} value={r.number}>{r.number} — {r.type} (${r.rate})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Check-in</Label><Input type="date" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} /></div>
                  <div><Label>Check-out</Label><Input type="date" value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Adults</Label><Input type="number" min={1} value={form.adults} onChange={e => setForm(f => ({ ...f, adults: +e.target.value }))} /></div>
                  <div><Label>Children</Label><Input type="number" min={0} value={form.children} onChange={e => setForm(f => ({ ...f, children: +e.target.value }))} /></div>
                </div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
                <DialogFooter><Button type="submit" disabled={createRes.isPending}>{createRes.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3 font-medium">Guest</th>
                <th className="text-left p-3 font-medium">Room</th>
                <th className="text-left p-3 font-medium">Check-in</th>
                <th className="text-left p-3 font-medium">Check-out</th>
                <th className="text-left p-3 font-medium">Nights</th>
                <th className="text-left p-3 font-medium">Total</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></td></tr>}
              {filtered.map(r => {
                const g = guestById(guests, r.guestId);
                const nights = nightsBetween(r.checkIn, r.checkOut);
                return (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      <div className="font-medium">{g?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{g?.email}</div>
                    </td>
                    <td className="p-3 font-semibold">{r.roomNumber}</td>
                    <td className="p-3">{r.checkIn}</td>
                    <td className="p-3">{r.checkOut}</td>
                    <td className="p-3">{nights}</td>
                    <td className="p-3 font-medium">${(nights * r.ratePerNight).toLocaleString()}</td>
                    <td className="p-3">
                      <Select value={r.status} onValueChange={v => updateStatus.mutate({ id: r.id, status: v as ReservationStatus })}>
                        <SelectTrigger className={cn("h-8 w-[140px]", RES_STATUS_META[r.status].className)}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["confirmed","checked_in","checked_out","cancelled"] as ReservationStatus[]).map(s => (
                            <SelectItem key={s} value={s}>{RES_STATUS_META[s].label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No reservations match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
