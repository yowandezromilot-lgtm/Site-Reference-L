import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Phone, Mail, MapPin, ChevronDown, UserCircle, Plus, LogOut, Check } from "lucide-react";

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
  const connectedClients = state.clients.filter((c) =>
    state.connectedClientIds.includes(c.id),
  );

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!currentClient) return null;

  const switchTo = (id: number) => {
    // Preserve isAdmin — never touch it when switching client accounts
    setState((s) => ({
      ...s,
      currentClientId: id,
      // isAdmin is NOT changed here — admin stays connected
    }));
    setOpen(false);
  };

  const disconnectCurrent = () => {
    const newConnected = state.connectedClientIds.filter((id) => id !== state.currentClientId);
    if (newConnected.length > 0) {
      // Switch to another connected account, keep isAdmin intact
      const nextId = newConnected[0];
      setState((s) => ({
        ...s,
        currentClientId: nextId,
        connectedClientIds: newConnected,
        // isAdmin stays unchanged
      }));
    } else {
      // No more client accounts
      localStorage.removeItem(GATE_KEY);
      setState((s) => ({
        ...s,
        currentClientId: 0,
        connectedClientIds: [],
        // isAdmin stays unchanged — admin remains connected on this browser
      }));
    }
    setOpen(false);
  };

  const addAccount = () => {
    setState((s) => ({ ...s, showAddAccountGate: true }));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/60 bg-card hover:border-primary/40 transition-colors text-sm cursor-pointer"
        aria-label="Changer de compte"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground uppercase shrink-0 overflow-hidden">
          {currentClient.photo_url ? (
            <img src={currentClient.photo_url} alt="Profil" className="h-full w-full object-cover" />
          ) : (
            <>{currentClient.prenom[0]}{currentClient.nom[0]}</>
          )}
        </div>
        <span className="hidden sm:inline font-medium max-w-[100px] truncate">
          {currentClient.prenom}
        </span>
        {connectedClients.length > 1 && (
          <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
            {connectedClients.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-border/40">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
              Comptes connectés
            </p>
          </div>

          <div className="py-1 max-h-48 overflow-y-auto">
            {connectedClients.map((c) => (
              <button
                key={c.id}
                onClick={() => switchTo(c.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground uppercase shrink-0 overflow-hidden">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt="Profil" className="h-full w-full object-cover" />
                  ) : (
                    <>{c.prenom[0]}{c.nom[0]}</>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.prenom} {c.nom}</div>
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
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left cursor-pointer text-sm text-primary"
            >
              <div className="h-8 w-8 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center shrink-0">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <span>Ajouter / Se connecter</span>
            </button>
            <button
              onClick={disconnectCurrent}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-destructive/10 transition-colors text-left cursor-pointer text-sm text-destructive"
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

  const currentClient = state.clients.find((c) => c.id === state.currentClientId);

  // --- Client Notifications Effect ---
  const prevClientReservations = useRef<Record<string, string>>({});
  
  useEffect(() => {
    if (!currentClient) return;
    
    const clientRes = state.reservations.filter((r) => r.client_id === currentClient.id);
    const currentStatuses: Record<string, string> = {};
    
    let hasNewConfirmation = false;

    clientRes.forEach(r => {
      currentStatuses[r.id] = r.statut;
      const oldStatut = prevClientReservations.current[r.id];
      // Note: we only trigger if we previously KNEW it was pending and now it's confirmed
      if (oldStatut === "pending" && r.statut === "confirmed") {
        const vehicule = state.vehicules.find(v => v.id === r.voiture_id);
        const nomVehicule = vehicule ? `${vehicule.marque} ${vehicule.modele}` : "votre véhicule";
        
        toast.success(`🎉 Bonne nouvelle, ${currentClient.prenom} !`, {
          description: `Votre réservation pour ${nomVehicule} a été confirmée.`,
          duration: 10000,
          action: {
            label: "Voir",
            onClick: () => {
              window.location.href = "/mes-reservations";
            }
          }
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

    // Optionally ask for notification permissions if there are changes
    if (hasNewConfirmation && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
       Notification.requestPermission();
    }

    // Always update to current statuses to prevent duplicate toasts
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
          const updatedRes = payload.new as any;
          setState((s) => ({
            ...s,
            reservations: s.reservations.map(r => r.id === updatedRes.id ? updatedRes : r)
          }));
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [currentClient]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo Référence Location"
              className="h-12 w-12 rounded-md object-contain"
            />
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-base">Référence Location</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Diego Suarez · Madagascar
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              to="/admin"
              className={`ml-2 px-3 py-2 text-xs uppercase tracking-[0.15em] rounded-md border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-colors ${pathname.startsWith("/admin") ? "bg-primary text-primary-foreground" : ""}`}
            >
              {state.isAdmin ? "Espace Admin ●" : "Admin"}
            </Link>
          </nav>

          {/* Right side: account switcher — masqué dans l'espace admin */}
          <div className="flex items-center gap-2">
            {!pathname.startsWith("/admin") && currentClient && <AccountSwitcher />}
            {!pathname.startsWith("/admin") && !currentClient && (
              <button
                onClick={() => {
                  setState((s) => ({ ...s, showAddAccountGate: true }));
                  navigate({ to: "/" });
                }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <UserCircle className="h-5 w-5" />
                <span className="hidden sm:inline">Connexion</span>
              </button>
            )}
            <a
              href="tel:+261322472569"
              className="md:hidden text-primary text-sm"
              aria-label="Appeler le service client"
              title="Appeler le service client"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-3 pb-2 border-t border-border/40">
          {[...nav, { to: "/admin", label: "Admin" }].map((n) => {
            const active =
              pathname === n.to || (n.to === "/admin" && pathname.startsWith("/admin"));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 mt-16 bg-sidebar">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo Référence Location"
                className="h-12 w-12 rounded-md object-contain"
              />
              <div className="font-display text-lg">Référence Location</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Location de véhicules premium à Diego Suarez.{" "}
              {Array.from(new Set(state.vehicules.map((v) => v.marque + " " + v.modele))).join(", ")}
              {" "}— 7j/7, 24h/24.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-primary mb-3">Adresse</div>
            <div className="text-sm text-muted-foreground flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              <span>En face Mitabe · Antsiranana, Madagascar</span>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-primary mb-3">Téléphone</div>
            <a
              href="tel:+261322472569"
              className="text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Phone className="h-4 w-4 text-primary" />
              +261 32 24 725 69
            </a>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-primary mb-3">Email</div>
            <a
              href="mailto:referencelocation4@gmail.com"
              className="text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Mail className="h-4 w-4 text-primary" />
              referencelocation4@gmail.com
            </a>
          </div>
        </div>
        <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Référence Location de Voiture — Tous droits réservés
        </div>
      </footer>
    </div>
  );
}
