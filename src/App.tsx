import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AuthGate } from "@/components/AuthGate";
import Dashboard from "./pages/Dashboard";
import CalendarView from "./pages/CalendarView";
import Rooms from "./pages/Rooms";
import Reservations from "./pages/Reservations";
import Guests from "./pages/Guests";
import Housekeeping from "./pages/Housekeeping";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AuthGate><Dashboard /></AuthGate>} />
            <Route path="/calendar" element={<AuthGate><CalendarView /></AuthGate>} />
            <Route path="/rooms" element={<AuthGate><Rooms /></AuthGate>} />
            <Route path="/reservations" element={<AuthGate><Reservations /></AuthGate>} />
            <Route path="/guests" element={<AuthGate><Guests /></AuthGate>} />
            <Route path="/housekeeping" element={<AuthGate><Housekeeping /></AuthGate>} />
            <Route path="/reports" element={<AuthGate><Reports /></AuthGate>} />
            <Route path="/team" element={<AuthGate><Team /></AuthGate>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
