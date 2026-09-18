import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp, formatAr, STATUT_LABEL, type ReservationStatut } from "@/lib/store";
import { CalendarCheck, Wallet, Car, Users, Check, X, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

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
      isRevenue: false,
    },
    {
      icon: Wallet,
      label: "Revenus du mois",
      value: formatAr(monthRevenue),
      isRevenue: true,
    },
    {
      icon: Car,
      label: "Véhicules dispo / total",
      value: `${state.vehicules.filter((v) => v.disponible).length} / ${state.vehicules.length}`,
      isRevenue: false,
    },
    {
      icon: Users,
      label: "Clients",
      value: state.clients.length,
      isRevenue: false,
    },
  ];

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60 relative group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {s.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {s.isRevenue && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-60 hover:opacity-100 text-muted-foreground hover:text-foreground"
                      onClick={resetMonthRevenue}
                      title="Réinitialiser les revenus du mois à 0 Ar"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="font-display text-2xl text-foreground mt-3">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="p-5 border-b border-border/60 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl">Réservations récentes</h2>
              <p className="text-sm text-muted-foreground">
                Validez ou annulez les demandes entrantes.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={onlyPending ? "default" : "outline"}
                onClick={() => setOnlyPending((v) => !v)}
              >
                {onlyPending ? "Tout afficher" : "À traiter uniquement"}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="text-left px-5 py-3">Réf.</th>
                  <th className="text-left px-5 py-3">Client</th>
                  <th className="text-left px-5 py-3">Véhicule</th>
                  <th className="text-left px-5 py-3">Dates</th>
                  <th className="text-left px-5 py-3">Lieu</th>
                  <th className="text-right px-5 py-3">Montant</th>
                  <th className="text-left px-5 py-3">Statut</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const c = state.clients.find((x) => x.id === r.client_id);
                  const v = state.vehicules.find((x) => x.id === r.voiture_id);
                  return (
                    <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-primary">{r.id}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {c?.photo_url ? (
                            <img
                              src={c.photo_url}
                              alt=""
                              className="h-6 w-6 rounded-full object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium shrink-0">
                              {c?.prenom?.[0]?.toUpperCase()}
                              {c?.nom?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium">
                            {c?.prenom} {c?.nom}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {v?.marque} {v?.modele}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {r.date_depart} → {r.date_retour}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        <div className="flex flex-col text-xs gap-0.5">
                          <span className="text-foreground/80">
                            <span className="text-[10px] text-muted-foreground mr-1">Départ:</span>
                            {r.lieu_prise}
                          </span>
                          {r.lieu_retour && r.lieu_retour !== r.lieu_prise && (
                            <span className="text-foreground/80">
                              <span className="text-[10px] text-muted-foreground mr-1">
                                Retour:
                              </span>
                              {r.lieu_retour}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">{formatAr(r.montant)}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline">{STATUT_LABEL[r.statut]}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          {r.statut === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatut(r.id, "confirmed")}
                              >
                                <Check className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatut(r.id, "cancelled")}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          {r.statut === "confirmed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatut(r.id, "done")}
                            >
                              Terminer
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      Rien à traiter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
