import { Bell, Search, Plus, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarRange, BedDouble, Users, Sparkles, BarChart3, Hotel } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/calendar", label: "Tape chart", icon: CalendarRange },
  { to: "/rooms", label: "Rooms", icon: BedDouble },
  { to: "/reservations", label: "Reservations", icon: CalendarRange },
  { to: "/guests", label: "Guests", icon: Users },
  { to: "/housekeeping", label: "Housekeeping", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export function Topbar({ title }: { title: string }) {
  return (
    <header className="h-16 border-b bg-card/60 backdrop-blur px-4 md:px-6 flex items-center gap-3 sticky top-0 z-10">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar text-sidebar-foreground">
          <div className="px-5 h-16 flex items-center gap-2 border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sidebar-accent-foreground font-semibold leading-tight">Aurelia</div>
              <div className="text-xs opacity-70">Hotel Manager</div>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {items.map(({ to, label, icon: Icon, end }) => (
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
        </SheetContent>
      </Sheet>
      <h1 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search guests, rooms…" className="pl-9 w-64 bg-background" />
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="w-4 h-4" />
        </Button>
        <Button className="gap-2 bg-primary hover:bg-primary/90 hidden sm:inline-flex">
          <Plus className="w-4 h-4" /> New booking
        </Button>
        <Button size="icon" className="sm:hidden bg-primary hover:bg-primary/90" aria-label="New booking">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
