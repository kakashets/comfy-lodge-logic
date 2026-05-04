import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { reservations, guestById, RES_STATUS_META, nightsBetween, ReservationStatus } from "@/lib/hotel-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const FILTERS: (ReservationStatus | "all")[] = ["all", "confirmed", "checked_in", "checked_out", "cancelled"];

export default function Reservations() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");

  const filtered = reservations.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (!q) return true;
    const g = guestById(r.guestId)!;
    return g.name.toLowerCase().includes(q.toLowerCase()) || r.roomNumber.includes(q);
  });

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
              {filtered.map(r => {
                const g = guestById(r.guestId)!;
                const nights = nightsBetween(r.checkIn, r.checkOut);
                return (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      <div className="font-medium">{g.name}</div>
                      <div className="text-xs text-muted-foreground">{g.email}</div>
                    </td>
                    <td className="p-3 font-semibold">{r.roomNumber}</td>
                    <td className="p-3">{r.checkIn}</td>
                    <td className="p-3">{r.checkOut}</td>
                    <td className="p-3">{nights}</td>
                    <td className="p-3 font-medium">${(nights * r.ratePerNight).toLocaleString()}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={cn(RES_STATUS_META[r.status].className)}>{RES_STATUS_META[r.status].label}</Badge>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No reservations match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
