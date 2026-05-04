import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRooms, useUpdateRoomStatus } from "@/hooks/use-hotel";
import { STATUS_META, RoomStatus } from "@/lib/hotel-data";
import { cn } from "@/lib/utils";
import { Sparkles, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function Housekeeping() {
  const { data: rooms = [], isLoading } = useRooms();
  const update = useUpdateRoomStatus();

  const counts = (s: RoomStatus) => rooms.filter(r => r.status === s).length;

  return (
    <AppShell title="Housekeeping">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <Stat icon={CheckCircle2} label="Clean & ready" value={counts("available")} tone="text-success" />
        <Stat icon={Sparkles} label="Needs cleaning" value={counts("dirty")} tone="text-warning" />
        <Stat icon={Sparkles} label="Occupied" value={counts("occupied")} tone="text-info" />
        <Stat icon={AlertTriangle} label="Out of order" value={counts("out_of_order")} tone="text-destructive" />
      </div>

      <Card className="shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3 font-medium">Room</th>
                <th className="text-left p-3 font-medium">Floor</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></td></tr>}
              {rooms.map(r => {
                const meta = STATUS_META[r.status];
                return (
                  <tr key={r.number} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-semibold">{r.number}</td>
                    <td className="p-3 text-muted-foreground">Floor {r.floor}</td>
                    <td className="p-3">{r.type}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={cn(meta.className)}>
                        <span className={cn("status-dot mr-1.5", meta.dot)} />{meta.label}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="sm" variant="outline" disabled={update.isPending} onClick={() => update.mutate({ number: r.number, status: "available" })}>Clean</Button>
                      <Button size="sm" variant="outline" disabled={update.isPending} onClick={() => update.mutate({ number: r.number, status: "dirty" })}>Dirty</Button>
                      <Button size="sm" variant="outline" disabled={update.isPending} onClick={() => update.mutate({ number: r.number, status: "out_of_order" })}>OOO</Button>
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

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5", tone)} />
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </Card>
  );
}
