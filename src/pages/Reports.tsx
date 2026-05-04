import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRooms, useReservations } from "@/hooks/use-hotel";
import { nightsBetween } from "@/lib/hotel-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { Loader2 } from "lucide-react";

function addDays(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

export default function Reports() {
  const { data: rooms = [], isLoading: l1 } = useRooms();
  const { data: reservations = [], isLoading: l2 } = useReservations();

  if (l1 || l2) return <AppShell title="Reports"><div className="grid place-items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></AppShell>;

  const days = Array.from({ length: 14 }, (_, i) => addDays(i - 3));
  const occData = days.map(d => {
    const occupied = reservations.filter(r => r.checkIn <= d && r.checkOut > d && r.status !== "cancelled").length;
    return { date: d.slice(5), occupancy: rooms.length ? Math.round((occupied / rooms.length) * 100) : 0, rooms: occupied };
  });

  const revByType: Record<string, number> = {};
  reservations.forEach(r => {
    const room = rooms.find(rm => rm.number === r.roomNumber);
    if (!room) return;
    revByType[room.type] = (revByType[room.type] || 0) + nightsBetween(r.checkIn, r.checkOut) * r.ratePerNight;
  });
  const revData = Object.entries(revByType).map(([type, revenue]) => ({ type, revenue }));

  const totalRevenue = Object.values(revByType).reduce((a, b) => a + b, 0);
  const totalNights = Math.max(1, reservations.reduce((a, r) => a + nightsBetween(r.checkIn, r.checkOut), 0));
  const adr = Math.round(totalRevenue / totalNights);
  const avgOcc = Math.round(occData.reduce((a, x) => a + x.occupancy, 0) / occData.length);

  return (
    <AppShell title="Reports">
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <KPI label="Total revenue (period)" value={`$${totalRevenue.toLocaleString()}`} />
        <KPI label="Average daily rate (ADR)" value={`$${adr}`} />
        <KPI label="Average occupancy" value={`${avgOcc}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Occupancy — 14 days</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <LineChart data={occData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="occupancy" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Revenue by room type</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={revData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft mt-4">
        <CardHeader><CardTitle className="text-base">Rate sheet</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-2">Room</th><th className="text-left p-2">Type</th><th className="text-left p-2">Capacity</th><th className="text-right p-2">Rate / night</th></tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.number} className="border-t">
                  <td className="p-2 font-semibold">{r.number}</td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2">{r.capacity}</td>
                  <td className="p-2 text-right font-medium">${r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
