import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp, formatAr, STATUT_LABEL, type Client, type ReservationStatut } from "@/lib/store";
import { Trash2, Eye, Users, ShieldCheck, Phone, Mail, CalendarDays, CreditCard } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/clients")({
  component: AdminClients,
});

const statutConfig: Record<
  ReservationStatut,
  { bg: string; border: string; text: string; dot: string }
> = {
  pending: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-300", dot: "bg-yellow-400" },
  confirmed: { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary", dot: "bg-primary" },
  done: { bg: "bg-muted/50", border: "border-border/50", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  cancelled: { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", dot: "bg-destructive" },
};

function AdminClients() {
  const { state, setState } = useApp();
  const [selected, setSelected] = useState<Client | null>(null);

  const remove = (id: number) => {
    if (!confirm("Supprimer ce client ?")) return;
    setState((s) => ({ ...s, clients: s.clients.filter((c) => c.id !== id) }));
    toast.success("Client supprimé.");
  };

  return (
    <>
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
        {/* Bande dorée */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center h-7 w-7 rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Users className="h-3.5 w-3.5" />
            </div>
            <h2 className="font-display text-xl">Base clients</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-9">
            {state.clients.length} client{state.clients.length > 1 ? "s" : ""} enregistré{state.clients.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                {["Nom", "Téléphone", "Email", "CIN", "Réservations", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium ${i >= 4 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.clients.map((c) => {
                const count = state.reservations.filter((r) => r.client_id === c.id).length;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border/40 hover:bg-primary/[0.03] transition-colors group"
                  >
                    {/* Nom */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {c.photo_url ? (
                          <img
                            src={c.photo_url}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center text-[11px] font-bold shrink-0">
                            {c.prenom?.[0]?.toUpperCase()}
                            {c.nom?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {c.prenom} {c.nom}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-muted-foreground text-sm">{c.telephone}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-sm">{c.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-muted-foreground/80">{c.cin}</span>
                    </td>

                    {/* Réservations */}
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center justify-center h-6 min-w-6 rounded-full text-xs font-bold px-2 ${count > 0 ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/40 text-muted-foreground"}`}>
                        {count}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelected(c)}
                          title="Voir le profil"
                          className="grid place-items-center h-8 w-8 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(c.id)}
                          title="Supprimer"
                          className="grid place-items-center h-8 w-8 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dialog détail client ── */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-primary/20 bg-card/95 backdrop-blur-xl">
          {/* Bande dorée */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-t-xl" />

          {selected && (
            <>
              <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                {selected.photo_url ? (
                  <img
                    src={selected.photo_url}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover border-2 border-primary/30 ring-4 ring-primary/10"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center text-xl font-bold ring-4 ring-primary/10">
                    {selected.prenom?.[0]?.toUpperCase()}
                    {selected.nom?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <DialogTitle className="font-display text-2xl">
                    {selected.prenom} {selected.nom}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Client #{selected.id} · inscrit le {selected.date_inscription}
                  </p>
                </div>
              </DialogHeader>

              {/* Infos */}
              <div className="grid sm:grid-cols-2 gap-3 border-t border-border/40 pt-4">
                <Info icon={Phone} label="Téléphone" value={selected.telephone} />
                <Info icon={Mail} label="Email" value={selected.email} />
                <Info icon={CreditCard} label="CIN" value={selected.cin} />
                <Info icon={ShieldCheck} label="Permis" value={selected.permis} />
                <Info icon={CalendarDays} label="Inscrit le" value={selected.date_inscription} />
              </div>

              {/* Documents CIN */}
              {(selected.cin_photo_url || selected.cin_verso_url) && (
                <div className="mt-5 pt-5 border-t border-border/40">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3 font-medium">
                    Documents d'identité
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {selected.cin_photo_url && (
                      <div className="space-y-1.5">
                        <span className="text-xs text-muted-foreground">CIN (Recto)</span>
                        <a href={selected.cin_photo_url} target="_blank" rel="noreferrer">
                          <img
                            src={selected.cin_photo_url}
                            alt="CIN Recto"
                            className="h-28 w-auto rounded-xl border border-border/60 object-cover hover:opacity-80 hover:border-primary/40 transition-all"
                          />
                        </a>
                      </div>
                    )}
                    {selected.cin_verso_url && (
                      <div className="space-y-1.5">
                        <span className="text-xs text-muted-foreground">CIN (Verso)</span>
                        <a href={selected.cin_verso_url} target="_blank" rel="noreferrer">
                          <img
                            src={selected.cin_verso_url}
                            alt="CIN Verso"
                            className="h-28 w-auto rounded-xl border border-border/60 object-cover hover:opacity-80 hover:border-primary/40 transition-all"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Historique réservations */}
              <div className="mt-5 pt-5 border-t border-border/40">
                <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3 font-medium">
                  Historique des locations
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {state.reservations
                    .filter((r) => r.client_id === selected.id)
                    .map((r) => {
                      const v = state.vehicules.find((x) => x.id === r.voiture_id);
                      const sc = statutConfig[r.statut];
                      return (
                        <div
                          key={r.id}
                          className="flex items-center justify-between border border-border/50 hover:border-primary/30 rounded-xl px-4 py-3 transition-colors bg-muted/20"
                        >
                          <div>
                            <div className="text-xs font-mono text-primary">{r.id}</div>
                            <div className="text-sm mt-0.5">
                              {v?.marque} {v?.modele} · {r.date_depart} → {r.date_retour}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 border ${sc.bg} ${sc.border} ${sc.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                              {STATUT_LABEL[r.statut]}
                            </span>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatAr(r.montant)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {state.reservations.filter((r) => r.client_id === selected.id).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Aucune réservation pour ce client.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
      <div className="grid place-items-center h-7 w-7 rounded-lg border border-primary/20 bg-primary/10 text-primary shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="text-sm mt-0.5 font-medium">{value}</div>
      </div>
    </div>
  );
}
