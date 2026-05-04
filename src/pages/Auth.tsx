import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hotel, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (!loading && user) return <Navigate to="/" replace />;

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    navigate("/");
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/`, data: { display_name: name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email to verify, then sign in.");
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md p-8 shadow-elevated">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Hotel className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold text-lg leading-tight">Aurelia</div>
            <div className="text-xs text-muted-foreground">Hotel Manager</div>
          </div>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-3 mt-4">
              <div><Label>Email</Label><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Sign in
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-3 mt-4">
              <div><Label>Display name</Label><Input required value={name} onChange={e => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create account
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                The first account becomes admin. New accounts after that need approval.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
