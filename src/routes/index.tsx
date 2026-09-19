import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { HeroAnimatedBackground } from "@/components/site/HeroAnimatedBackground";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  useApp,
  formatAr,
  daysBetween,
  nextReservationId,
  type Vehicule,
  type Review,
  initialReviews,
} from "@/lib/store";
import {
  CalendarDays,
  Users,
  Car,
  Shield,
  Clock,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Phone,
  ArrowRight,
  Star,
  Quote,
  CheckCircle2,
  Plus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  Compass,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Référence Location — Diego Suarez · Location de voiture" },
      {
        name: "description",
        content:
          "Réservez en ligne votre voiture à Diego Suarez : citadines, berlines, monospaces et 4x4. Service 7j/7.",
      },
      { property: "og:title", content: "Référence Location de Voiture" },
      {
        property: "og:description",
        content: "Le parc de référence à Diego Suarez. Réservation en ligne en quelques clics.",
      },
    ],
  }),
  component: Accueil,
});

function Accueil() {
  const { state, setState } = useApp();
  const [type, setType] = useState<string>("all");
  const [places, setPlaces] = useState<string>("all");
  const [dateDepart, setDateDepart] = useState("");
  const [dateRetour, setDateRetour] = useState("");
  const [lieuDepart, setLieuDepart] = useState("Aéroport Arrachart");
  const [lieuRetour, setLieuRetour] = useState("Aéroport Arrachart");
  const [selected, setSelected] = useState<Vehicule | null>(null);

  const filtered = useMemo(() => {
    return state.vehicules.filter((v) => {
      if (type !== "all" && v.type !== type) return false;
      if (places !== "all" && v.places < parseInt(places, 10)) return false;
      return true;
    });
  }, [state.vehicules, type, places]);

  return (
    <AppShell>
      <Toaster richColors position="top-right" />
      <Hero vehiculesCount={state.vehicules.length} />
      <SearchBar
        type={type}
        setType={setType}
        places={places}
        setPlaces={setPlaces}
        dateDepart={dateDepart}
        setDateDepart={setDateDepart}
        dateRetour={dateRetour}
        setDateRetour={setDateRetour}
        lieuDepart={lieuDepart}
        setLieuDepart={setLieuDepart}
        lieuRetour={lieuRetour}
        setLieuRetour={setLieuRetour}
      />

      {/* ═══ Section parc de véhicules ═══ */}
      <section id="vehicules" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16">
        {/* En-tête de section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary mb-3">
              <span className="w-6 h-px bg-primary inline-block" />
              Notre parc
              <span className="w-6 h-px bg-primary inline-block" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Véhicules <span className="text-gradient-gold">disponibles</span>
            </h2>
            <div className="h-0.5 mt-3 w-16 bg-gradient-to-r from-primary to-transparent rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary">
              {filtered.length} véhicule{filtered.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VehiculeCard
              key={v.id}
              v={v}
              dateDepart={dateDepart}
              dateRetour={dateRetour}
              onReserve={() => {
                if (state.currentClientId === 0) {
                  toast.error("Veuillez vous connecter pour réserver un véhicule.");
                  setState((s) => ({ ...s, showAddAccountGate: true }));
                } else {
                  setSelected(v);
                }
              }}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <Car className="h-12 w-12 opacity-20" />
              <p className="text-base">Aucun véhicule ne correspond à vos critères.</p>
            </div>
          )}
        </div>
      </section>

      <AvisClients />

      <Trust />

      <ReservationModal
        vehicule={selected}
        onClose={() => setSelected(null)}
        prefillDepart={dateDepart}
        prefillRetour={dateRetour}
        prefillLieuDepart={lieuDepart}
        prefillLieuRetour={lieuRetour}
      />
    </AppShell>
  );
}

function Hero({ vehiculesCount }: { vehiculesCount: number }) {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Arrière-plan animé immersif : orbes dorées, poussières d'or et tracés de route */}
      <HeroAnimatedBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* ── Colonne gauche : texte ── */}
          <div>
            <div className="anim-fade-up anim-d1 inline-flex items-center gap-2 rounded-full border border-primary/30 px-3.5 py-1.5 text-xs uppercase tracking-[0.2em] text-primary bg-primary/5 backdrop-blur-sm">
              Diego Suarez · Antsiranana
            </div>
            <h1 className="anim-fade-up anim-d2 font-display text-5xl sm:text-6xl lg:text-7xl mt-6 leading-[1.05]">
              La <span className="text-gradient-gold">référence</span> de la location{" "}
              <br className="hidden sm:block" />
              de voiture dans le Nord.
            </h1>
            <p className="anim-fade-up anim-d3 mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Large flotte de véhicules récents, confortables et parfaitement entretenus pour tous
              vos déplacements. Service client 7j/7 — 24h/24, prise en charge rapide à l'aéroport,
              en ville ou directement à votre hôtel.
            </p>
            <div className="anim-fade-up anim-d4 mt-8 flex flex-wrap items-center gap-3.5">
              <Button size="lg" asChild className="font-medium shadow-gold cursor-pointer">
                <a href="#parc" className="inline-flex items-center gap-2">
                  Réserver maintenant
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary/40 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
              >
                <a href="tel:+261322472569" className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Appeler +261 32 24 725 69
                </a>
              </Button>
            </div>

            {/* Cartes stats */}
            <div className="mt-14 sm:mt-16 grid grid-cols-3 gap-3.5 sm:gap-6">
              <div className="anim-fade-up anim-d5 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm p-4 sm:p-5 transition-all hover:border-primary/40 shadow-card">
                <div className="font-display text-3xl sm:text-4xl text-gradient-gold font-bold">
                  {vehiculesCount > 0 ? `${vehiculesCount}+` : "5+"}
                </div>
                <div className="text-[11px] sm:text-xs uppercase tracking-[0.16em] text-muted-foreground mt-1.5 font-medium">
                  Véhicules au parc
                </div>
              </div>
              <div className="anim-fade-up anim-d6 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm p-4 sm:p-5 transition-all hover:border-primary/40 shadow-card">
                <div className="font-display text-3xl sm:text-4xl text-gradient-gold font-bold">
                  12{" "}
                  <span className="text-sm sm:text-base font-sans font-normal text-primary/80">
                    ans
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs uppercase tracking-[0.16em] text-muted-foreground mt-1.5 font-medium">
                  D'expérience
                </div>
              </div>
              <div className="anim-fade-up anim-d7 rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm p-4 sm:p-5 transition-all hover:border-primary/40 shadow-card">
                <div className="font-display text-3xl sm:text-4xl text-gradient-gold font-bold">
                  24/7
                </div>
                <div className="text-[11px] sm:text-xs uppercase tracking-[0.16em] text-muted-foreground mt-1.5 font-medium">
                  Disponibilité
                </div>
              </div>
            </div>
          </div>

          {/* ── Colonne droite / Mobile : carte Google Maps ── */}
          <div className="anim-slide-right anim-d3 flex flex-col gap-3 mt-6 lg:mt-0">
            <div className="rounded-2xl border border-primary/25 bg-card/40 backdrop-blur-sm overflow-hidden shadow-gold">
              {/* En-tête carte */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-primary/15 bg-card/60">
                <div className="grid place-items-center h-7 w-7 rounded-full bg-primary/15 text-primary shrink-0">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">Référence Location</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    En face Mitabe · Antsiranana, Madagascar
                  </p>
                </div>
              </div>
              {/* Map embed */}
              <div className="relative w-full h-[260px] sm:h-[340px]">
                <iframe
                  title="Référence Location — Mitabe, Diego Suarez"
                  src="https://maps.google.com/maps?ll=-12.27570,49.29065&t=m&z=19&output=embed"
                  className="absolute inset-0 w-full h-full border-0 grayscale-[30%] saturate-[120%]"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {/* Overlay doré léger */}
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-primary/10 rounded-b-2xl" />
              </div>
            </div>
            {/* Badge sous la carte */}
            <p className="text-center text-xs text-muted-foreground tracking-wide">
              📍 Service disponible dans toute la région de Diana
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface SearchBarProps {
  type: string;
  setType: (v: string) => void;
  places: string;
  setPlaces: (v: string) => void;
  dateDepart: string;
  setDateDepart: (v: string) => void;
  dateRetour: string;
  setDateRetour: (v: string) => void;
  lieuDepart: string;
  setLieuDepart: (v: string) => void;
  lieuRetour: string;
  setLieuRetour: (v: string) => void;
}

function SearchBar(p: SearchBarProps) {
  const { state } = useApp();

  // Combine defaults, custom saved locations, and past reservation locations
  const suggestions = Array.from(
    new Set([
      "Aéroport Arrachart",
      "Centre-ville Diego",
      "Hôtel (Diego Suarez)",
      "Ramena",
      ...(state.customLieux ?? []),
      ...state.reservations.map((r) => r.lieu_prise),
      ...state.reservations.map((r) => r.lieu_retour),
    ]),
  ).filter(Boolean) as string[];

  // Extract unique vehicle types dynamically from existing vehicles
  const vehicleTypes = Array.from(new Set(state.vehicules.map((v) => v.type))).filter(Boolean);

  return (
    <div id="parc" className="mx-auto max-w-7xl px-4 sm:px-6 -mt-14 relative z-20">
      {/* Panneau de recherche glassmorphism premium */}
      <div className="rounded-2xl border border-primary/25 bg-card/70 backdrop-blur-xl shadow-[0_20px_60px_-15px_oklch(0_0_0/0.6)] overflow-hidden">
        {/* Bande dorée supérieure */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

        <div className="p-5 sm:p-6">
          {/* Titre et icône */}
          <div className="flex items-center gap-2 mb-5">
            <div className="grid place-items-center h-7 w-7 rounded-full bg-primary/15 text-primary">
              <CalendarDays className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary font-medium">
              Rechercher un véhicule
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
            {/* Type */}
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                <Car className="h-3 w-3" /> Type
              </Label>
              <Select value={p.type} onValueChange={p.setType}>
                <SelectTrigger className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {vehicleTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Places */}
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3" /> Places
              </Label>
              <Select value={p.places} onValueChange={p.setPlaces}>
                <SelectTrigger className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                  <SelectItem value="7">7+</SelectItem>
                  <SelectItem value="9">9+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lieu Départ */}
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Lieu Départ
              </Label>
              <Input
                list="lieux-suggestions"
                value={p.lieuDepart}
                onChange={(e) => p.setLieuDepart(e.target.value)}
                placeholder="Ex: Aéroport..."
                className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
              />
            </div>

            {/* Lieu Retour */}
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Lieu Retour
              </Label>
              <Input
                list="lieux-suggestions"
                value={p.lieuRetour}
                onChange={(e) => p.setLieuRetour(e.target.value)}
                placeholder="Ex: Centre-ville..."
                className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
              />
            </div>

            <datalist id="lieux-suggestions">
              {suggestions.map((s, i) => (
                <option key={i} value={s} />
              ))}
            </datalist>

            {/* Date Départ */}
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" /> Départ
              </Label>
              <Input
                type="date"
                value={p.dateDepart}
                onChange={(e) => p.setDateDepart(e.target.value)}
                className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
              />
            </div>

            {/* Date Retour */}
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" /> Retour
              </Label>
              <Input
                type="date"
                value={p.dateRetour}
                onChange={(e) => p.setDateRetour(e.target.value)}
                className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
              />
            </div>

            {/* Bouton recherche */}
            <div className="flex items-end">
              <Button
                className="w-full shadow-gold font-medium tracking-wide hover:brightness-110 transition-all"
                onClick={() => {
                  const el = document.getElementById("vehicules");
                  if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                }}
              >
                <Compass className="h-4 w-4 mr-1.5" />
                Rechercher
              </Button>
            </div>
          </div>
        </div>

        {/* Bande dorée inférieure */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </div>
  );
}

function VehiculeCard({
  v,
  dateDepart,
  dateRetour,
  onReserve,
}: {
  v: Vehicule;
  dateDepart: string;
  dateRetour: string;
  onReserve: () => void;
}) {
  const jours = dateDepart && dateRetour ? daysBetween(dateDepart, dateRetour) : null;
  const [showImage, setShowImage] = useState(false);
  const images = v.images && v.images.length > 0 ? v.images : v.image_url ? [v.image_url] : [];
  const [imgIdx, setImgIdx] = useState(0);

  const nextImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImgIdx((i) => (i + 1) % images.length);
  };
  const prevImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImgIdx((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 bg-card shadow-card hover:shadow-[0_20px_50px_-15px_oklch(0.78_0.1_85/0.3)] transition-all duration-500 hover:-translate-y-1">
      {/* Zone image */}
      <div className="relative h-52 w-full overflow-hidden bg-muted shrink-0">
        {images.length > 0 ? (
          <>
            <img
              src={images[imgIdx]}
              alt={`${v.marque} ${v.modele}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
              onClick={() => setShowImage(true)}
            />
            {/* Gradient overlay cinématique */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Bouton d'aperçu centré sur hover */}
            <button
              onClick={() => setShowImage(true)}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 border border-white/20 text-white hover:bg-primary/80 hover:border-primary transition-all">
                <Eye className="h-5 w-5" />
              </div>
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-primary/80 transition-all z-20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-primary/80 transition-all z-20"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setImgIdx(idx);
                      }}
                      className={`rounded-full transition-all duration-300 ${idx === imgIdx ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"}`}
                    />
                  ))}
                </div>
              </>
            )}
            <Dialog open={showImage} onOpenChange={setShowImage}>
              <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none [&>button]:bg-black/50 [&>button]:text-white [&>button]:hover:bg-black/70 [&>button]:rounded-full">
                <DialogTitle className="sr-only">
                  {v.marque} {v.modele}
                </DialogTitle>
                <div className="relative flex items-center justify-center">
                  <img
                    src={images[imgIdx]}
                    alt={`${v.marque} ${v.modele}`}
                    className="w-full h-auto rounded-xl object-contain max-h-[85vh]"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImg}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={nextImg}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-vehicle-fallback">
            <span className="transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl">
              {v.emoji}
            </span>
          </div>
        )}

        {/* Badge disponibilité avec dot animé */}
        <div
          className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm border ${
            v.disponible
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-muted/60 border-border/40 text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              v.disponible ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"
            }`}
          />
          {v.disponible ? "Disponible" : "En location"}
        </div>

        {/* Badge type en haut gauche */}
        <span className="absolute top-3 left-3 z-10 text-[10px] uppercase tracking-[0.18em] text-white/90 bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium border border-white/10">
          {v.type}
        </span>
      </div>

      {/* Contenu de la carte */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Titre + immat */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl leading-tight group-hover:text-primary transition-colors">
            {v.marque} {v.modele}
          </h3>
          <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded font-mono shrink-0">
            {v.immatriculation}
          </span>
        </div>

        {/* Caractéristiques */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-lg px-2.5 py-1">
            <Users className="h-3.5 w-3.5 text-primary/70" />
            {v.places} places
          </span>
          <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-lg px-2.5 py-1">
            <Car className="h-3.5 w-3.5 text-primary/70" />
            {v.type}
          </span>
        </div>

        {/* Séparateur doré */}
        <div className="h-px bg-gradient-to-r from-primary/20 via-primary/40 to-transparent" />

        {/* Prix + CTA */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="font-display text-2xl text-gradient-gold font-bold">
              {formatAr(v.prix_jour)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              par jour
              {jours ? (
                <span className="ml-1.5 text-primary/80 font-medium">
                  · {jours} j = {formatAr(v.prix_jour * jours)}
                </span>
              ) : (
                ""
              )}
            </div>
            {v.prix_hors_ville && (
              <div className="text-[10px] mt-1 text-primary/70 font-medium">
                Hors ville : {formatAr(v.prix_hors_ville)} /j
              </div>
            )}
          </div>
          <Button
            disabled={!v.disponible}
            onClick={onReserve}
            size="sm"
            className="shadow-gold hover:brightness-110 transition-all"
          >
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            Réserver
          </Button>
        </div>
      </div>

      {/* Ligne décorative dorée en bas au hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

function ReservationModal({
  vehicule,
  onClose,
  prefillDepart,
  prefillRetour,
  prefillLieuDepart,
  prefillLieuRetour,
}: {
  vehicule: Vehicule | null;
  onClose: () => void;
  prefillDepart: string;
  prefillRetour: string;
  prefillLieuDepart?: string;
  prefillLieuRetour?: string;
}) {
  if (!vehicule) return null;
  return (
    <ReservationModalInner
      key={vehicule.id}
      vehicule={vehicule}
      onClose={onClose}
      prefillDepart={prefillDepart}
      prefillRetour={prefillRetour}
      prefillLieuDepart={prefillLieuDepart}
      prefillLieuRetour={prefillLieuRetour}
    />
  );
}

function ReservationModalInner({
  vehicule,
  onClose,
  prefillDepart,
  prefillRetour,
  prefillLieuDepart,
  prefillLieuRetour,
}: {
  vehicule: Vehicule;
  onClose: () => void;
  prefillDepart: string;
  prefillRetour: string;
  prefillLieuDepart?: string;
  prefillLieuRetour?: string;
}) {
  const { state, setState } = useApp();
  const client = state.clients.find((c) => c.id === state.currentClientId);
  const [nom, setNom] = useState(client ? `${client.prenom} ${client.nom}` : "");
  const [tel, setTel] = useState(client?.telephone ?? "");
  const [depart, setDepart] = useState(prefillDepart);
  const [retour, setRetour] = useState(prefillRetour);
  const [lieuDepart, setLieuDepart] = useState(prefillLieuDepart || "Aéroport Arrachart");
  const [lieuRetour, setLieuRetour] = useState(prefillLieuRetour || "Aéroport Arrachart");
  const [horsVille, setHorsVille] = useState(false);

  const validDates = depart && retour && new Date(retour) >= new Date(depart);
  const jours = validDates ? daysBetween(depart, retour) : 0;
  const prixApplicable =
    horsVille && vehicule.prix_hors_ville ? vehicule.prix_hors_ville : vehicule.prix_jour;
  const total = jours * prixApplicable;

  const submit = () => {
    if (state.currentClientId === 0) {
      toast.error("Veuillez vous connecter pour valider la réservation.");
      setState((s) => ({ ...s, showAddAccountGate: true }));
      return;
    }
    if (!nom.trim() || !tel.trim() || !validDates || !lieuDepart.trim() || !lieuRetour.trim()) {
      toast.error("Merci de compléter tous les champs avec des dates valides.");
      return;
    }
    const ref = nextReservationId(state.reservations);
    // Save any new custom locations to the persistent list
    const defaultLieux = [
      "Aéroport Arrachart",
      "Centre-ville Diego",
      "Hôtel (Diego Suarez)",
      "Ramena",
    ];
    const existingLieux = new Set([...defaultLieux, ...(state.customLieux ?? [])]);
    const newLieux: string[] = [];
    if (lieuDepart.trim() && !existingLieux.has(lieuDepart.trim()))
      newLieux.push(lieuDepart.trim());
    if (lieuRetour.trim() && !existingLieux.has(lieuRetour.trim()))
      newLieux.push(lieuRetour.trim());

    setState((s) => ({
      ...s,
      customLieux: [...new Set([...(s.customLieux ?? []), ...newLieux])],
      reservations: [
        ...s.reservations,
        {
          id: ref,
          client_id: s.currentClientId,
          voiture_id: vehicule.id,
          date_depart: depart,
          date_retour: retour,
          lieu_prise: lieuDepart,
          lieu_retour: lieuRetour,
          montant: total,
          statut: "pending",
          created_at: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
    toast.success(`Réservation ${ref} créée — nous vous appelons sous peu.`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Réserver {vehicule.marque} {vehicule.modele}
          </DialogTitle>
          <DialogDescription>
            {vehicule.type} · {vehicule.places} places · {formatAr(vehicule.prix_jour)}/jour
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Nom complet</Label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1.5"
              placeholder="Prénom Nom"
            />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="mt-1.5"
              placeholder="034 xx xxx xx"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date départ</Label>
              <Input
                type="date"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Date retour</Label>
              <Input
                type="date"
                value={retour}
                onChange={(e) => setRetour(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Lieu de départ</Label>
              <Input
                value={lieuDepart}
                onChange={(e) => setLieuDepart(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Lieu de retour</Label>
              <Input
                value={lieuRetour}
                onChange={(e) => setLieuRetour(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          {vehicule.prix_hors_ville && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={horsVille}
                onChange={(e) => setHorsVille(e.target.checked)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Sortie <span className="font-medium text-foreground">hors ville</span>
                <span className="ml-1.5 text-primary text-xs">
                  ({formatAr(vehicule.prix_hors_ville)}/j)
                </span>
              </span>
            </label>
          )}
          <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {jours} jour{jours > 1 ? "s" : ""} × {formatAr(prixApplicable)}
              {horsVille && <span className="ml-1 text-primary text-xs">(hors ville)</span>}
            </span>
            <span className="font-display text-2xl text-primary">{formatAr(total)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={!validDates}>
            Confirmer la réservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Trust() {
  const items = [
    {
      icon: Shield,
      title: "Véhicules entretenus",
      text: "Contrôle technique régulier sur l'ensemble de notre parc.",
    },
    {
      icon: Clock,
      title: "Service 24/7",
      text: "Une équipe joignable de jour comme de nuit, 7 jours sur 7.",
    },
    {
      icon: MapPin,
      title: "Prise en charge partout",
      text: "Aéroport Arrachart, hôtels, centre-ville, port — nous vous livrons.",
    },
    {
      icon: CalendarDays,
      title: "Réservation rapide",
      text: "Confirmation en quelques minutes par téléphone ou email.",
    },
  ];
  return (
    <section className="border-t border-border/60 bg-sidebar/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid gap-8 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.title}>
            <span className="grid h-10 w-10 place-items-center rounded-md border border-primary/30 text-primary">
              <it.icon className="h-5 w-5" />
            </span>
            <div className="font-display text-lg mt-4">{it.title}</div>
            <p className="text-sm text-muted-foreground mt-1.5">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AvisClients() {
  const { state, setState } = useApp();
  const [showModal, setShowModal] = useState(false);

  const reviewsList = state.reviews && state.reviews.length > 0 ? state.reviews : initialReviews;
  const avgRating = (reviewsList.reduce((acc, r) => acc + r.note, 0) / reviewsList.length).toFixed(
    1,
  );

  const handleOpenModal = () => {
    if (state.currentClientId === 0) {
      toast.error("Veuillez vous connecter pour laisser un avis.");
      setState((s) => ({ ...s, showAddAccountGate: true }));
      return;
    }
    setShowModal(true);
  };

  return (
    <section className="border-t border-border/60 bg-card/20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-3.5 py-1 text-xs uppercase tracking-[0.2em] text-primary bg-primary/5 backdrop-blur-sm mb-3">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            Témoignages
          </div>
          <h2 className="font-display text-3xl sm:text-4xl">Avis de nos clients</h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Découvrez les retours d'expérience des voyageurs et résidents qui nous font confiance à
            Diego Suarez.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm">
              <div className="flex text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
              </div>
              <span className="font-semibold text-foreground">{avgRating} / 5</span>
              <span className="text-muted-foreground text-xs">· {reviewsList.length} avis</span>
            </div>

            <Button size="sm" onClick={handleOpenModal} className="rounded-full shadow-gold">
              <Plus className="h-4 w-4 mr-1.5" />
              Donner votre avis
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviewsList.map((rev) => (
            <Card
              key={rev.id}
              className="border-border/60 bg-card/40 backdrop-blur-sm shadow-card hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-primary">
                    {[...Array(rev.note)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-primary/30" />
                </div>
                <p className="text-sm text-foreground/90 italic leading-relaxed">
                  "{rev.commentaire}"
                </p>
              </CardContent>
              <div className="px-6 pb-6 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    {rev.nom}
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    {rev.ville} · {rev.vehicule}
                  </div>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">{rev.date}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {showModal && <NewReviewModal onClose={() => setShowModal(false)} />}
    </section>
  );
}

function NewReviewModal({ onClose }: { onClose: () => void }) {
  const { state, setState } = useApp();
  const client = state.clients.find((c) => c.id === state.currentClientId);

  const [nom, setNom] = useState(client ? `${client.prenom} ${client.nom}` : "");
  const [ville, setVille] = useState("Diego Suarez");
  const [vehicule, setVehicule] = useState(
    state.vehicules.length > 0
      ? `${state.vehicules[0].marque} ${state.vehicules[0].modele}`
      : "Hyundai Getz Phase 2",
  );
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");

  const submit = () => {
    if (!nom.trim() || !commentaire.trim()) {
      toast.error("Veuillez remplir votre nom et votre commentaire.");
      return;
    }

    const todayFr = new Date().toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    // Capitalize first letter of month
    const formattedDate = todayFr.charAt(0).toUpperCase() + todayFr.slice(1);

    const newRev: Review = {
      id: `REV-${Date.now()}`,
      client_id: state.currentClientId,
      nom: nom.trim(),
      ville: ville.trim() || "Madagascar",
      vehicule: vehicule || "Véhicule loué",
      note,
      date: formattedDate,
      commentaire: commentaire.trim(),
    };

    const currentReviews =
      state.reviews && state.reviews.length > 0 ? state.reviews : initialReviews;

    setState((s) => ({
      ...s,
      reviews: [newRev, ...currentReviews],
    }));

    toast.success("Merci ! Votre avis a été publié avec succès.");
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Donner votre avis</DialogTitle>
          <DialogDescription>
            Partagez votre expérience de location avec les futurs clients de Référence Location.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Note par étoiles */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Votre note
            </Label>
            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNote(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= note
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30 hover:text-primary/50"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-semibold text-sm text-primary">{note} / 5</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nom / Prénom</Label>
              <Input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="mt-1.5"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <Label>Ville / Origine</Label>
              <Input
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="mt-1.5"
                placeholder="Ex: Diego Suarez, Réunion..."
              />
            </div>
          </div>

          <div>
            <Label>Véhicule loué</Label>
            <Select value={vehicule} onValueChange={setVehicule}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.vehicules.map((v) => (
                  <SelectItem key={v.id} value={`${v.marque} ${v.modele}`}>
                    {v.marque} {v.modele}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Votre commentaire</Label>
            <textarea
              rows={4}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Décrivez votre expérience avec le véhicule, le service, l'équipe..."
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit}>Publier mon avis</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
