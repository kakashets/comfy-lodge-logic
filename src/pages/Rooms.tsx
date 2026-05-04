import { AppShell } from "@/components/layout/AppShell";
import { useRooms, useReservations, useGuests, guestById } from "@/hooks/use-hotel";
import { STATUS_META } from "@/lib/hotel-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, Loader2 } from "lucide-react";

const today = new Date().toISOString().slice(0, 10);

export default function Rooms() {
  const { data: rooms = [], isLoading } = useRooms();
  const { data: reservations = [] } = useReservations();
  const { data: guests = [] } = useGuests();

  if (isLoading) return <AppShell title="Rooms"><div className="grid place-items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></AppShell>;

  const byFloor = rooms.reduce<Record<number, typeof rooms>>((acc, r) => {
    (acc[r.floor] ||= []).push(r); return acc;
  }, {});
  const floors = Object.keys(byFloor).map(Number).sort((a, b) => a - b);

  return (
    <AppShell title="Rooms">
      <div className="space-y-8">
        {floors.map(floor => (
          <section key={floor}>
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Floor {floor}</h2>
              <span className="text-xs text-muted-foreground">{byFloor[floor].length} rooms</span>
            </div>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {byFloor[floor].map(room => {
                const meta = STATUS_META[room.status];
                const currentRes = reservations.find(r => r.roomNumber === room.number && r.status === "checked_in" && r.checkIn <= today && r.checkOut >= today);
                const guest = currentRes ? guestById(guests, currentRes.guestId) : null;
                return (
                  <Card key={room.number} className="p-4 shadow-soft hover:shadow-elevated transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-2xl font-semibold tracking-tight">{room.number}</div>
                        <div className="text-xs text-muted-foreground">{room.type}</div>
                      </div>
                      <span className={cn("status-dot mt-2", meta.dot)} />
                    </div>
                    <Badge variant="outline" className={cn("mt-3", meta.className)}>{meta.label}</Badge>
                    <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Up to {room.capacity} · ${room.rate}/night
                    </div>
                    {guest && (
                      <div className="mt-3 pt-3 border-t text-xs">
                        <div className="text-muted-foreground">Current guest</div>
                        <div className="font-medium truncate">{guest.name}</div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
