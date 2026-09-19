import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { Pencil, LogOut, X, Check, Camera, Upload, CreditCard, CalendarDays, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Mon Profil — Référence Location" },
      {
        name: "description",
        content: "Gérez vos informations personnelles chez Référence Location.",
      },
    ],
  }),
  component: Profil,
});

const GATE_KEY = "rl_profile_done_v1";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Profil() {
  const { state, setState } = useApp();
  const navigate = useNavigate();
  const client = state.clients.find((c) => c.id === state.currentClientId);
  const [form, setForm] = useState<import("@/lib/store").Client | undefined>(client);
  const [editing, setEditing] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [cinRectoPreview, setCinRectoPreview] = useState<string | undefined>(undefined);
  const [cinVersoPreview, setCinVersoPreview] = useState<string | undefined>(undefined);

  const photoRef = useRef<HTMLInputElement>(null);
  const cinRectoRef = useRef<HTMLInputElement>(null);
  const cinVersoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(client);
    setPhotoPreview(client?.photo_url);
    setCinRectoPreview(client?.cin_photo_url);
    setCinVersoPreview(client?.cin_verso_url);
  }, [client]);

  if (!client) {
    return (
      <AppShell>
        <section className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-xl p-8 shadow-[0_20px_60px_-15px_oklch(0_0_0/0.5)]">
            <p className="text-muted-foreground text-sm">Aucun profil client actif.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Veuillez créer un profil ou vous connecter depuis la page d'accueil.
            </p>
            <Button
              className="mt-6 w-full cursor-pointer shadow-gold"
              onClick={() => {
                setState((s) => ({ ...s, showAddAccountGate: true }));
                navigate({ to: "/" });
              }}
            >
              Se connecter
            </Button>
          </div>
        </section>
      </AppShell>
    );
  }

  const myReservations = state.reservations.filter((r) => r.client_id === client.id);
  if (!form) return null;

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    previewSetter: (url: string | undefined) => void,
    formKey: "photo_url" | "cin_photo_url" | "cin_verso_url",
    maxMb: number,
    label: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`${label} doit faire moins de ${maxMb} Mo.`);
      return;
    }
    const url = await fileToDataUrl(file);
    previewSetter(url);
    setForm((prev) => (prev ? { ...prev, [formKey]: url } : prev));
    toast.success(`${label} chargée.`);
  };

  const save = () => {
    if (!form) return;
    setState((s) => ({
      ...s,
      clients: s.clients.map((c) => (c.id === form.id ? form : c)),
    }));
    toast.success("Profil mis à jour.");
    setEditing(false);
  };

  const cancelEdit = () => {
    setForm(client);
    setPhotoPreview(client?.photo_url);
    setCinRectoPreview(client?.cin_photo_url);
    setCinVersoPreview(client?.cin_verso_url);
    setEditing(false);
  };

  const disconnect = () => {
    if (
      !confirm(
        "Voulez-vous vraiment vous déconnecter ? Vous devrez recréer un profil pour accéder au site.",
      )
    )
      return;
    localStorage.removeItem(GATE_KEY);
    window.location.href = "/";
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary mb-3">
              <span className="w-6 h-px bg-primary inline-block" />
              Espace client
              <span className="w-6 h-px bg-primary inline-block" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl">
              Mon <span className="text-gradient-gold">Profil</span>
            </h1>
            <div className="h-0.5 mt-3 w-16 bg-gradient-to-r from-primary to-transparent rounded-full" />
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/60 hover:border-primary/50"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={cancelEdit}
                >
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
                <Button size="sm" className="gap-2 shadow-gold" onClick={save}>
                  <Check className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/30"
              onClick={disconnect}
            >
              <LogOut className="h-4 w-4" />
              Déconnecter
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Carte profil */}
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden h-fit">
            {/* Bande dégradée haut */}
            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,oklch(0.78_0.1_85/0.15),transparent_70%)]" />
            </div>

            <div className="px-6 pb-6 -mt-12 text-center">
              {/* Photo profil */}
              <div className="relative mx-auto h-24 w-24 group">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Photo de profil"
                    className="h-24 w-24 rounded-full object-cover border-4 border-card ring-2 ring-primary/40"
                  />
                ) : (
                  <div className="h-24 w-24 grid place-items-center rounded-full font-display text-2xl bg-gradient-gold text-primary-foreground border-4 border-card ring-2 ring-primary/40">
                    {client.prenom[0]}
                    {client.nom[0]}
                  </div>
                )}
                {editing && (
                  <button
                    onClick={() => photoRef.current?.click()}
                    aria-label="Changer la photo de profil"
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                )}
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  title="Uploader une photo de profil"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e, setPhotoPreview, "photo_url", 4, "Photo de profil")
                  }
                />
              </div>

              <div className="font-display text-xl mt-4">
                {client.prenom} {client.nom}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                <CalendarDays className="h-3 w-3" />
                Client depuis {new Date(client.date_inscription).getFullYear()}
              </div>

              {editing && (
                <button
                  onClick={() => photoRef.current?.click()}
                  className="mt-3 text-xs text-primary hover:underline underline-offset-4 inline-flex items-center gap-1.5"
                >
                  <Upload className="h-3 w-3" />
                  {photoPreview ? "Changer la photo" : "Ajouter une photo"}
                </button>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/60">
                <Stat value={myReservations.length} label="Réservations" />
                <Stat
                  value={
                    new Date().getFullYear() -
                    new Date(client.date_inscription).getFullYear() +
                    1 +
                    " an(s)"
                  }
                  label="Ancienneté"
                />
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="grid gap-6">
            {/* Formulaire */}
            <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="p-6 grid gap-5">
                {editing && (
                  <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-xl px-3 py-2.5">
                    <Pencil className="h-3 w-3 shrink-0" />
                    Mode édition actif — modifiez vos informations puis sauvegardez.
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Prénom"
                    value={form.prenom}
                    disabled={!editing}
                    onChange={(v) => setForm((prev) => (prev ? { ...prev, prenom: v } : prev))}
                  />
                  <Field
                    label="Nom"
                    value={form.nom}
                    disabled={!editing}
                    onChange={(v) => setForm((prev) => (prev ? { ...prev, nom: v } : prev))}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Téléphone"
                    value={form.telephone}
                    disabled={!editing}
                    onChange={(v) => setForm((prev) => (prev ? { ...prev, telephone: v } : prev))}
                  />
                  <Field
                    label="Email"
                    value={form.email}
                    disabled={!editing}
                    onChange={(v) => setForm((prev) => (prev ? { ...prev, email: v } : prev))}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="N° CIN"
                    value={form.cin}
                    disabled={!editing}
                    onChange={(v) => setForm((prev) => (prev ? { ...prev, cin: v } : prev))}
                  />
                  <Field
                    label="N° Permis"
                    value={form.permis}
                    disabled={!editing}
                    onChange={(v) => setForm((prev) => (prev ? { ...prev, permis: v } : prev))}
                  />
                </div>

                {!editing && (
                  <p className="text-[11px] text-muted-foreground/50 text-right pt-1">
                    Cliquez sur <strong className="text-muted-foreground">Modifier</strong> pour
                    changer vos informations.
                  </p>
                )}
              </div>
            </div>

            {/* CIN card */}
            <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="grid place-items-center h-8 w-8 rounded-full bg-primary/15 text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Photos du CIN
                  </Label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <CinUploadZone
                    label="Recto"
                    preview={cinRectoPreview}
                    editing={editing}
                    onUpload={() => cinRectoRef.current?.click()}
                    onClear={() => {
                      setCinRectoPreview(undefined);
                      setForm((prev) => (prev ? { ...prev, cin_photo_url: undefined } : prev));
                    }}
                  />
                  <input
                    ref={cinRectoRef}
                    type="file"
                    accept="image/*"
                    title="Uploader le recto du CIN"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, setCinRectoPreview, "cin_photo_url", 4, "CIN recto")
                    }
                  />

                  <CinUploadZone
                    label="Verso"
                    preview={cinVersoPreview}
                    editing={editing}
                    onUpload={() => cinVersoRef.current?.click()}
                    onClear={() => {
                      setCinVersoPreview(undefined);
                      setForm((prev) => (prev ? { ...prev, cin_verso_url: undefined } : prev));
                    }}
                  />
                  <input
                    ref={cinVersoRef}
                    type="file"
                    accept="image/*"
                    title="Uploader le verso du CIN"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, setCinVersoPreview, "cin_verso_url", 4, "CIN verso")
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

/* ── CIN Upload Zone ── */
function CinUploadZone({
  label,
  preview,
  editing,
  onUpload,
  onClear,
}: {
  label: string;
  preview?: string;
  editing: boolean;
  onUpload: () => void;
  onClear: () => void;
}) {
  if (preview) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-border/60 hover:border-primary/40 transition-colors">
        <img
          src={preview}
          alt={`CIN ${label}`}
          className="w-full h-40 object-contain bg-muted/20"
        />
        {editing && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={onUpload}
              className="text-xs text-white bg-black/60 px-3 py-1.5 rounded-lg hover:bg-black/80 transition-colors inline-flex items-center gap-1.5"
            >
              <Camera className="h-3 w-3" />
              Changer
            </button>
            <button
              onClick={onClear}
              className="text-xs text-white bg-destructive/80 px-3 py-1.5 rounded-lg hover:bg-destructive transition-colors inline-flex items-center gap-1.5"
            >
              <X className="h-3 w-3" />
              Retirer
            </button>
          </div>
        )}
        <div className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.15em] bg-black/60 text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-sm border border-white/10">
          {label}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (editing) onUpload();
      }}
      className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 transition-all ${
        editing
          ? "border-primary/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
          : "border-border/40 cursor-default"
      }`}
    >
      <div className="h-10 w-10 rounded-full bg-muted/40 grid place-items-center border border-border/50">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      {editing && <span className="text-[10px] text-muted-foreground/50">JPG, PNG — max 3 Mo</span>}
    </button>
  );
}

/* ── Field ── */
function Field({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </Label>
      <Input
        className={`border-border/50 bg-background/50 transition-all ${
          disabled
            ? "opacity-60 cursor-default"
            : "hover:border-primary/40 focus:border-primary"
        }`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ── Stat ── */
function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl text-gradient-gold font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}
