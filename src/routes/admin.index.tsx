import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp, formatAr, STATUT_LABEL, type ReservationStatut } from "@/lib/store";
import {
  CalendarCheck,
  Wallet,
  Car,
  Users,
  Check,
  X,
  RotateCcw,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const statutConfig: Record<
  ReservationStatut,
  { bg: string; border: string; text: string; dot: string }
> = {
  pending: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    dot: "bg-yellow-400 animate-pulse",
  },
  confirmed: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    dot: "bg-primary animate-pulse",
  },
  done: {
    bg: "bg-muted/50",
    border: "border-border/50",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  cancelled: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    dot: "bg-destructive",
  },
};

function AdminDashboard() {
  const { state, setState } = useApp();
  const [onlyPending, setOnlyPending] = useState(false);

  const month = new Date().toISOString().slice(0, 7);
  const monthRevenue = state.reservations
    .filter(
      (r) => (r.statut === "confirmed" || r.statut === "done") && r.created_at.startsWith(month),
    )
    .reduce((s, r) => s + r.montant, 0);

  const resetMonthRevenue = () => {
    if (!confirm("Voulez-vous réinitialiser à 0 Ar les revenus du mois en cours ?")) return;
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthIso = prevMonthDate.toISOString().slice(0, 10);

    setState((s) => ({
      ...s,
      reservations: s.reservations.map((r) => {
        if (r.created_at.startsWith(month)) {
          return { ...r, created_at: prevMonthIso };
        }
        return r;
      }),
    }));
    toast.success("Revenus du mois réinitialisés à 0 Ar.");
  };

  const stats = [
    {
      icon: CalendarCheck,
      label: "Réservations actives",
      value: state.reservations.filter((r) => r.statut === "confirmed" || r.statut === "pending")
        .length,
      sub: "confirmées + en attente",
      isRevenue: false,
      accent: false,
    },
    {
      icon: Wallet,
      label: "Revenus du mois",
      value: formatAr(monthRevenue),
      sub: new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" }),
      isRevenue: true,
      accent: true,
    },
    {
      icon: Car,
      label: "Véhicules disponibles",
      value: `${state.vehicules.filter((v) => v.disponible).length} / ${state.vehicules.length}`,
      sub: "sur le total du parc",
      isRevenue: false,
      accent: false,
    },
    {
      icon: Users,
      label: "Clients enregistrés",
      value: state.clients.length,
      sub: "comptes actifs",
      isRevenue: false,
      accent: false,
    },
  ] as const;

  const recent = [...state.reservations]
    .filter((r) => !onlyPending || r.statut === "pending")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8);

  const updateStatut = (id: string, statut: ReservationStatut) => {
    setState((s) => ({
      ...s,
      reservations: s.reservations.map((r) => (r.id === id ? { ...r, statut } : r)),
    }));
    toast.success(`${id} → ${STATUT_LABEL[statut]}`);
  };

  return (
    <div className="grid gap-8">

      {/* ── KPI cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`
              group relative rounded-2xl border overflow-hidden transition-all duration-300
              hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-10px_oklch(0_0_0/0.4)]
              ${s.accent
                ? "border-primary/30 bg-card/80"
                : "border-border/50 bg-card/60"
              }
              backdrop-blur-sm
            `}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* Bande supérieure colorée */}
            <div
              className={`h-0.5 w-full ${
                s.accent
                  ? "bg-gradient-to-r from-transparent via-primary to-transparent"
                  : "bg-gradient-to-r from-transparent via-border to-transparent"
              }`}
            />

            <div className="p-5">
              <div className="flex items-start justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground leading-tight">
                  {s.label}
                </span>
                <div className="flex items-center gap-1">
                  {s.isRevenue && (
                    <button
                      onClick={resetMonthRevenue}
                      title="Réinitialiser les revenus du mois à 0 Ar"
                      className="grid place-items-center h-6 w-6 rounded-lg hover:bg-muted/60 text-muted-foreground/50 hover:text-muted-foreground transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <span
                    className={`grid place-items-center h-8 w-8 rounded-xl border ${
                      s.accent
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border/60 bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                  </span>
                </div>
              </div>

              <div
                className={`font-display text-2xl mt-3 font-bold ${
                  s.accent ? "text-gradient-gold" : "text-foreground"
                }`}
              >
                {s.value}
              </div>
              <div className="text-[11px] text-muted-foreground/60 mt-1">{s.sub}</div>
            </div>

            {/* Halo hover */}
            {s.accent && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,oklch(0.78_0.1_85/0.06),transparent_70%)]" />
            )}
          </div>
        ))}
      </div>

      {/* ── Tableau réservations récentes ── */}
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
        {/* Bande dorée */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Entête du bloc */}
        <div className="p-5 sm:p-6 border-b border-border/60 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="grid place-items-center h-7 w-7 rounded-lg border border-primary/30 bg-primary/10 text-primary">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <h2 className="font-display text-xl">Réservations récentes</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Validez ou annulez les demandes entrantes.
            </p>
          </div>
          <Button
            size="sm"
            variant={onlyPending ? "default" : "outline"}
            className={`gap-2 transition-all ${
              onlyPending
                ? "shadow-gold"
                : "border-border/60 hover:border-primary/40"
            }`}
            onClick={() => setOnlyPending((v) => !v)}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {onlyPending ? "Tout afficher" : "À traiter uniquement"}
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Réf.
                </th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Véhicule
                </th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Dates
                </th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Lieu
                </th>
                <th className="text-right px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Montant
                </th>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Statut
                </th>
                <th className="text-right px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => {
                const c = state.clients.find((x) => x.id === r.client_id);
                const v = state.vehicules.find((x) => x.id === r.voiture_id);
                const sc = statutConfig[r.statut];
                return (
                  <tr
                    key={r.id}
                    className="border-b border-border/40 hover:bg-primary/[0.03] transition-colors group"
                  >
                    {/* Réf */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {r.id}
                      </span>
                    </td>

                    {/* Client */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {c?.photo_url ? (
                          <img
                            src={c.photo_url}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 border border-primary/20">
                            {c?.prenom?.[0]?.toUpperCase()}
                            {c?.nom?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-sm">
                          {c?.prenom} {c?.nom}
                        </span>
                      </div>
                    </td>

                    {/* Véhicule */}
                    <td className="px-5 py-3.5 text-sm">
                      {v?.marque} {v?.modele}
                    </td>

                    {/* Dates */}
                    <td className="px-5 py-3.5 text-muted-foreground text-sm whitespace-nowrap">
                      {r.date_depart} → {r.date_retour}
                    </td>

                    {/* Lieu */}
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <div className="flex flex-col text-xs gap-0.5">
                        <span className="text-foreground/80">
                          <span className="text-[10px] text-muted-foreground mr-1">Départ:</span>
                          {r.lieu_prise}
                        </span>
                        {r.lieu_retour && r.lieu_retour !== r.lieu_prise && (
                          <span className="text-foreground/80">
                            <span className="text-[10px] text-muted-foreground mr-1">Retour:</span>
                            {r.lieu_retour}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Montant */}
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-display font-bold text-gradient-gold text-sm">
                        {formatAr(r.montant)}
                      </span>
                    </td>

                    {/* Statut badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 border ${sc.bg} ${sc.border} ${sc.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {STATUT_LABEL[r.statut]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        {r.statut === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatut(r.id, "confirmed")}
                              title="Confirmer"
                              className="grid place-items-center h-8 w-8 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateStatut(r.id, "cancelled")}
                              title="Annuler"
                              className="grid place-items-center h-8 w-8 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/50 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {r.statut === "confirmed" && (
                          <button
                            onClick={() => updateStatut(r.id, "done")}
                            className="text-xs px-3 h-8 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted/70 transition-all text-muted-foreground hover:text-foreground"
                          >
                            Terminer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {recent.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground">
                    <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Rien à traiter pour l'instant.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
