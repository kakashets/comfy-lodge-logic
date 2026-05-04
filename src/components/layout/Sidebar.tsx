import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarRange, BedDouble, Users, Sparkles, BarChart3, Hotel, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const baseItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/calendar", label: "Tape chart", icon: CalendarRange },
  { to: "/rooms", label: "Rooms", icon: BedDouble },
  { to: "/reservations", label: "Reservations", icon: CalendarRange },
  { to: "/guests", label: "Guests", icon: Users },
  { to: "/housekeeping", label: "Housekeeping", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const { role } = useAuth();
  const items = role === "admin" ? [...baseItems, { to: "/team", label: "Team", icon: Shield }] : baseItems;

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 h-16 flex items-center gap-2 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
          <Hotel className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sidebar-accent-foreground font-semibold leading-tight">Aurelia</div>
          <div className="text-xs opacity-70">Hotel Manager</div>
        </div>
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {items.map(({ to, label, icon: Icon, end }: any) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border text-xs opacity-70">
        20 rooms · 5 floors
      </div>
    </aside>
  );
}
