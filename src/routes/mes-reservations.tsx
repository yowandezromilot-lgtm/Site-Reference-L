import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp, formatAr, STATUT_LABEL, type ReservationStatut } from "@/lib/store";
import { CalendarDays, MapPin } from "lucide-react";

export const Route = createFileRoute("/mes-reservations")({
  head: () => ({
    meta: [
      { title: "Mes Réservations — Référence Location" },
      {
        name: "description",
        content: "Suivez vos réservations de véhicules chez Référence Location à Diego Suarez.",
      },
      { property: "og:title", content: "Mes Réservations" },
      { property: "og:description", content: "Historique et suivi de vos locations." },
    ],
  }),
  component: MesReservations,
});

const statutColor: Record<ReservationStatut, string> = {
  pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
  confirmed: "bg-primary/15 text-primary border-primary/40",
  done: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/15 text-destructive border-destructive/40",
};

function MesReservations() {
  const { state } = useApp();
  const [filter, setFilter] = useState<string>("all");

  const mine = state.reservations
    .filter((r) => r.client_id === state.currentClientId)
    .filter((r) => filter === "all" || r.statut === filter)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Espace client</p>
        <h1 className="font-display text-4xl mt-2">Mes Réservations</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Suivez l'état de vos demandes et l'historique de vos locations.
        </p>

        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {mine.length} réservation{mine.length > 1 ? "s" : ""}
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="confirmed">Confirmées</SelectItem>
              <SelectItem value="done">Terminées</SelectItem>
              <SelectItem value="cancelled">Annulées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 grid gap-4">
          {mine.map((r) => {
            const v = state.vehicules.find((x) => x.id === r.voiture_id);
            return (
              <Card key={r.id} className="border-border/60">
                <CardContent className="p-5 grid gap-4 md:grid-cols-[auto_1fr_auto] items-center">
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-muted flex items-center justify-center border border-border">
                    {v?.image_url ? (
                      <img src={v.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-vehicle-fallback">
                        {v?.emoji}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-primary">{r.id}</span>
                      <Badge variant="outline" className={statutColor[r.statut]}>
                        {STATUT_LABEL[r.statut]}
                      </Badge>
                    </div>
                    <div className="font-display text-lg mt-1">
                      {v ? `${v.marque} ${v.modele}` : "Véhicule"}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {r.date_depart} → {r.date_retour}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-none">
                          {r.lieu_prise}
                          {r.lieu_retour && r.lieu_retour !== r.lieu_prise ? ` → ${r.lieu_retour}` : ""}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl text-primary">{formatAr(r.montant)}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {mine.length === 0 && (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
              Aucune réservation pour ce filtre.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
