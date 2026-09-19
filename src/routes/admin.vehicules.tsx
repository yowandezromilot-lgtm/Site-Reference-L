import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApp, formatAr, type Vehicule, type VehiculeType } from "@/lib/store";
import { Plus, Trash2, Power, Camera, X, Pencil, Car } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/vehicules")({
  component: AdminVehicules,
});

/** Convertit un fichier image en data URL compressée (max 800px, JPEG 75%). */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas non supporté")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const emptyForm: Omit<Vehicule, "id" | "nb_locations" | "disponible"> = {
  marque: "",
  modele: "",
  type: "Hyundai Getz Phase 2",
  immatriculation: "",
  places: 5,
  prix_jour: 100000,
  prix_hors_ville: 130000,
  emoji: "🚗",
  image_url: "",
  images: [],
};

const defaultTypes = [
  "Hyundai Getz Phase 2",
  "Hyundai Starex",
  "Kia Morning Phase 2",
  "Kia Morning Phase 3",
];

function AdminVehicules() {
  const { state, setState } = useApp();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [customType, setCustomType] = useState("");

  const allTypes = Array.from(new Set([...defaultTypes, ...state.vehicules.map((v) => v.type)]));

  const save = () => {
    if (!form.marque || !form.modele || !form.immatriculation) {
      toast.error("Marque, modèle et immatriculation requis.");
      return;
    }
    if (editingId !== null) {
      setState((s) => ({
        ...s,
        vehicules: s.vehicules.map((v) => (v.id === editingId ? { ...v, ...form } : v)),
      }));
      toast.success(`${form.marque} ${form.modele} modifié.`);
    } else {
      setState((s) => ({
        ...s,
        vehicules: [
          ...s.vehicules,
          { ...form, id: Math.max(0, ...s.vehicules.map((v) => v.id)) + 1, disponible: true, nb_locations: 0 },
        ],
      }));
      toast.success(`${form.marque} ${form.modele} ajouté au parc.`);
    }
    setForm(emptyForm);
    setEditingId(null);
    setIsCreatingType(false);
    setOpen(false);
  };

  const toggle = (id: number) =>
    setState((s) => ({
      ...s,
      vehicules: s.vehicules.map((v) => (v.id === id ? { ...v, disponible: !v.disponible } : v)),
    }));

  const remove = (id: number) => {
    if (!confirm("Retirer ce véhicule du parc ?")) return;
    setState((s) => ({ ...s, vehicules: s.vehicules.filter((v) => v.id !== id) }));
    toast.success("Véhicule retiré.");
  };

  const closeDialog = () => {
    setOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    setIsCreatingType(false);
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Bande dorée */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-border/60 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center h-7 w-7 rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Car className="h-3.5 w-3.5" />
            </div>
            <h2 className="font-display text-xl">Parc de véhicules</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-9">
            {state.vehicules.length} véhicule{state.vehicules.length > 1 ? "s" : ""}
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) { setForm(emptyForm); setEditingId(null); setIsCreatingType(false); }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="gap-2 shadow-gold hover:brightness-110 transition-all cursor-pointer"
              onClick={() => { setForm(emptyForm); setEditingId(null); setIsCreatingType(false); setOpen(true); }}
            >
              <Plus className="h-4 w-4" />
              Ajouter un véhicule
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg border-primary/20 bg-card/95 backdrop-blur-xl">
            {/* Bande dorée */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-t-xl" />

            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editingId !== null ? "Modifier le véhicule" : "Nouveau véhicule"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 mt-2">
              {/* Marque / Modèle */}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Marque">
                  <Input
                    value={form.marque}
                    onChange={(e) => setForm({ ...form, marque: e.target.value })}
                    className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
                  />
                </FormField>
                <FormField label="Modèle">
                  <Input
                    value={form.modele}
                    onChange={(e) => setForm({ ...form, modele: e.target.value })}
                    className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
                  />
                </FormField>
              </div>

              {/* Type / Immat */}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Type">
                  {isCreatingType ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nouveau type"
                        value={customType}
                        onChange={(e) => { setCustomType(e.target.value); setForm({ ...form, type: e.target.value as VehiculeType }); }}
                        autoFocus
                        className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => { setIsCreatingType(false); setForm({ ...form, type: allTypes[0] as VehiculeType || "" }); }}>
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={form.type}
                      onValueChange={(v) => {
                        if (v === "__NEW__") { setIsCreatingType(true); setCustomType(""); }
                        else setForm({ ...form, type: v as VehiculeType });
                      }}
                    >
                      <SelectTrigger className="border-border/50 bg-background/50 hover:border-primary/40 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        <SelectItem value="__NEW__" className="text-primary font-medium">+ Créer un nouveau type…</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
                <FormField label="Immatriculation">
                  <Input
                    value={form.immatriculation}
                    onChange={(e) => setForm({ ...form, immatriculation: e.target.value })}
                    className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
                  />
                </FormField>
              </div>

              {/* Places / Prix / Emoji */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FormField label="Places">
                  <Input type="number" value={form.places} onChange={(e) => setForm({ ...form, places: +e.target.value })} className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors" />
                </FormField>
                <FormField label="Prix / jour (Ar)">
                  <Input type="number" value={form.prix_jour} onChange={(e) => setForm({ ...form, prix_jour: +e.target.value })} className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors" />
                </FormField>
                <FormField label="Prix hors ville (Ar)">
                  <Input type="number" value={form.prix_hors_ville || 0} onChange={(e) => setForm({ ...form, prix_hors_ville: +e.target.value })} className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors" />
                </FormField>
                <FormField label="Emoji">
                  <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors" />
                </FormField>
              </div>

              {/* Photos */}
              <div>
                <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Photos du véhicule <span className="normal-case tracking-normal text-muted-foreground/50">(optionnelles)</span>
                </Label>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {form.images?.map((imgUrl, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-border/60 w-28 h-20 hover:border-primary/40 transition-colors">
                      <img src={imgUrl} alt={`Aperçu ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => {
                              const newImages = prev.images?.filter((_, i) => i !== index) || [];
                              return { ...prev, images: newImages, image_url: newImages[0] || "" };
                            });
                          }}
                          className="grid place-items-center h-7 w-7 rounded-lg bg-destructive/90 text-white hover:bg-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {index === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[8px] uppercase tracking-wider text-center py-0.5 font-semibold">
                          Principale
                        </span>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-20 border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shrink-0"
                  >
                    <Camera className="h-5 w-5 text-primary/60" />
                    <span className="text-[10px] text-muted-foreground mt-1">Uploader</span>
                  </button>

                  <div className="text-xs text-muted-foreground">
                    <p>Ajoutez une ou plusieurs photos.</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">JPG/PNG, max 3 Mo</p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  title="Uploader une photo du véhicule"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 3 * 1024 * 1024) {
                      toast.error("Cette photo est trop grande (max 3 Mo).");
                      e.target.value = "";
                      return;
                    }
                    if (file.size > 1 * 1024 * 1024) {
                      toast.warning(`Photo volumineuse (${(file.size / 1024 / 1024).toFixed(1)} Mo). Préférez < 1 Mo.`);
                    }
                    const url = await fileToDataUrl(file);
                    setForm((prev) => {
                      const newImages = [...(prev.images || []), url];
                      const totalSizeMb = newImages.reduce((acc, img) => acc + (img.length * 3) / 4 / 1024 / 1024, 0);
                      if (totalSizeMb > 4) {
                        setTimeout(() => toast.warning(`Total photos: ${totalSizeMb.toFixed(1)} Mo. Risque d'erreur de sauvegarde.`, { duration: 7000 }), 100);
                      }
                      return { ...prev, images: newImages, image_url: newImages[0] };
                    });
                    toast.success(`Photo ajoutée (${(file.size / 1024).toFixed(0)} Ko).`);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button variant="ghost" onClick={closeDialog} className="text-muted-foreground">
                Annuler
              </Button>
              <Button onClick={save} className="shadow-gold hover:brightness-110 transition-all">
                {editingId !== null ? "Enregistrer" : "Ajouter au parc"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table véhicules */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20">
              {["Véhicule", "Type", "Immat.", "Places", "Prix / jour", "Prix hors ville", "Statut", "Actions"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium ${i >= 4 && i <= 5 ? "text-right" : i >= 6 ? "text-left" : "text-left"}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {state.vehicules.map((v) => (
              <tr key={v.id} className="border-b border-border/40 hover:bg-primary/[0.03] transition-colors group">

                {/* Véhicule */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {v.image_url ? (
                      <img
                        src={v.image_url}
                        alt=""
                        className="w-10 h-8 rounded-lg object-cover border border-border/60 group-hover:border-primary/30 transition-colors shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-8 rounded-lg bg-muted/40 border border-border/40 flex items-center justify-center text-lg shrink-0">
                        {v.emoji}
                      </div>
                    )}
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {v.marque} {v.modele}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-3.5 text-muted-foreground text-sm">{v.type}</td>

                {/* Immat */}
                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs bg-muted/40 px-2 py-0.5 rounded border border-border/40">
                    {v.immatriculation}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-sm">{v.places}</td>

                <td className="px-5 py-3.5 text-right">
                  <span className="font-display font-bold text-gradient-gold text-sm">
                    {formatAr(v.prix_jour)}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-right text-sm text-primary/70">
                  {v.prix_hors_ville ? formatAr(v.prix_hors_ville) : "—"}
                </td>

                {/* Statut */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 border ${
                      v.disponible
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted/40 border-border/40 text-muted-foreground"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${v.disponible ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                    {v.disponible ? "Disponible" : "En location"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    {/* Modifier */}
                    <button
                      onClick={() => {
                        setForm({
                          marque: v.marque, modele: v.modele, type: v.type,
                          immatriculation: v.immatriculation, places: v.places,
                          prix_jour: v.prix_jour, prix_hors_ville: v.prix_hors_ville || 0,
                          emoji: v.emoji, image_url: v.image_url || "",
                          images: v.images || (v.image_url ? [v.image_url] : []),
                        });
                        setEditingId(v.id);
                        setIsCreatingType(false);
                        setOpen(true);
                      }}
                      title="Modifier le véhicule"
                      className="grid place-items-center h-8 w-8 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Disponibilité */}
                    <button
                      onClick={() => toggle(v.id)}
                      title="Changer la disponibilité"
                      className={`grid place-items-center h-8 w-8 rounded-lg border transition-all ${
                        v.disponible
                          ? "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:text-primary"
                          : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>

                    {/* Supprimer */}
                    <button
                      onClick={() => remove(v.id)}
                      title="Supprimer le véhicule"
                      className="grid place-items-center h-8 w-8 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
