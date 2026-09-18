import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { useApp, formatAr, type Vehicule, type VehiculeType } from "@/lib/store";
import { Plus, Trash2, Power, Camera, X, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/vehicules")({
  component: AdminVehicules,
});

/** Convertit un fichier image en data URL compressée (max 800px, JPEG 75%).
 *  Réduit chaque photo de 1-3 Mo à ~100-200 Ko pour éviter les QuotaExceededError. */
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
      if (!ctx) {
        reject(new Error("Canvas non supporté"));
        return;
      }
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

  // Custom vehicle type states
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [customType, setCustomType] = useState("");

  const allTypes = Array.from(new Set([...defaultTypes, ...state.vehicules.map((v) => v.type)]));

  const save = () => {
    if (!form.marque || !form.modele || !form.immatriculation) {
      toast.error("Marque, modèle et immatriculation requis.");
      return;
    }

    if (editingId !== null) {
      // Edit mode
      setState((s) => ({
        ...s,
        vehicules: s.vehicules.map((v) => (v.id === editingId ? { ...v, ...form } : v)),
      }));
      toast.success(`${form.marque} ${form.modele} modifié.`);
    } else {
      // Add mode
      setState((s) => ({
        ...s,
        vehicules: [
          ...s.vehicules,
          {
            ...form,
            id: Math.max(0, ...s.vehicules.map((v) => v.id)) + 1,
            disponible: true,
            nb_locations: 0,
          },
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

  return (
    <Card className="border-border/60">
      <CardContent className="p-0">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl">Parc de véhicules</h2>
            <p className="text-sm text-muted-foreground">{state.vehicules.length} véhicules</p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val);
              if (!val) {
                setForm(emptyForm);
                setEditingId(null);
                setIsCreatingType(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                  setIsCreatingType(false);
                  setOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un véhicule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {editingId !== null ? "Modifier le véhicule" : "Nouveau véhicule"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Marque</Label>
                    <Input
                      className="mt-1.5"
                      value={form.marque}
                      onChange={(e) => setForm({ ...form, marque: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Modèle</Label>
                    <Input
                      className="mt-1.5"
                      value={form.modele}
                      onChange={(e) => setForm({ ...form, modele: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    {isCreatingType ? (
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          placeholder="Nouveau type"
                          value={customType}
                          onChange={(e) => {
                            setCustomType(e.target.value);
                            setForm({ ...form, type: e.target.value });
                          }}
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreatingType(false);
                            setForm({ ...form, type: allTypes[0] || "" });
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={form.type}
                        onValueChange={(v) => {
                          if (v === "__NEW__") {
                            setIsCreatingType(true);
                            setCustomType("");
                          } else {
                            setForm({ ...form, type: v });
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                          <SelectItem value="__NEW__" className="text-primary font-medium">
                            + Créer un nouveau type...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label>Immatriculation</Label>
                    <Input
                      className="mt-1.5"
                      value={form.immatriculation}
                      onChange={(e) => setForm({ ...form, immatriculation: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Places</Label>
                    <Input
                      type="number"
                      className="mt-1.5"
                      value={form.places}
                      onChange={(e) => setForm({ ...form, places: +e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Prix / jour (Ar)</Label>
                    <Input
                      type="number"
                      className="mt-1.5"
                      value={form.prix_jour}
                      onChange={(e) => setForm({ ...form, prix_jour: +e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="truncate" title="Prix hors ville (Ar)">
                      Prix hors ville (Ar)
                    </Label>
                    <Input
                      type="number"
                      className="mt-1.5"
                      value={form.prix_hors_ville || 0}
                      onChange={(e) => setForm({ ...form, prix_hors_ville: +e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Emoji</Label>
                    <Input
                      className="mt-1.5"
                      value={form.emoji}
                      onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
                    Photos du véhicule (Optionnelles)
                  </Label>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    {form.images?.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-border/60 w-32 h-20"
                      >
                        <img
                          src={imgUrl}
                          alt={`Aperçu ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => {
                                const newImages = prev.images?.filter((_, i) => i !== index) || [];
                                return {
                                  ...prev,
                                  images: newImages,
                                  image_url: newImages[0] || "",
                                };
                              });
                            }}
                            className="p-1 rounded bg-destructive text-white hover:bg-destructive/80 transition-colors cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[8px] uppercase tracking-wider text-center py-0.5 font-medium">
                            Principale
                          </span>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-20 border-2 border-dashed border-primary/20 rounded-lg flex flex-col items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer shrink-0"
                    >
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Uploader</span>
                    </button>
                    <div className="text-xs text-muted-foreground">
                      <p>Ajoutez une ou plusieurs photos.</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        Format JPG/PNG, max 3 Mo
                      </p>
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
                      // Bloquer les fichiers trop grands
                      if (file.size > 3 * 1024 * 1024) {
                        toast.error(
                          "Cette photo est trop grande (max 3 Mo). Veuillez compresser l'image avant de l'uploader.",
                        );
                        e.target.value = "";
                        return;
                      }
                      // Avertissement si la photo est grande (> 1 Mo)
                      if (file.size > 1 * 1024 * 1024) {
                        toast.warning(
                          `Cette photo est volumineuse (${(file.size / 1024 / 1024).toFixed(1)} Mo). Pour de meilleures performances, préférez des images de moins de 1 Mo.`,
                        );
                      }
                      const url = await fileToDataUrl(file);
                      setForm((prev) => {
                        const newImages = [...(prev.images || []), url];
                        // Calculer la taille totale approximative en base64 (en Mo)
                        const totalSizeMb = newImages.reduce(
                          (acc, img) => acc + (img.length * 3) / 4 / 1024 / 1024,
                          0,
                        );
                        if (totalSizeMb > 4) {
                          // On affiche l'avertissement en dehors du setState pour éviter les problèmes
                          setTimeout(() => {
                            toast.warning(
                              `Attention : le total des photos dépasse ${totalSizeMb.toFixed(1)} Mo. La sauvegarde locale peut échouer. Utilisez des images plus légères.`,
                              { duration: 7000 },
                            );
                          }, 100);
                        }
                        return { ...prev, images: newImages, image_url: newImages[0] };
                      });
                      toast.success(`Photo ajoutée (${(file.size / 1024).toFixed(0)} Ko).`);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    setForm(emptyForm);
                    setEditingId(null);
                    setIsCreatingType(false);
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={save}>
                  {editingId !== null ? "Enregistrer" : "Ajouter au parc"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="text-left px-5 py-3">Véhicule</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Immat.</th>
                <th className="text-left px-5 py-3">Places</th>
                <th className="text-right px-5 py-3">Prix / jour</th>
                <th className="text-right px-5 py-3">Prix hors ville</th>
                <th className="text-left px-5 py-3">Statut</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.vehicules.map((v) => (
                <tr key={v.id} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="px-5 py-3 flex items-center gap-3">
                    {v.image_url ? (
                      <img
                        src={v.image_url}
                        alt=""
                        className="w-8 h-8 rounded object-cover border border-border"
                      />
                    ) : (
                      <span className="text-xl">{v.emoji}</span>
                    )}
                    <span>
                      {v.marque} {v.modele}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{v.type}</td>
                  <td className="px-5 py-3 font-mono text-xs">{v.immatriculation}</td>
                  <td className="px-5 py-3">{v.places}</td>
                  <td className="px-5 py-3 text-right text-primary">{formatAr(v.prix_jour)}</td>
                  <td className="px-5 py-3 text-right text-primary/80">
                    {v.prix_hors_ville ? formatAr(v.prix_hors_ville) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant="outline"
                      className={
                        v.disponible ? "border-primary/40 text-primary" : "text-muted-foreground"
                      }
                    >
                      {v.disponible ? "Disponible" : "En location"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setForm({
                            marque: v.marque,
                            modele: v.modele,
                            type: v.type,
                            immatriculation: v.immatriculation,
                            places: v.places,
                            prix_jour: v.prix_jour,
                            prix_hors_ville: v.prix_hors_ville || 0,
                            emoji: v.emoji,
                            image_url: v.image_url || "",
                            images: v.images || (v.image_url ? [v.image_url] : []),
                          });
                          setEditingId(v.id);
                          setIsCreatingType(false);
                          setOpen(true);
                        }}
                        title="Modifier le véhicule"
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggle(v.id)}
                        title="Changer la disponibilité"
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(v.id)}
                        title="Supprimer le véhicule"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
