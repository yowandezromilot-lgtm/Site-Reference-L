import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { useApp, type Reservation } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import {
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  UserCircle,
  Plus,
  LogOut,
  Check,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

const GATE_KEY = "rl_profile_done_v1";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/mes-reservations", label: "Mes Réservations" },
  { to: "/contact", label: "Contact" },
  { to: "/profil", label: "Mon Profil" },
];

/** Mini dropdown to switch between connected accounts */
function AccountSwitcher() {
  const { state, setState } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentClient = state.clients.find((c) => c.id === state.currentClientId);
  const connectedClients = state.clients.filter((c) => state.connectedClientIds.includes(c.id));

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!currentClient) return null;

  const switchTo = (id: number) => {
    setState((s) => ({ ...s, currentClientId: id }));
    setOpen(false);
  };

  const disconnectCurrent = () => {
    const newConnected = state.connectedClientIds.filter((id) => id !== state.currentClientId);
    if (newConnected.length > 0) {
      const nextId = newConnected[0];
      setState((s) => ({ ...s, currentClientId: nextId, connectedClientIds: newConnected }));
    } else {
      localStorage.removeItem(GATE_KEY);
      setState((s) => ({ ...s, currentClientId: 0, connectedClientIds: [] }));
    }
    setOpen(false);
  };

  const addAccount = () => {
    setState((s) => ({ ...s, showAddAccountGate: true }));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/50 hover:bg-card/90 transition-all duration-200 cursor-pointer"
        aria-label="Changer de compte"
      >
        {/* Avatar */}
        <div className="h-7 w-7 rounded-full bg-gradient-gold flex items-center justify-center text-[11px] font-bold text-primary-foreground uppercase shrink-0 overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
          {currentClient.photo_url ? (
            <img src={currentClient.photo_url} alt="Profil" className="h-full w-full object-cover" />
          ) : (
            <>
              {currentClient.prenom[0]}
              {currentClient.nom[0]}
            </>
          )}
        </div>
        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
          {currentClient.prenom}
        </span>
        {connectedClients.length > 1 && (
          <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
            {connectedClients.length}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-68 rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-[0_20px_60px_-10px_oklch(0_0_0/0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Bande dorée */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="px-3.5 py-2.5 border-b border-border/40">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Comptes connectés
            </p>
          </div>

          <div className="py-1 max-h-48 overflow-y-auto">
            {connectedClients.map((c) => (
              <button
                key={c.id}
                onClick={() => switchTo(c.id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-primary/5 transition-colors text-left cursor-pointer group"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-[11px] font-bold text-primary-foreground uppercase shrink-0 overflow-hidden ring-1 ring-primary/20">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt="Profil" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      {c.prenom[0]}
                      {c.nom[0]}
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {c.prenom} {c.nom}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{c.telephone}</div>
                </div>
                {c.id === state.currentClientId && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-border/40 py-1">
            <button
              onClick={addAccount}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-primary/5 transition-colors text-left cursor-pointer text-sm text-primary"
            >
              <div className="h-8 w-8 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center shrink-0 hover:border-primary/70 transition-colors">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <span>Ajouter / Se connecter</span>
            </button>
            <button
              onClick={disconnectCurrent}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-destructive/10 transition-colors text-left cursor-pointer text-sm text-destructive"
            >
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                <LogOut className="h-4 w-4" />
              </div>
              <span>Déconnecter {currentClient.prenom}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { state, setState } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentClient = state.clients.find((c) => c.id === state.currentClientId);

  // Fermer le menu mobile au changement de route
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // --- Client Notifications Effect ---
  const prevClientReservations = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!currentClient) return;

    const clientRes = state.reservations.filter((r) => r.client_id === currentClient.id);
    const currentStatuses: Record<string, string> = {};
    let hasNewConfirmation = false;

    clientRes.forEach((r) => {
      currentStatuses[r.id] = r.statut;
      const oldStatut = prevClientReservations.current[r.id];
      if (oldStatut === "pending" && r.statut === "confirmed") {
        const vehicule = state.vehicules.find((v) => v.id === r.voiture_id);
        const nomVehicule = vehicule ? `${vehicule.marque} ${vehicule.modele}` : "votre véhicule";

        toast.success(`🎉 Bonne nouvelle, ${currentClient.prenom} !`, {
          description: `Votre réservation pour ${nomVehicule} a été confirmée.`,
          duration: 10000,
          action: {
            label: "Voir",
            onClick: () => { window.location.href = "/mes-reservations"; },
          },
        });

        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("🎉 Réservation confirmée ! — Référence Location", {
            body: `Votre réservation pour ${nomVehicule} a été confirmée par l'administrateur.`,
            icon: "/logo.png",
          });
        }

        hasNewConfirmation = true;
      }
    });

    if (hasNewConfirmation && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    prevClientReservations.current = currentStatuses;
  }, [state.reservations, currentClient, state.vehicules]);

  // --- Realtime sync for clients ---
  useEffect(() => {
    if (!currentClient || !supabase) return;

    const channel = supabase
      .channel("client-reservations")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reservations", filter: `client_id=eq.${currentClient.id}` },
        (payload) => {
          const updatedRes = payload.new as unknown as Reservation;
          setState((s) => ({
            ...s,
            reservations: s.reservations.map((r) => (r.id === updatedRes.id ? updatedRes : r)),
          }));
        },
      )
      .subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, [currentClient, setState]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden">
      <AnimatedSiteBackground />
      <div className="relative z-10 flex-1 flex flex-col">

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          {/* Bande dorée supérieure ultra-fine */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Logo Référence Location"
                  className="h-11 w-11 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
              </div>
              <span className="hidden sm:flex flex-col leading-tight">
                <span className="font-display text-base group-hover:text-primary transition-colors duration-200">
                  Référence Location
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Diego Suarez · Madagascar
                </span>
              </span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-0.5">
              {nav.map((n) => {
                const active = pathname === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`
                      relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }
                    `}
                  >
                    {n.label}
                    {/* Indicateur actif */}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
                    )}
                  </Link>
                );
              })}

              {/* Bouton Admin */}
              <Link
                to="/admin"
                className={`
                  ml-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-[0.15em]
                  rounded-lg border transition-all duration-200 font-medium
                  ${pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-5px_oklch(0.78_0.1_85/0.5)]"
                    : "border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_0_20px_-5px_oklch(0.78_0.1_85/0.4)]"
                  }
                `}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {state.isAdmin ? "Admin ●" : "Admin"}
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {!pathname.startsWith("/admin") && currentClient && <AccountSwitcher />}
              {!pathname.startsWith("/admin") && !currentClient && (
                <button
                  onClick={() => {
                    setState((s) => ({ ...s, showAddAccountGate: true }));
                    navigate({ to: "/" });
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary border border-border/50 hover:border-primary/40 rounded-full px-3 py-1.5 bg-card/40 hover:bg-card/70 transition-all duration-200 cursor-pointer"
                >
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Connexion</span>
                </button>
              )}

              {/* Bouton téléphone mobile */}
              <a
                href="tel:+261322472569"
                className="md:hidden grid place-items-center h-8 w-8 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                aria-label="Appeler le service client"
              >
                <Phone className="h-4 w-4" />
              </a>

              {/* Burger mobile */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden grid place-items-center h-8 w-8 rounded-lg border border-border/50 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border transition-all"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* ── Mobile nav dropdown ── */}
          {mobileOpen && (
            <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
              <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
                {[...nav, { to: "/admin", label: "Espace Admin" }].map((n) => {
                  const active =
                    pathname === n.to || (n.to === "/admin" && pathname.startsWith("/admin"));
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      className={`
                        flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                        ${active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }
                      `}
                    >
                      {n.label}
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </header>

        <main className="flex-1">{children}</main>

        {/* ── FOOTER ── */}
        <footer className="relative border-t border-border/40 bg-card/20 backdrop-blur-sm mt-20 overflow-hidden">
          {/* Halo doré subtil en haut */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-24 w-1/2 bg-primary/5 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {/* Branding */}
            <div>
              <div className="font-display text-lg mb-2 text-gradient-gold font-bold">
                Référence Location
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le premier choix pour la location de voiture à Diego Suarez (Antsiranana). Service
                client disponible 7j/7, 24h/24.
              </p>
              {/* Séparateur */}
              <div className="mt-4 h-px w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
            </div>

            {/* Adresse */}
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3 font-medium">
                Adresse
              </div>
              <div className="text-sm text-muted-foreground flex items-start gap-2.5">
                <div className="mt-0.5 grid place-items-center h-7 w-7 rounded-lg border border-primary/20 bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span>En face Mitabe · Antsiranana, Madagascar</span>
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3 font-medium">
                Téléphone
              </div>
              <a
                href="tel:+261322472569"
                className="group text-sm flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="grid place-items-center h-7 w-7 rounded-lg border border-primary/20 bg-primary/10 text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                +261 32 24 725 69
              </a>
            </div>

            {/* Email */}
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3 font-medium">
                Email
              </div>
              <a
                href="mailto:referencelocation4@gmail.com"
                className="group text-sm flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="grid place-items-center h-7 w-7 rounded-lg border border-primary/20 bg-primary/10 text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                referencelocation4@gmail.com
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/30 py-4 text-center text-[11px] text-muted-foreground/60">
            © {new Date().getFullYear()}{" "}
            <span className="text-muted-foreground">Référence Location de Voiture</span> —
            Antsiranana, Madagascar. Tous droits réservés.
          </div>
        </footer>
      </div>
    </div>
  );
}

/**
 * Composant d'arrière-plan animé global pour le site.
 * Génère des orbes lumineux dorés et des micro-particules dorées en mouvement continu.
 */
function AnimatedSiteBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Création des particules dorées
    const particleCount = Math.min(Math.floor(width / 35), 45);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedY: -(Math.random() * 0.4 + 0.15),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;
        const clampedAlpha = Math.max(0.1, Math.min(0.65, p.alpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 97, ${clampedAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(201, 169, 97, 0.4)";
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Orbes lumineux animés en arrière-plan */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-primary/10 blur-[130px] anim-float-1" />
      <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px] anim-float-2" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[140px] anim-float-1" />
      {/* Canvas de micro-particules dorées */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
    </div>
  );
}
