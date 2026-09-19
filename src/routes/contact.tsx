import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Référence Location Diego Suarez" },
      {
        name: "description",
        content: "Contactez Référence Location de Voiture à Diego Suarez. Disponibles 7j/7 24h/24.",
      },
      { property: "og:title", content: "Contact — Référence Location" },
      { property: "og:description", content: "Téléphone, email et coordonnées de l'agence." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ nom: "", tel: "", objet: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.tel || !form.objet || !form.message) {
      toast.error("Merci de remplir tous les champs.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("https://formsubmit.co/ajax/referencelocation4@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          Nom: form.nom,
          Téléphone: form.tel,
          Objet: form.objet,
          Message: form.message,
          _subject: `Nouveau message de ${form.nom} : ${form.objet}`,
        }),
      });

      if (res.ok) {
        toast.success("Message envoyé avec succès ! Nous vous recontacterons rapidement.");
        setForm({ nom: "", tel: "", objet: "", message: "" });
      } else {
        toast.error("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion. Veuillez vérifier votre réseau.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <Toaster richColors position="top-right" />
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        {/* Header premium */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary mb-3">
            <span className="w-6 h-px bg-primary inline-block" />
            Nous contacter
            <span className="w-6 h-px bg-primary inline-block" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight">
            Une question,{" "}
            <span className="text-gradient-gold">une demande sur mesure ?</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Notre équipe est joignable 7j/7, 24h/24 — par téléphone, email ou via le formulaire
            ci-dessous.
          </p>
          <div className="h-0.5 mt-4 w-20 bg-gradient-to-r from-primary to-transparent rounded-full" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          {/* Colonne info */}
          <div className="space-y-4">
            <InfoLine
              icon={MapPin}
              title="Adresse"
              lines={[
                "Référence Location de Voiture",
                "En face Mitabe · Antsiranana",
                "Madagascar",
              ]}
            />
            <InfoLine
              icon={Phone}
              title="Téléphones"
              lines={["+261 32 24 725 69", "034 46 911 02"]}
              href="tel:+261322472569"
            />
            <InfoLine
              icon={Mail}
              title="Email"
              lines={["referencelocation4@gmail.com"]}
              href="mailto:referencelocation4@gmail.com"
            />
            <InfoLine icon={Clock} title="Disponibilité" lines={["7 jours sur 7", "24h sur 24"]} />
          </div>

          {/* Formulaire glassmorphism */}
          <div className="rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_-15px_oklch(0_0_0/0.5)]">
            {/* Bande dorée sup */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="grid place-items-center h-8 w-8 rounded-full bg-primary/15 text-primary">
                  <Send className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs uppercase tracking-[0.22em] text-primary font-medium">
                  Formulaire de contact
                </p>
              </div>

              <form onSubmit={submit} className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      Nom
                    </Label>
                    <Input
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      Téléphone
                    </Label>
                    <Input
                      value={form.tel}
                      onChange={(e) => setForm({ ...form, tel: e.target.value })}
                      className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
                      placeholder="+261 XX XX XXX XX"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    Objet
                  </Label>
                  <Input
                    value={form.objet}
                    onChange={(e) => setForm({ ...form, objet: e.target.value })}
                    className="border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors"
                    placeholder="Sujet de votre message"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    Message
                  </Label>
                  <Textarea
                    className="min-h-36 border-border/50 bg-background/50 hover:border-primary/40 focus:border-primary transition-colors resize-none"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <Button
                  type="submit"
                  className="justify-self-end cursor-pointer shadow-gold hover:brightness-110 transition-all gap-2"
                  disabled={sending}
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>
            </div>

            {/* Bande dorée inf */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function InfoLine({
  icon: Icon,
  title,
  lines,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: string[];
  href?: string;
}) {
  const body = (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary shrink-0 transition-all group-hover:border-primary/60 group-hover:bg-primary/20">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-primary font-medium">{title}</div>
        <div className="mt-1.5 text-sm text-foreground/90 leading-relaxed">
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="group rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card/80 transition-all duration-300">
      {href ? (
        <a href={href} className="block">
          {body}
        </a>
      ) : (
        body
      )}
    </div>
  );
}
