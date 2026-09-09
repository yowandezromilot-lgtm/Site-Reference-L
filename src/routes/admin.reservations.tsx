import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp, formatAr, STATUT_LABEL, type ReservationStatut } from "@/lib/store";
import { Check, X, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reservations")({
  component: AdminReservations,
});

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
      reservations: s.reservations.map((r) => (r.id === id ? { ...r, montant: editPriceValue } : r)),
    }));
    setEditingPriceId(null);
    toast.success("Prix de la réservation modifié.");
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-0">
        <div className="p-5 border-b border-border/60 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-xl">Toutes les réservations</h2>
            <p className="text-sm text-muted-foreground">
              {list.length} résultat{list.length > 1 ? "s" : ""}
            </p>
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
              {list.map((r) => {
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
                            {c?.prenom?.[0]?.toUpperCase()}{c?.nom?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{c?.prenom} {c?.nom}</span>
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
                        <span className="text-foreground/80"><span className="text-[10px] text-muted-foreground mr-1">Départ:</span>{r.lieu_prise}</span>
                        {r.lieu_retour && r.lieu_retour !== r.lieu_prise && (
                          <span className="text-foreground/80"><span className="text-[10px] text-muted-foreground mr-1">Retour:</span>{r.lieu_retour}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {editingPriceId === r.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            className="w-24 h-7 text-right text-xs"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(+e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") savePrice(r.id);
                              if (e.key === "Escape") setEditingPriceId(null);
                            }}
                          />
                          <Button size="icon" className="h-7 w-7" onClick={() => savePrice(r.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 group">
                          <span>{formatAr(r.montant)}</span>
                          <button
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity cursor-pointer"
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
                    <td className="px-5 py-3">
                      <Badge variant="outline">{STATUT_LABEL[r.statut]}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {r.statut !== "confirmed" && r.statut !== "done" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStatut(r.id, "confirmed")}
                          >
                            <Check className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        {r.statut !== "cancelled" && r.statut !== "done" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStatut(r.id, "cancelled")}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground">
                    Aucune réservation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
