import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp, formatAr, STATUT_LABEL, type ReservationStatut } from "@/lib/store";
import { Check, X, Pencil, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reservations")({
  component: AdminReservations,
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

function AdminReservations() {
  const { state, setState } = useApp();
  const [filter, setFilter] = useState<string>("all");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);

  const list = state.reservations
    .filter((r) => filter === "all" || r.statut === filter)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const setStatut = (id: string, statut: ReservationStatut) => {
    setState((s) => ({
      ...s,
      reservations: s.reservations.map((r) => (r.id === id ? { ...r, statut } : r)),
    }));
    toast.success(`${id} → ${STATUT_LABEL[statut]}`);
  };

  const savePrice = (id: string) => {
    setState((s) => ({
      ...s,
      reservations: s.reservations.map((r) =>
        r.id === id ? { ...r, montant: editPriceValue } : r,
      ),
    }));
    setEditingPriceId(null);
    toast.success("Prix de la réservation modifié.");
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Bande dorée */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-border/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl">Toutes les réservations</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
              {list.length} résultat{list.length > 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-52 border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-colors">
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20">
              {["Réf.", "Client", "Véhicule", "Dates", "Lieu", "Montant", "Statut", "Actions"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium ${i >= 5 ? "text-right" : "text-left"} ${h === "Statut" || h === "Actions" ? "" : ""}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
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

                  {/* Montant éditable */}
                  <td className="px-5 py-3.5 text-right">
                    {editingPriceId === r.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Input
                          type="number"
                          className="w-24 h-7 text-right text-xs border-primary/40"
                          value={editPriceValue}
                          onChange={(e) => setEditPriceValue(+e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") savePrice(r.id);
                            if (e.key === "Escape") setEditingPriceId(null);
                          }}
                        />
                        <button
                          onClick={() => savePrice(r.id)}
                          className="grid place-items-center h-7 w-7 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 group/price">
                        <span className="font-display font-bold text-gradient-gold text-sm">
                          {formatAr(r.montant)}
                        </span>
                        <button
                          className="opacity-0 group-hover/price:opacity-100 text-muted-foreground/50 hover:text-primary transition-all cursor-pointer"
                          onClick={() => {
                            setEditingPriceId(r.id);
                            setEditPriceValue(r.montant);
                          }}
                          title="Modifier le prix"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    )}
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
                      {r.statut !== "confirmed" && r.statut !== "done" && (
                        <button
                          onClick={() => setStatut(r.id, "confirmed")}
                          title="Confirmer"
                          className="grid place-items-center h-8 w-8 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {r.statut !== "cancelled" && r.statut !== "done" && (
                        <button
                          onClick={() => setStatut(r.id, "cancelled")}
                          title="Annuler"
                          className="grid place-items-center h-8 w-8 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/50 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16 text-muted-foreground">
                  <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Aucune réservation pour ce filtre.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
