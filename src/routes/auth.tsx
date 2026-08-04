import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { claimAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Inloggen — Dennis Hagemeijer Fotografie" },
      { name: "description", content: "Beheerdersomgeving van Dennis Hagemeijer Fotografie." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Inloggen — Dennis Hagemeijer Fotografie" },
      { property: "og:description", content: "Beheerdersomgeving." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    try {
      await claimAdmin();
    } catch {
      // Admin already configured or bootstrap not applicable — ignore.
    }
    await navigate({ to: "/admin", replace: true });
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Inloggen mislukt: controleer je e-mailadres en wachtwoord.");
      return;
    }
    toast.success("Welkom terug.");
    await finish();
  };

  const signUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Kies een wachtwoord van minimaal 8 tekens.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      toast.info("Account aangemaakt. Log nu in.");
      return;
    }
    toast.success("Account aangemaakt.");
    await finish();
  };

  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold">Beheer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in om collecties, foto&apos;s en nieuws te beheren.
        </p>

        <Tabs defaultValue="login" className="mt-8">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">
              Inloggen
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Account aanmaken
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={signIn} className="space-y-4 pt-6">
              <Fields
                email={email}
                password={password}
                onEmail={setEmail}
                onPassword={setPassword}
              />
              <Button type="submit" className="w-full" disabled={busy}>
                Inloggen
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={signUp} className="space-y-4 pt-6">
              <Fields
                email={email}
                password={password}
                onEmail={setEmail}
                onPassword={setPassword}
              />
              <Button type="submit" className="w-full" disabled={busy}>
                Account aanmaken
              </Button>
              <p className="text-xs text-muted-foreground">
                Het eerste account krijgt automatisch beheerdersrechten.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Fields({
  email,
  password,
  onEmail,
  onPassword,
}: {
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => onEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Wachtwoord</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => onPassword(e.target.value)}
        />
      </div>
    </>
  );
}
