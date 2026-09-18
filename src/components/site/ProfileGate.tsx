import { useState, useEffect, useRef, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Phone, CreditCard, FileText, Mail, Sparkles, Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";

const GATE_KEY = "rl_profile_done_v1";

function isProfileComplete(
  prenom: string,
  nom: string,
  telephone: string,
  cin: string,
  permis: string,
) {
  return prenom.trim() && nom.trim() && telephone.trim() && cin.trim() && permis.trim();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProfileGate({ children }: { children: ReactNode }) {
  const { state, setState } = useApp();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  // Fields
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [cin, setCin] = useState("");
  const [permis, setPermis] = useState("");
  const [step, setStep] = useState<"welcome" | "form" | "login">("welcome");
  const [saving, setSaving] = useState(false);
  const [loginSearch, setLoginSearch] = useState("");

  // Photo states
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [cinRectoUrl, setCinRectoUrl] = useState<string | undefined>();
  const [cinVersoUrl, setCinVersoUrl] = useState<string | undefined>();
  const photoRef = useRef<HTMLInputElement>(null);
  const cinRectoRef = useRef<HTMLInputElement>(null);
  const cinVersoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.hydrated) return;
    const stored = localStorage.getItem(GATE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (state.clients.find((c) => c.id === parsed.clientId)) {
          setState((s) => {
            if (
              s.currentClientId === parsed.clientId &&
              JSON.stringify(s.connectedClientIds) === JSON.stringify(parsed.connectedIds || [parsed.clientId])
            ) {
              return s;
            }
            return {
              ...s,
              currentClientId: parsed.clientId,
              connectedClientIds: parsed.connectedIds || [parsed.clientId],
            };
          });
          setDone(true);
        } else {
          // Clear invalid client id from localStorage to avoid getting stuck
          localStorage.removeItem(GATE_KEY);
          setDone(false);
        }
      } catch {
        localStorage.removeItem(GATE_KEY);
        setDone(false);
      }
    } else {
      setDone(false);
    }
    setReady(true);
  }, [state.hydrated, state.clients, setState]);

  // Reset form fields when opening the add account gate
  useEffect(() => {
    if (state.showAddAccountGate) {
      setPrenom("");
      setNom("");
      setTelephone("");
      setEmail("");
      setCin("");
      setPermis("");
      setPhotoUrl(undefined);
      setCinRectoUrl(undefined);
      setCinVersoUrl(undefined);
      setStep("welcome");
    }
  }, [state.showAddAccountGate]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
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
    setter(url);
    toast.success(`${label} chargée.`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginSearch.trim()) {
      toast.error("Veuillez saisir votre numéro de téléphone ou e-mail.");
      return;
    }
    const cleanSearch = loginSearch.trim().toLowerCase();
    const found = state.clients.find(
      (c) =>
        c.telephone.toLowerCase().replace(/\s/g, "") === cleanSearch.replace(/\s/g, "") ||
        c.email.toLowerCase() === cleanSearch ||
        c.cin === cleanSearch,
    );

    if (found) {
      const newConnected = Array.from(new Set([...state.connectedClientIds, found.id]));
      setState((s) => ({
        ...s,
        currentClientId: found.id,
        connectedClientIds: newConnected,
        showAddAccountGate: false,
      }));
      localStorage.setItem(
        GATE_KEY,
        JSON.stringify({ clientId: found.id, connectedIds: newConnected }),
      );
      toast.success(`Bon retour, ${found.prenom} ! Vous êtes connecté.`);
      setDone(true);
    } else {
      toast.error("Aucun profil trouvé avec ces informations.");
    }
  };

  const handleSubmit = () => {
    if (!isProfileComplete(prenom, nom, telephone, cin, permis)) {
      toast.error("Merci de remplir tous les champs obligatoires (*).");
      return;
    }
    setSaving(true);

    const newId = Math.max(0, ...state.clients.map((c) => c.id)) + 1;
    const today = new Date().toISOString().slice(0, 10);
    const newClient = {
      id: newId,
      prenom: prenom.trim(),
      nom: nom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      cin: cin.trim(),
      permis: permis.trim(),
      date_inscription: today,
      photo_url: photoUrl,
      cin_photo_url: cinRectoUrl,
      cin_verso_url: cinVersoUrl,
    };

    const newConnected = Array.from(new Set([...state.connectedClientIds, newId]));
    setState((s) => ({
      ...s,
      clients: [...s.clients, newClient],
      currentClientId: newId,
      connectedClientIds: newConnected,
      showAddAccountGate: false,
    }));

    localStorage.setItem(GATE_KEY, JSON.stringify({ clientId: newId, connectedIds: newConnected }));
    toast.success(`Bienvenue, ${prenom} ! Votre profil a été créé.`);
    setSaving(false);
    setDone(true);
  };

  if (!ready || !state.hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img
            src="/logo.png"
            alt="Référence Location"
            className="h-16 w-16 object-contain opacity-80"
          />
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Chargement…</p>
        </div>
      </div>
    );
  }

  const isLocalAdminRoute =
    typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  // If the user explicitly requested to add an account (from the switcher dropdown),
  // we must show the gate, regardless of admin or client connection status.
  const bypassGate = !state.showAddAccountGate && (state.isAdmin || isLocalAdminRoute || done);

  if (bypassGate) return <>{children}</>;

  /* ── Welcome splash ──────────────────────────────────────────────── */
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow opacity-[0.06] pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Diego Suarez · Madagascar
          </div>

          <div className="mx-auto mb-6 h-36 w-36 rounded-2xl overflow-hidden shadow-[0_0_60px_oklch(0.78_0.10_85/0.35)] border border-primary/30">
            <img
              src="/logo.png"
              alt="Référence Location"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl mb-4">
            Référence <br />
            <span className="text-gradient-gold">Location</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Location de véhicules premium à Diego Suarez.
          </p>
          <p className="text-muted-foreground/70 text-sm mb-10">
            Pour accéder à nos services, créez votre profil client ou connectez-vous si vous en avez
            déjà un.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 font-medium text-base cursor-pointer"
              onClick={() => setStep("form")}
            >
              Créer mon profil
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto px-8 font-medium text-base border border-primary/10 cursor-pointer"
              onClick={() => setStep("login")}
            >
              Se connecter (Déjà client)
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 font-medium text-base border-primary/40 hover:bg-primary/10 text-primary cursor-pointer"
              onClick={() => {
                window.location.href = "/admin";
              }}
            >
              Espace Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Login screen ────────────────────────────────────────────────── */
  if (step === "login") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow opacity-[0.04] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary mb-4">
              <User className="h-3 w-3" />
              Connexion Client
            </div>
            <h2 className="font-display text-4xl">Bon retour</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Saisissez votre numéro de téléphone ou e-mail pour vous connecter.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-6 sm:p-8 shadow-card">
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="loginSearch"
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
                >
                  Numéro de téléphone, e-mail ou CIN
                </Label>
                <Input
                  id="loginSearch"
                  placeholder="Ex: 034 12 345 67, client@mail.mg ou CIN"
                  value={loginSearch}
                  onChange={(e) => setLoginSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full mt-2 cursor-pointer">
                Se connecter
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setStep("welcome")}
              >
                Retour
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ── Profile form ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow opacity-[0.04] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-500">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary mb-4">
            <User className="h-3 w-3" />
            Nouvel utilisateur
          </div>
          <h2 className="font-display text-4xl">Mon Profil</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Ces informations sont nécessaires pour effectuer une réservation.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border/60 bg-card p-6 sm:p-8 shadow-card">
          <div className="grid gap-6">
            {/* ── Photo de profil ──────────────────────────────────── */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                {photoUrl ? (
                  <div className="relative">
                    <img
                      src={photoUrl}
                      alt="Photo de profil"
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/30"
                    />
                    <button
                      onClick={() => setPhotoUrl(undefined)}
                      aria-label="Supprimer la photo de profil"
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground grid place-items-center text-xs hover:scale-110 transition-transform cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => photoRef.current?.click()}
                    className="h-24 w-24 rounded-full border-2 border-dashed border-primary/30 bg-muted/30 grid place-items-center hover:border-primary/60 hover:bg-primary/5 transition-colors cursor-pointer"
                    aria-label="Uploader une photo de profil"
                  >
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </button>
                )}
              </div>
              <button
                onClick={() => photoRef.current?.click()}
                className="text-xs text-primary hover:underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="h-3 w-3" />
                {photoUrl ? "Changer la photo" : "Ajouter une photo de profil"}
              </button>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                title="Uploader une photo de profil"
                className="hidden"
                onChange={(e) => handleFileUpload(e, setPhotoUrl, 4, "Photo de profil")}
              />
            </div>

            {/* ── Informations personnelles ────────────────────────── */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Prénom <span className="text-primary">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="ex : Hery"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Nom <span className="text-primary">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="ex : Rakoto"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Téléphone <span className="text-primary">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="034 12 345 67"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Email <span className="text-muted-foreground/50">(optionnel)</span>
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="email"
                    placeholder="vous@mail.mg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  N° CIN <span className="text-primary">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 font-mono"
                    placeholder="201234567890"
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  N° Permis <span className="text-primary">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 font-mono"
                    placeholder="DG-2021-0123"
                    value={permis}
                    onChange={(e) => setPermis(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ── CIN Recto / Verso ────────────────────────────────── */}
            <div className="border-t border-border/40 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
                  Photos du CIN <span className="text-muted-foreground/50">(optionnel)</span>
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Recto */}
                <PhotoUploadZone
                  label="Recto"
                  preview={cinRectoUrl}
                  onClear={() => setCinRectoUrl(undefined)}
                  onUpload={() => cinRectoRef.current?.click()}
                />
                <input
                  ref={cinRectoRef}
                  type="file"
                  accept="image/*"
                  title="Uploader le recto du CIN"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setCinRectoUrl, 4, "CIN recto")}
                />

                {/* Verso */}
                <PhotoUploadZone
                  label="Verso"
                  preview={cinVersoUrl}
                  onClear={() => setCinVersoUrl(undefined)}
                  onUpload={() => cinVersoRef.current?.click()}
                />
                <input
                  ref={cinVersoRef}
                  type="file"
                  accept="image/*"
                  title="Uploader le verso du CIN"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setCinVersoUrl, 4, "CIN verso")}
                />
              </div>
            </div>

            {/* Note */}
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed border-t border-border/40 pt-4">
              Vos informations sont uniquement utilisées pour traiter vos réservations chez
              Référence Location. Elles ne sont pas partagées à des tiers.
            </p>

            {/* Submit */}
            <Button
              size="lg"
              className="w-full font-medium mt-1 cursor-pointer"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Enregistrement…" : "Accéder au site →"}
            </Button>
          </div>
        </div>

        {/* Back link */}
        <button
          className="mt-4 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors block mx-auto cursor-pointer"
          onClick={() => setStep("welcome")}
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

/* ── Reusable CIN upload zone ───────────────────────────────────────── */
function PhotoUploadZone({
  label,
  preview,
  onClear,
  onUpload,
}: {
  label: string;
  preview?: string;
  onClear: () => void;
  onUpload: () => void;
}) {
  if (preview) {
    return (
      <div className="relative group rounded-lg overflow-hidden border border-border/60">
        <img
          src={preview}
          alt={`CIN ${label}`}
          className="w-full h-36 object-contain bg-muted/20"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onUpload}
            className="text-xs text-white bg-black/60 px-3 py-1.5 rounded hover:bg-black/80 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="h-3 w-3" />
            Changer
          </button>
          <button
            onClick={onClear}
            className="text-xs text-white bg-destructive/80 px-3 py-1.5 rounded hover:bg-destructive transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <X className="h-3 w-3" />
            Retirer
          </button>
        </div>
        <div className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.15em] bg-black/60 text-white px-2 py-0.5 rounded font-medium backdrop-blur-sm">
          {label}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onUpload}
      className="w-full border-2 border-dashed border-primary/20 rounded-lg py-8 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
    >
      <div className="h-10 w-10 rounded-full bg-muted/40 grid place-items-center">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground/50 font-medium">JPG, PNG — max 4 Mo</span>
    </button>
  );
}
