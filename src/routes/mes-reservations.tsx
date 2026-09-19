import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp, formatAr, STATUT_LABEL, type ReservationStatut } from "@/lib/store";
import { CalendarDays, MapPin, FileText, ChevronRight } from "lucide-react";

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

const statutConfig: Record<
  ReservationStatut,
  { bg: string; border: string; text: string; dot: string; label: string }
> = {
  pending: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    dot: "bg-yellow-400 animate-pulse",
    label: STATUT_LABEL.pending,
  },
  confirmed: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    dot: "bg-primary animate-pulse",
    label: STATUT_LABEL.confirmed,
  },
  done: {
    bg: "bg-muted/50",
    border: "border-border/50",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    label: STATUT_LABEL.done,
  },
  cancelled: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    dot: "bg-destructive",
    label: STATUT_LABEL.cancelled,
  },
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
        {/* Header premium */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary mb-3">
            <span className="w-6 h-px bg-primary inline-block" />
            Espace client
            <span className="w-6 h-px bg-primary inline-block" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl">
            Mes <span className="text-gradient-gold">Réservations</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Suivez l'état de vos demandes et l'historique de vos locations.
          </p>
          <div className="h-0.5 mt-4 w-20 bg-gradient-to-r from-primary to-transparent rounded-full" />
        </div>

        {/* Filtres + compteur */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            {mine.length} réservation{mine.length > 1 ? "s" : ""}
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-52 border-border/50 bg-card/60 backdrop-blur-sm">
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

        {/* Liste */}
        <div className="grid gap-4">
          {mine.map((r) => {
            const v = state.vehicules.find((x) => x.id === r.voiture_id);
            const sc = statutConfig[r.statut];
            return (
              <div
                key={r.id}
                className="group relative rounded-2xl border border-border/50 hover:border-primary/40 bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-[0_10px_40px_-10px_oklch(0.78_0.1_85/0.25)] hover:-translate-y-0.5"
              >
                {/* Bande de couleur gauche selon statut */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${sc.dot.replace("animate-pulse", "")}`} />

                <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] items-center p-5 pl-6">
                  {/* Image véhicule */}
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted border border-border/60 shrink-0 group-hover:border-primary/30 transition-colors">
                    {v?.image_url ? (
                      <img
                        src={v.image_url}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-vehicle-fallback">
                        {v?.emoji}
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {r.id}
                      </span>
                      {/* Badge statut */}
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 border ${sc.bg} ${sc.border} ${sc.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                    <div className="font-display text-lg mt-1.5 group-hover:text-primary transition-colors truncate">
                      {v ? `${v.marque} ${v.modele}` : "Véhicule"}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-primary/60" />
                        {r.date_depart} → {r.date_retour}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate max-w-[200px] sm:max-w-none">
                          {r.lieu_prise}
                          {r.lieu_retour && r.lieu_retour !== r.lieu_prise
                            ? ` → ${r.lieu_retour}`
                            : ""}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Montant + chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-display text-xl text-gradient-gold font-bold">
                        {formatAr(r.montant)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">montant total</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                </div>

                {/* Ligne dorée bas au hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            );
          })}

          {mine.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground border border-dashed border-border/50 rounded-2xl">
              <FileText className="h-12 w-12 opacity-20" />
              <p>Aucune réservation pour ce filtre.</p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
