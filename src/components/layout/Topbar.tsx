import { Bell, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="h-16 border-b bg-card/60 backdrop-blur px-4 md:px-6 flex items-center gap-3 sticky top-0 z-10">
      <h1 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search guests, rooms…" className="pl-9 w-64 bg-background" />
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="w-4 h-4" />
        </Button>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" /> New booking
        </Button>
      </div>
    </header>
  );
}
