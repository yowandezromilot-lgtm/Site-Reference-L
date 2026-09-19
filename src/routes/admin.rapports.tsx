import { createFileRoute } from "@tanstack/react-router";
import { useApp, formatAr } from "@/lib/store";
import { RotateCcw, TrendingUp, Wallet, CheckCircle2, Car } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rapports")({
  component: AdminRapports,
});

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function AdminRapports() {
  const { state, setState } = useApp();
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const byMonth = MOIS.map((_, i) => {
    const prefix = `${year}-${String(i + 1).padStart(2, "0")}`;
    return state.reservations
      .filter(
        (r) => (r.statut === "confirmed" || r.statut === "done") && r.created_at.startsWith(prefix),
      )
      .reduce((s, r) => s + r.montant, 0);
  });

  const total = byMonth.reduce((s, n) => s + n, 0);
  const maxMonth = Math.max(1, ...byMonth);
  const nbDone = state.reservations.filter((r) => r.statut === "done").length;
  const occupied = state.vehicules.filter((v) => !v.disponible).length;
  const occupRate = Math.round((occupied / Math.max(1, state.vehicules.length)) * 100);

  const ranking = [...state.vehicules]
    .map((v) => ({
      ...v,
      count: state.reservations.filter(
        (r) => r.voiture_id === v.id && (r.statut === "confirmed" || r.statut === "done"),
      ).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxRank = Math.max(1, ...ranking.map((r) => r.count));

  const resetRapportsData = () => {
    if (!confirm("Voulez-vous effacer tout l'historique de démonstration des réservations pour repartir de 0 Ar ?"))
      return;
    setState((s) => ({ ...s, reservations: [] }));
    toast.success("Historique des réservations réinitialisé à zéro.");
  };

  const stats = [
    { icon: Wallet, label: "Revenus annuels", value: formatAr(total), accent: true },
    { icon: TrendingUp, label: "Moyenne mensuelle", value: formatAr(Math.round(total / 12)), accent: false },
    { icon: CheckCircle2, label: "Locations terminées", value: nbDone, accent: false },
    { icon: Car, label: "Taux d'occupation", value: `${occupRate} %`, accent: false },
  ] as const;

  return (
    <div className="grid gap-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl">Rapports &amp; Statistiques</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vue d'ensemble des revenus et performances de votre parc
          </p>
        </div>
        <button
          onClick={resetRapportsData}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border/60 hover:border-border rounded-xl px-4 py-2 bg-card/40 hover:bg-card/70 transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Réinitialiser l'historique
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`
              relative rounded-2xl border overflow-hidden transition-all duration-300
              hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-10px_oklch(0_0_0/0.4)]
              ${s.accent ? "border-primary/30 bg-card/80" : "border-border/50 bg-card/60"}
              backdrop-blur-sm
            `}
          >
            <div className={`h-0.5 w-full ${s.accent ? "bg-gradient-to-r from-transparent via-primary to-transparent" : "bg-gradient-to-r from-transparent via-border to-transparent"}`} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </span>
                <span className={`grid place-items-center h-8 w-8 rounded-xl border ${s.accent ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"}`}>
                  <s.icon className="h-4 w-4" />
                </span>
              </div>
              <div className={`font-display text-2xl font-bold ${s.accent ? "text-gradient-gold" : "text-foreground"}`}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique revenus mensuels */}
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="grid place-items-center h-7 w-7 rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <h2 className="font-display text-xl">Revenus mensuels {year}</h2>
          </div>

          <div className="grid grid-cols-12 gap-2 h-52 items-end">
            {byMonth.map((val, i) => {
              const isCurrentMonth = i === currentMonth;
              const heightPct = (val / maxMonth) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-2 group/bar">
                  {/* Tooltip valeur */}
                  {val > 0 && (
                    <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity text-[9px] text-primary font-medium text-center leading-tight whitespace-nowrap">
                      {(val / 1000).toFixed(0)}k
                    </div>
                  )}
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-lg transition-all duration-500 group-hover/bar:brightness-125"
                      style={{
                        height: `${heightPct}%`,
                        minHeight: val > 0 ? "8px" : "3px",
                        background: val > 0
                          ? "var(--gradient-gold)"
                          : "oklch(0.3 0.008 60)",
                        opacity: val > 0 ? (isCurrentMonth ? 1 : 0.7) : 0.2,
                        boxShadow: val > 0 ? "0 0 12px -3px oklch(0.78 0.1 85 / 0.4)" : "none",
                      }}
                    />
                  </div>
                  <div className={`text-[9px] uppercase tracking-wider ${isCurrentMonth ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {MOIS[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Classement véhicules */}
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="grid place-items-center h-7 w-7 rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Car className="h-3.5 w-3.5" />
            </div>
            <h2 className="font-display text-xl">Véhicules les plus loués</h2>
          </div>

          <div className="space-y-5">
            {ranking.map((v, i) => (
              <div key={v.id}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="flex items-center gap-3">
                    {/* Rang */}
                    <span className={`text-[11px] font-bold w-5 text-center ${i === 0 ? "text-gradient-gold" : "text-muted-foreground/50"}`}>
                      #{i + 1}
                    </span>
                    {v.image_url ? (
                      <img
                        src={v.image_url}
                        alt=""
                        className="w-12 h-8 object-cover rounded-lg shadow-sm border border-border/50 shrink-0"
                      />
                    ) : (
                      <span className="w-12 h-8 flex items-center justify-center text-xl bg-muted/40 rounded-lg shrink-0 border border-border/40">
                        {v.emoji}
                      </span>
                    )}
                    <span className="font-medium">
                      {v.marque} {v.modele}
                    </span>
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {v.count} location{v.count > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden border border-border/30">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(v.count / maxRank) * 100}%`,
                      background: "var(--gradient-gold)",
                      opacity: 0.6 + (v.count / maxRank) * 0.4,
                      boxShadow: "0 0 8px -2px oklch(0.78 0.1 85 / 0.5)",
                    }}
                  />
                </div>
              </div>
            ))}

            {ranking.every((v) => v.count === 0) && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aucune location enregistrée pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
