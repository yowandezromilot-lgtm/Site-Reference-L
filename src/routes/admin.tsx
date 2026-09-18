import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useApp, ADMIN_PASSWORD, formatAr, type Reservation } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  BarChart3,
  LogOut,
  Lock,
  Bell,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace Admin — Référence Location" },
      { name: "description", content: "Espace d'administration de Référence Location." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { state, setState } = useApp();
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Nombre de réservations en attente (badge rouge)
  const newCount = state.reservations.filter((r) => r.statut === "pending").length;

  // --- Notification en temps réel ---
  const prevResIds = useRef(new Set(state.reservations.map((r) => r.id)));
  const wasHydrated = useRef(state.hydrated);

  useEffect(() => {
    if (!state.isAdmin) return;

    // Skip notifications if we are just transitioning to hydrated state (initial load)
    const justHydrated = !wasHydrated.current && state.hydrated;
    wasHydrated.current = state.hydrated;

    // ── 1. Détection locale ─────────────────────
    const currentIds = new Set(state.reservations.map((r) => r.id));
    const newOnes = state.reservations.filter((r) => !prevResIds.current.has(r.id));

    if (newOnes.length > 0 && !justHydrated) {
      newOnes.forEach((r) => {
        const client = state.clients.find((c) => c.id === r.client_id);
        const vehicule = state.vehicules.find((v) => v.id === r.voiture_id);
        const clientName = client ? `${client.prenom} ${client.nom}` : "Un client";
        const vehiculeName = vehicule ? `${vehicule.marque} ${vehicule.modele}` : "un véhicule";

        toast.info(`🔔 Nouvelle réservation reçue !`, {
          description: `${clientName} a réservé ${vehiculeName} — ${formatAr(r.montant)}`,
          duration: 8000,
          action: {
            label: "Voir",
            onClick: () => {
              window.location.href = "/admin/reservations";
            },
          },
        });

        // Notification navigateur si autorisée
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("🔔 Nouvelle réservation — Référence Location", {
            body: `${clientName} a réservé ${vehiculeName}`,
            icon: "/logo.png",
          });
        }
      });
    }

    prevResIds.current = currentIds;
  }, [state.reservations, state.isAdmin, state.hydrated, state.clients, state.vehicules]);

  // ── 2. Supabase Realtime (si connecté) ──────────────────────────────
  useEffect(() => {
    if (!state.isAdmin || !supabase) return;

    const channel = supabase
      .channel("admin-reservations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservations" },
        (payload) => {
          const newRes = payload.new as unknown as Reservation;
          // La mise à jour du state local déclenchera l'effet ci-dessus
          setState((s) => {
            if (s.reservations.some((r) => r.id === newRes.id)) return s;
            return { ...s, reservations: [...s.reservations, newRes] };
          });
        },
      )
      .subscribe();

    // Demander la permission de notification navigateur
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [state.isAdmin, setState]);

  // Réinitialiser le badge quand l'admin visite l'onglet Réservations
  useEffect(() => {
    if (pathname === "/admin/reservations" && newCount > 0) {
      setState((s) => ({ ...s, newReservationsCount: 0 }));
    }
  }, [pathname, newCount, setState]);

  const tabs = [
    { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, badge: 0 },
    { to: "/admin/vehicules", label: "Véhicules", icon: Car, badge: 0 },
    { to: "/admin/reservations", label: "Réservations", icon: CalendarCheck, badge: newCount },
    { to: "/admin/clients", label: "Clients", icon: Users, badge: 0 },
    { to: "/admin/rapports", label: "Rapports", icon: BarChart3, badge: 0 },
  ] as const;

  if (!state.isAdmin) {
    return (
      <AppShell>
        <section className="mx-auto max-w-md px-4 sm:px-6 py-20">
          <Card className="border-primary/30" style={{ boxShadow: "var(--shadow-gold)" }}>
            <CardContent className="p-8">
              <div className="grid h-12 w-12 place-items-center rounded-md border border-primary/40 text-primary mx-auto">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="font-display text-2xl text-center mt-4">Espace Administrateur</h1>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Accès réservé à l'équipe Référence Location.
              </p>
              <form
                className="mt-6 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pwd === ADMIN_PASSWORD) {
                    setState((s) => ({ ...s, isAdmin: true }));
                    setErr("");
                  } else {
                    setErr("Mot de passe incorrect.");
                  }
                }}
              >
                <Label>Mot de passe</Label>
                <Input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoFocus
                />
                {err && <div className="text-xs text-destructive">{err}</div>}
                <Button type="submit" className="mt-2">
                  Se connecter
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Toaster richColors position="top-right" />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Administration</p>
            <h1 className="font-display text-4xl mt-2">Espace Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => {
                window.location.href = "/admin/reservations";
              }}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {newCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm">
                  {newCount > 9 ? "9+" : newCount}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState((s) => ({ ...s, isAdmin: false }))}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>

        <div className="mt-8 border-b border-border/60 flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm border-b-2 whitespace-nowrap transition-colors ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center px-1 shadow-md">
                    {t.badge > 9 ? "9+" : t.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </section>
    </AppShell>
  );
}
