import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

export type VehiculeType = string;
export type ReservationStatut = "pending" | "confirmed" | "done" | "cancelled";

export interface Vehicule {
  id: number;
  marque: string;
  modele: string;
  type: VehiculeType;
  immatriculation: string;
  places: number;
  prix_jour: number;
  prix_hors_ville?: number;
  disponible: boolean;
  nb_locations: number;
  emoji: string;
  image_url?: string;
  images?: string[];
}

export interface Client {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  cin: string;
  permis: string;
  date_inscription: string;
  photo_url?: string;
  cin_photo_url?: string;
  cin_verso_url?: string;
}

export interface Reservation {
  id: string;
  client_id: number;
  voiture_id: number;
  date_depart: string;
  date_retour: string;
  lieu_prise: string;
  lieu_retour?: string;
  montant: number;
  statut: ReservationStatut;
  created_at: string;
}

export interface Review {
  id: string;
  client_id?: number;
  nom: string;
  ville: string;
  vehicule: string;
  note: number;
  date: string;
  commentaire: string;
}

export interface AppState {
  vehicules: Vehicule[];
  clients: Client[];
  reservations: Reservation[];
  reviews?: Review[];
  currentClientId: number;
  connectedClientIds: number[];
  isAdmin: boolean;
  showAddAccountGate?: boolean;
  hydrated?: boolean;
  /** Nombre de nouvelles réservations non vues par l'admin */
  newReservationsCount?: number;
  /** Lieux personnalisés ajoutés par les utilisateurs */
  customLieux?: string[];
}

export const initialReviews: Review[] = [
  {
    id: "REV-001",
    nom: "Jean-Philippe R.",
    ville: "La Réunion",
    vehicule: "Hyundai Starex",
    note: 5,
    date: "Août 2026",
    commentaire:
      "Service impeccable du début à la fin ! Le Starex était en parfait état pour notre séjour en famille à Ramena et aux 3 Baies. Prise en charge directement à l'aéroport Arrachart sans attente.",
  },
  {
    id: "REV-002",
    nom: "Aina Rasolofo",
    ville: "Antananarivo",
    vehicule: "Kia Morning Phase 3",
    note: 5,
    date: "Juillet 2026",
    commentaire:
      "Excellente expérience de location à Diego. Voiture très propre, climatisée et faible consommation. Équipe disponible 24/7 et très arrangeante pour le retour en centre-ville.",
  },
  {
    id: "REV-003",
    nom: "Sophie & Marc D.",
    ville: "France",
    vehicule: "Hyundai Getz Phase 2",
    note: 5,
    date: "Août 2026",
    commentaire:
      "Nous avons loué la Getz pour visiter la Montagne d'Ambre et les environs. Tarifs très transparents sans mauvaise surprise, communication rapide sur WhatsApp et téléphone. Je recommande à 100% !",
  },
];

const initialVehicules: Vehicule[] = [
  {
    id: 1,
    marque: "Hyundai",
    modele: "Getz Phase 2",
    type: "Hyundai Getz Phase 2",
    immatriculation: "001 TAD",
    places: 5,
    prix_jour: 120000,
    prix_hors_ville: 150000,
    disponible: true,
    nb_locations: 24,
    emoji: "🚗",
    image_url: "/images/hyundai_getz_p2.png",
  },
  {
    id: 2,
    marque: "Hyundai",
    modele: "Starex",
    type: "Hyundai Starex",
    immatriculation: "132 TAD",
    places: 9,
    prix_jour: 260000,
    prix_hors_ville: 300000,
    disponible: true,
    nb_locations: 22,
    emoji: "🚐",
    image_url: "/images/hyundai_starex.png",
  },
  {
    id: 3,
    marque: "Kia",
    modele: "Morning Phase 2",
    type: "Kia Morning Phase 2",
    immatriculation: "012 TAD",
    places: 5,
    prix_jour: 110000,
    prix_hors_ville: 140000,
    disponible: true,
    nb_locations: 18,
    emoji: "🚗",
    image_url: "/images/kia_morning_p2.png",
  },
  {
    id: 4,
    marque: "Kia",
    modele: "Morning Phase 3",
    type: "Kia Morning Phase 3",
    immatriculation: "045 TAD",
    places: 5,
    prix_jour: 130000,
    prix_hors_ville: 160000,
    disponible: true,
    nb_locations: 32,
    emoji: "🚙",
    image_url: "/images/kia_morning_p3.png",
  },
];

const initialClients: Client[] = [
  {
    id: 1,
    prenom: "Hery",
    nom: "Rakoto",
    telephone: "034 12 345 67",
    email: "hery.rakoto@mail.mg",
    cin: "201234567890",
    permis: "DG-2021-0123",
    date_inscription: "2025-03-14",
  },
  {
    id: 2,
    prenom: "Sandra",
    nom: "Razafy",
    telephone: "033 98 765 43",
    email: "sandra@mail.mg",
    cin: "201987654321",
    permis: "DG-2022-0456",
    date_inscription: "2025-08-02",
  },
  {
    id: 3,
    prenom: "Jean",
    nom: "Andria",
    telephone: "032 24 725 69",
    email: "jean.a@mail.mg",
    cin: "201555444333",
    permis: "DG-2020-0789",
    date_inscription: "2024-11-20",
  },
];

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (base: Date, n: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};

const initialReservations: Reservation[] = [
  {
    id: "RL-001",
    client_id: 1,
    voiture_id: 3,
    date_depart: iso(addDays(today, -35)),
    date_retour: iso(addDays(today, -30)),
    lieu_prise: "Aéroport Arrachart",
    montant: 110000 * 5,
    statut: "done",
    created_at: iso(addDays(today, -38)),
  },
  {
    id: "RL-002",
    client_id: 2,
    voiture_id: 2,
    date_depart: iso(addDays(today, -40)),
    date_retour: iso(addDays(today, -35)),
    lieu_prise: "Centre-ville Diego",
    montant: 260000 * 5,
    statut: "done",
    created_at: iso(addDays(today, -42)),
  },
  {
    id: "RL-003",
    client_id: 1,
    voiture_id: 1,
    date_depart: iso(addDays(today, -50)),
    date_retour: iso(addDays(today, -47)),
    lieu_prise: "Hôtel Allamanda",
    montant: 120000 * 3,
    statut: "done",
    created_at: iso(addDays(today, -52)),
  },
  {
    id: "RL-004",
    client_id: 3,
    voiture_id: 4,
    date_depart: iso(addDays(today, -70)),
    date_retour: iso(addDays(today, -63)),
    lieu_prise: "Aéroport Arrachart",
    montant: 130000 * 7,
    statut: "done",
    created_at: iso(addDays(today, -75)),
  },
  {
    id: "RL-005",
    client_id: 3,
    voiture_id: 2,
    date_depart: iso(addDays(today, -60)),
    date_retour: iso(addDays(today, -55)),
    lieu_prise: "Port de Diego",
    montant: 260000 * 5,
    statut: "done",
    created_at: iso(addDays(today, -62)),
  },
];



const defaultState: AppState = {
  vehicules: initialVehicules,
  clients: initialClients,
  reservations: initialReservations,
  reviews: initialReviews,
  currentClientId: 1,
  connectedClientIds: [1],
  isAdmin: false,
  showAddAccountGate: false,
  hydrated: false,
};

interface AppContextValue {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const AppContext = createContext<AppContextValue | null>(null);

async function syncToSupabase(prev: AppState, next: AppState) {
  if (!supabase) return;
  try {
    // 1. Sync véhicules
    if (prev.vehicules !== next.vehicules) {
      // Véhicules supprimés
      const removed = prev.vehicules.filter((pv) => !next.vehicules.some((nv) => nv.id === pv.id));
      if (removed.length > 0) {
        await supabase
          .from("vehicules")
          .delete()
          .in(
            "id",
            removed.map((r) => r.id),
          );
      }

      // Véhicules ajoutés
      const added = next.vehicules.filter((nv) => !prev.vehicules.some((pv) => pv.id === nv.id));
      if (added.length > 0) {
        const toInsert = added.map((a) => {
          const copy = { ...a };
          if (copy.images && copy.images.length > 0) {
            copy.image_url = JSON.stringify(copy.images);
          } else if (!copy.image_url) {
            copy.image_url = "";
          }
          delete copy.images;
          return copy;
        });
        await supabase.from("vehicules").insert(toInsert);
      }

      // Véhicules modifiés
      const modified = next.vehicules.filter((nv) => {
        const pv = prev.vehicules.find((x) => x.id === nv.id);
        return pv && JSON.stringify(pv) !== JSON.stringify(nv);
      });
      for (const m of modified) {
        const toSave: any = { ...m };
        if (toSave.images && toSave.images.length > 0) {
          toSave.image_url = JSON.stringify(toSave.images);
        } else if (!toSave.image_url) {
          toSave.image_url = "";
        }
        delete toSave.images;
        await supabase.from("vehicules").update(toSave).eq("id", m.id);
      }
    }

    // 2. Sync clients
    if (prev.clients !== next.clients) {
      // Clients ajoutés
      const added = next.clients.filter((nc) => !prev.clients.some((pc) => pc.id === nc.id));
      if (added.length > 0) {
        // Pour éviter les conflits d'ID, on laisse Supabase générer les clés primaires s'il le souhaite, 
        // ou on s'assure d'insérer proprement sans violer l'index.
        // Si Supabase utilise un trigger d'auto-incrémentation, on peut omettre l'id ou s'y adapter.
        for (const c of added) {
          const { data, error } = await supabase.from("clients").insert([c]).select();
          if (error) {
            console.error("Erreur d'insertion du client sur Supabase, tentative sans ID forcé...", error);
            // Deuxième essai sans forcer l'id (auto-increment Supabase)
            const { id, ...clientDataWithoutId } = c;
            await supabase.from("clients").insert([clientDataWithoutId]);
          }
        }
      }

      // Clients supprimés
      const removed = prev.clients.filter((pc) => !next.clients.some((nc) => nc.id === pc.id));
      if (removed.length > 0) {
        await supabase
          .from("clients")
          .delete()
          .in(
            "id",
            removed.map((r) => r.id),
          );
      }

      // Clients modifiés
      const modified = next.clients.filter((nc) => {
        const pc = prev.clients.find((x) => x.id === nc.id);
        return pc && JSON.stringify(pc) !== JSON.stringify(nc);
      });
      for (const m of modified) {
        await supabase.from("clients").update(m).eq("id", m.id);
      }
    }

    // 3. Sync réservations
    if (prev.reservations !== next.reservations) {
      // Réservations ajoutées
      const added = next.reservations.filter(
        (nr) => !prev.reservations.some((pr) => pr.id === nr.id),
      );
      if (added.length > 0) {
        await supabase.from("reservations").insert(added);
      }

      // Réservations supprimées
      const removed = prev.reservations.filter(
        (pr) => !next.reservations.some((nr) => nr.id === pr.id),
      );
      if (removed.length > 0) {
        await supabase
          .from("reservations")
          .delete()
          .in(
            "id",
            removed.map((r) => r.id),
          );
      }

      // Réservations modifiées
      const modified = next.reservations.filter((nr) => {
        const pr = prev.reservations.find((x) => x.id === nr.id);
        return pr && JSON.stringify(pr) !== JSON.stringify(nr);
      });
      for (const m of modified) {
        await supabase.from("reservations").update(m).eq("id", m.id);
      }
    }
  } catch (err) {
    console.error("Erreur lors de la synchronisation vers Supabase :", err);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        if (!supabase) {
          console.warn(
            "Client Supabase non initialisé (vérifiez votre fichier .env). Mode local activé.",
          );
          // Charger depuis localStorage en mode local
          try {
            const storedVehicules = localStorage.getItem("rl_vehicules_v1");
            const storedClients = localStorage.getItem("rl_clients_v1");
            const storedReservations = localStorage.getItem("rl_reservations_v1");
            const storedReviews = localStorage.getItem("rl_reviews_v1");
            const storedProfile = localStorage.getItem("rl_profile_done_v1");
            const storedAdmin = localStorage.getItem("rl_admin_logged_in");
            const storedLieux = localStorage.getItem("rl_custom_lieux_v1");

            const vehicules = storedVehicules ? JSON.parse(storedVehicules) : initialVehicules;
            const clients = storedClients ? JSON.parse(storedClients) : initialClients;
            const reservations = storedReservations ? JSON.parse(storedReservations) : initialReservations;
            const reviews: Review[] = storedReviews ? JSON.parse(storedReviews) : initialReviews;
            const customLieux: string[] = storedLieux ? JSON.parse(storedLieux) : [];

            let activeClientId = 0;
            let connectedIds: number[] = [];
            if (storedProfile) {
              const parsed = JSON.parse(storedProfile);
              if (parsed.clientId) activeClientId = parsed.clientId;
              if (Array.isArray(parsed.connectedIds)) connectedIds = parsed.connectedIds;
            }

            setStateInternal({
              vehicules,
              clients,
              reservations,
              reviews,
              currentClientId: activeClientId,
              connectedClientIds: connectedIds,
              isAdmin: storedAdmin === "true",
              showAddAccountGate: false,
              hydrated: true,
              customLieux,
            });
          } catch (e) {
            console.warn("Erreur lors du chargement depuis localStorage", e);
          }
          setHydrated(true);
          return;
        }
        // 1. Charger les véhicules
        const { data: vData, error: vErr } = await supabase
          .from("vehicules")
          .select("*")
          .order("id");
        let dbVehicules = vData;
        if (vErr) {
          console.warn("Table 'vehicules' non trouvée ou RLS active. Mode local activé.", vErr);
          setHydrated(true);
          return;
        }

        // Si la table est vide, on l'initialise
        if (!dbVehicules || dbVehicules.length === 0) {
          const toInsert = initialVehicules.map((v) => {
            const copy: any = { ...v };
            delete copy.images;
            return copy;
          });
          const { data: inserted, error: insErr } = await supabase
            .from("vehicules")
            .insert(toInsert)
            .select()
            .order("id");
          if (!insErr && inserted) {
            dbVehicules = inserted;
          }
        }

        if (dbVehicules) {
          dbVehicules = dbVehicules.map((v: any) => {
            let parsedImages: string[] = [];
            if (v.image_url && v.image_url.startsWith("[")) {
              try {
                parsedImages = JSON.parse(v.image_url);
              } catch (e) {
                parsedImages = [v.image_url];
              }
            } else if (v.image_url) {
              parsedImages = [v.image_url];
            }
            return {
              ...v,
              images: parsedImages,
              image_url: parsedImages.length > 0 ? parsedImages[0] : "",
            };
          });
        }

        // 2. Charger les clients
        const { data: cData, error: cErr } = await supabase.from("clients").select("*").order("id");
        let dbClients = cData;
        if (cErr) throw cErr;

        if (!dbClients || dbClients.length === 0) {
          const { data: inserted, error: insErr } = await supabase
            .from("clients")
            .insert(initialClients)
            .select()
            .order("id");
          if (!insErr && inserted) {
            dbClients = inserted;
          }
        }

        // 3. Charger les réservations
        const { data: dbReservationsData, error: rErr } = await supabase
          .from("reservations")
          .select("*");
        let dbReservations = dbReservationsData;
        if (rErr) throw rErr;

        if (!dbReservations || dbReservations.length === 0) {
          const { data: inserted, error: insErr } = await supabase
            .from("reservations")
            .insert(initialReservations)
            .select();
          if (!insErr && inserted) {
            dbReservations = inserted;
          }
        }

        let activeClientId = 0;
        let connectedIds: number[] = [];
        const stored =
          typeof window !== "undefined" ? localStorage.getItem("rl_profile_done_v1") : null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.clientId) {
              activeClientId = parsed.clientId;
            }
            if (Array.isArray(parsed.connectedIds)) {
              connectedIds = parsed.connectedIds;
            } else if (activeClientId !== 0) {
              connectedIds = [activeClientId];
            }
          } catch (e) {
            console.warn("Failed to parse stored profile", e);
          }
        }

        let loggedInAsAdmin = false;
        const storedAdmin =
          typeof window !== "undefined" ? localStorage.getItem("rl_admin_logged_in") : null;
        if (storedAdmin === "true") {
          loggedInAsAdmin = true;
        }

        setStateInternal({
          vehicules: dbVehicules || [],
          clients: dbClients || [],
          reservations: dbReservations || [],
          currentClientId: activeClientId,
          connectedClientIds: connectedIds,
          isAdmin: loggedInAsAdmin,
          showAddAccountGate: false,
          hydrated: true,
        });
      } catch (err) {
        console.error("Erreur lors du chargement des données depuis Supabase :", err);
        setStateInternal((prev) => ({ ...prev, hydrated: true }));
      } finally {
        setHydrated(true);
      }
    }

    loadData();
  }, []);

  const setState = (value: React.SetStateAction<AppState>) => {
    setStateInternal((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const next = typeof value === "function" ? (value as any)(prev) : value;
      if (hydrated) {
        syncToSupabase(prev, next);
        if (prev.isAdmin !== next.isAdmin) {
          localStorage.setItem("rl_admin_logged_in", next.isAdmin ? "true" : "false");
        }
        if (
          prev.currentClientId !== next.currentClientId ||
          JSON.stringify(prev.connectedClientIds) !== JSON.stringify(next.connectedClientIds)
        ) {
          localStorage.setItem(
            "rl_profile_done_v1",
            JSON.stringify({
              clientId: next.currentClientId,
              connectedIds: next.connectedClientIds,
            }),
          );
        }
        // Persistance locale pour les données (important pour les images en base64)
        if (prev.vehicules !== next.vehicules) {
          try {
            localStorage.setItem("rl_vehicules_v1", JSON.stringify(next.vehicules));
          } catch (e) {
            console.warn("Impossible de sauvegarder les véhicules en localStorage (trop volumineux?)", e);
          }
        }
        if (prev.clients !== next.clients) {
          try {
            localStorage.setItem("rl_clients_v1", JSON.stringify(next.clients));
          } catch (e) {
            console.warn("Impossible de sauvegarder les clients en localStorage", e);
          }
        }
        if (prev.reservations !== next.reservations) {
          try {
            localStorage.setItem("rl_reservations_v1", JSON.stringify(next.reservations));
          } catch (e) {
            console.warn("Impossible de sauvegarder les réservations en localStorage", e);
          }
        }
        if (prev.reviews !== next.reviews) {
          try {
            localStorage.setItem("rl_reviews_v1", JSON.stringify(next.reviews ?? []));
          } catch (e) {
            console.warn("Impossible de sauvegarder les avis en localStorage", e);
          }
        }
        if (JSON.stringify(prev.customLieux) !== JSON.stringify(next.customLieux)) {
          try {
            localStorage.setItem("rl_custom_lieux_v1", JSON.stringify(next.customLieux ?? []));
          } catch (e) {
            console.warn("Impossible de sauvegarder les lieux en localStorage", e);
          }
        }
      }
      return next;
    });
  };

  return <AppContext.Provider value={{ state, setState }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function nextReservationId(reservations: Reservation[]): string {
  const nums = reservations
    .map((r) => parseInt(r.id.replace("RL-", ""), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `RL-${String(next).padStart(3, "0")}`;
}

export function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

export function formatAr(n: number): string {
  return n.toLocaleString("fr-FR").replace(/\u00a0/g, " ") + " Ar";
}

export const STATUT_LABEL: Record<ReservationStatut, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  done: "Terminée",
  cancelled: "Annulée",
};

export const ADMIN_PASSWORD = "adminreference2026";
