import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/site/AppShell";
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
  ShieldAlert,
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

  /* ── Page de connexion admin ── */
  if (!state.isAdmin) {
    return (
      <AppShell>
        <section className="mx-auto max-w-md px-4 sm:px-6 py-20">
          {/* Carte glassmorphism */}
          <div className="relative rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-20px_oklch(0_0_0/0.6)]">
            {/* Bande dorée supérieure */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-90" />

            {/* Halo d'ambiance doré en haut */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            <div className="relative p-8 sm:p-10">
              {/* Icône de verrou */}
              <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_30px_-5px_oklch(0.78_0.1_85/0.4)]">
                <Lock className="h-6 w-6" />
              </div>

              {/* Eyebrow */}
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-primary mb-3">
                <span className="w-4 h-px bg-primary inline-block" />
                Accès restreint
                <span className="w-4 h-px bg-primary inline-block" />
              </div>

              <h1 className="font-display text-3xl text-center">Espace Administrateur</h1>
              <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
                Accès réservé à l'équipe <span className="text-primary">Référence Location</span>.
              </p>

              {/* Alerte sécurité */}
              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
                <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ne partagez jamais votre mot de passe administrateur. Cet espace est réservé à
                  l'équipe interne.
                </p>
              </div>

              <form
                className="mt-6 grid gap-4"
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
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    Mot de passe
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    autoFocus
                    className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
                    placeholder="••••••••••"
                  />
                </div>

                {err && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    {err}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full mt-2 cursor-pointer shadow-gold hover:brightness-110 transition-all"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Se connecter
                </Button>
              </form>
            </div>

            {/* Bande dorée inférieure */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </section>
      </AppShell>
    );
  }

  /* ── Layout admin connecté ── */
  return (
    <AppShell>
      <Toaster richColors position="top-right" />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">

        {/* Header admin */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary mb-3">
              <span className="w-6 h-px bg-primary inline-block" />
              Administration
              <span className="w-6 h-px bg-primary inline-block" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl">
              Espace <span className="text-gradient-gold">Admin</span>
            </h1>
            <div className="h-0.5 mt-3 w-16 bg-gradient-to-r from-primary to-transparent rounded-full" />
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-2">
            {/* Bouton notifications */}
            <button
              onClick={() => { window.location.href = "/admin/reservations"; }}
              title="Notifications"
              className="relative inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 text-muted-foreground hover:text-primary"
            >
              <Bell className="h-4 w-4" />
              {newCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm animate-pulse">
                  {newCount > 9 ? "9+" : newCount}
                </span>
              )}
            </button>

            {/* Bouton déconnexion */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border/60 hover:border-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={() => setState((s) => ({ ...s, isAdmin: false }))}
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </div>

        {/* Navigation onglets */}
        <div className="relative mb-8">
          {/* Ligne de fond */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-border/60" />
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const active = pathname === t.to;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`
                    relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium
                    whitespace-nowrap transition-all duration-200 border-b-2 rounded-t-lg
                    ${active
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }
                  `}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                  {t.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center px-1 shadow-md animate-pulse">
                      {t.badge > 9 ? "9+" : t.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Contenu de l'onglet actif */}
        <div>
          <Outlet />
        </div>
      </section>
    </AppShell>
  );
}
