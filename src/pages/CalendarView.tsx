import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useReservations, useRooms, useGuests, guestById } from "@/hooks/use-hotel";
import { nightsBetween } from "@/lib/hotel-data";
import { cn } from "@/lib/utils";

const DAYS = 14;

function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function fmt(d: Date) { return d.toISOString().slice(0, 10); }
function dayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

export default function CalendarView() {
  const [start, setStart] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; });
  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => addDays(start, i)), [start]);
  const startMs = +addDays(start, 0);
  const today = fmt(new Date());

  const { data: rooms = [], isLoading: l1 } = useRooms();
  const { data: reservations = [], isLoading: l2 } = useReservations();
  const { data: guests = [] } = useGuests();

  const sortedRooms = [...rooms].sort((a, b) => a.floor - b.floor || a.number.localeCompare(b.number));

  return (
    <AppShell title="Tape chart">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setStart(addDays(start, -7))}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setStart(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => setStart(addDays(start, 7))}><ChevronRight className="w-4 h-4" /></Button>
          <span className="ml-3 text-sm text-muted-foreground hidden sm:inline">{fmt(days[0])} → {fmt(days[DAYS-1])}</span>
        </div>
      </div>

      {(l1 || l2) ? (
        <div className="grid place-items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
      <div className="rounded-lg border bg-card overflow-auto shadow-soft">
        <div className="min-w-[900px]">
          <div className="grid sticky top-0 z-10 bg-card border-b" style={{ gridTemplateColumns: `120px repeat(${DAYS}, minmax(72px, 1fr))` }}>
            <div className="p-3 text-xs font-medium text-muted-foreground">Room</div>
            {days.map(d => (
              <div key={+d} className={cn("p-2 text-center text-xs border-l", fmt(d) === today && "bg-accent/10 text-accent-foreground font-semibold")}>
                {dayLabel(d)}
              </div>
            ))}
          </div>

          {sortedRooms.map(room => {
            const roomRes = reservations.filter(r => r.roomNumber === room.number && r.status !== "cancelled");
            return (
              <div key={room.number} className="grid border-b last:border-b-0 relative" style={{ gridTemplateColumns: `120px repeat(${DAYS}, minmax(72px, 1fr))` }}>
                <div className="p-3 border-r bg-background/50">
                  <div className="text-sm font-semibold">{room.number}</div>
                  <div className="text-[11px] text-muted-foreground">{room.type}</div>
                </div>
                {days.map(d => (
                  <div key={+d} className={cn("h-14 border-l", fmt(d) === today && "bg-accent/5")} />
                ))}

                {roomRes.map(r => {
                  const ci = +new Date(r.checkIn);
                  const co = +new Date(r.checkOut);
                  const offset = Math.max(0, Math.round((ci - startMs) / 86400000));
                  const span = Math.max(1, Math.round((co - Math.max(ci, startMs)) / 86400000));
                  if (offset >= DAYS || co <= startMs) return null;
                  const visibleSpan = Math.min(span, DAYS - offset);
                  const g = guestById(guests, r.guestId);
                  const color =
                    r.status === "checked_in" ? "bg-info text-info-foreground" :
                    r.status === "confirmed" ? "bg-booked text-booked-foreground" :
                    "bg-muted-foreground/30 text-foreground";
                  return (
                    <div
                      key={r.id}
                      title={`${g?.name ?? ""} · ${r.checkIn} → ${r.checkOut}`}
                      className={cn("absolute top-2 h-10 rounded-md px-2 text-xs flex items-center font-medium shadow-soft cursor-pointer hover:brightness-110 transition", color)}
                      style={{
                        left: `calc(120px + (100% - 120px) * ${offset} / ${DAYS} + 4px)`,
                        width: `calc((100% - 120px) * ${visibleSpan} / ${DAYS} - 8px)`,
                      }}
                    >
                      <span className="truncate">{g?.name ?? "Guest"} · {nightsBetween(r.checkIn, r.checkOut)}n</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      )}
    </AppShell>
  );
}
