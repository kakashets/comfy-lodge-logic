import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Hotel, Loader2 } from "lucide-react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;

  if (!role) {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-background">
        <Card className="max-w-md p-8 text-center shadow-elevated">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary text-primary-foreground grid place-items-center mb-4">
            <Hotel className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold">Awaiting access</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Your account has been created, but an administrator hasn't granted you access yet.
            Please contact your hotel administrator.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
