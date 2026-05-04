import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { guests, reservations } from "@/lib/hotel-data";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Guests() {
  const [q, setQ] = useState("");
  const filtered = guests.filter(g =>
    !q || g.name.toLowerCase().includes(q.toLowerCase()) || g.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppShell title="Guests">
      <Input placeholder="Search guests…" value={q} onChange={e => setQ(e.target.value)} className="md:w-80 mb-4" />
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
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {g.email}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {g.phone}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {g.country}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
