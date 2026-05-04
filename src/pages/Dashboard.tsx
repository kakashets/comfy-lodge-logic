import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReservations, useGuests, useRooms, guestById } from "@/hooks/use-hotel";
import { RES_STATUS_META, STATUS_META, nightsBetween } from "@/lib/hotel-data";
import { ArrowDownToLine, ArrowUpFromLine, BedDouble, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);

function StatCard({ icon: Icon, label, value, hint, accent }: { icon: any; label: string; value: string; hint?: string; accent?: string }) {
  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-2xl font-semibold mt-1">{value}</div>
            {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
          </div>
          <div className={cn("w-10 h-10 rounded-lg grid place-items-center", accent ?? "bg-accent/15 text-accent")}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: reservations = [], isLoading: l1 } = useReservations();
  const { data: guests = [], isLoading: l2 } = useGuests();
  const { data: rooms = [], isLoading: l3 } = useRooms();

  if (l1 || l2 || l3) {
    return <AppShell title="Dashboard"><div className="grid place-items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></AppShell>;
  }

  const arrivals = reservations.filter(r => r.checkIn === today);
  const departures = reservations.filter(r => r.checkOut === today);
  const inHouse = reservations.filter(r => r.status === "checked_in");
  const occupancy = rooms.length ? Math.round((inHouse.length / rooms.length) * 100) : 0;
  const todayRevenue = inHouse.reduce((s, r) => s + r.ratePerNight, 0);

  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} label="Occupancy today" value={`${occupancy}%`} hint={`${inHouse.length} of ${rooms.length} rooms`} />
        <StatCard icon={ArrowDownToLine} label="Arrivals" value={String(arrivals.length)} hint="Expected today" accent="bg-info/15 text-info" />
        <StatCard icon={ArrowUpFromLine} label="Departures" value={String(departures.length)} hint="Checking out today" accent="bg-booked/15 text-booked" />
        <StatCard icon={DollarSign} label="Revenue today" value={`$${todayRevenue.toLocaleString()}`} hint="Room revenue" accent="bg-success/15 text-success" />
      </div>

      <div className="grid gap-4 mt-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader className="pb-3"><CardTitle className="text-base">Today's arrivals</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {arrivals.length === 0 && <p className="text-sm text-muted-foreground">No arrivals scheduled.</p>}
            {arrivals.map(r => {
              const g = guestById(guests, r.guestId);
              return (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div>
                    <div className="font-medium">{g?.name ?? "—"} {g?.vip && <Badge className="ml-1 bg-accent text-accent-foreground">VIP</Badge>}</div>
                    <div className="text-xs text-muted-foreground">Room {r.roomNumber} · {nightsBetween(r.checkIn, r.checkOut)} nights · {r.adults}A {r.children}C</div>
                  </div>
                  <Badge variant="outline" className={RES_STATUS_META[r.status].className}>{RES_STATUS_META[r.status].label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3"><CardTitle className="text-base">In-house guests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {inHouse.length === 0 && <p className="text-sm text-muted-foreground">No guests in house.</p>}
            {inHouse.map(r => {
              const g = guestById(guests, r.guestId);
              return (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-primary/10 text-primary grid place-items-center text-sm font-semibold">{r.roomNumber}</div>
                    <div>
                      <div className="font-medium">{g?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">Until {r.checkOut}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">${r.ratePerNight}/night</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft mt-6">
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><BedDouble className="w-4 h-4" /> Room status overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(["available","occupied","reserved","dirty","out_of_order"] as const).map(s => {
              const count = rooms.filter(r => r.status === s).length;
              const meta = STATUS_META[s];
              return (
                <div key={s} className="rounded-lg border p-3 bg-background">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn("status-dot", meta.dot)} /> {meta.label}
                  </div>
                  <div className="text-2xl font-semibold mt-1">{count}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
