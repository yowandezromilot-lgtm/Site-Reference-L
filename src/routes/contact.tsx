import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

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
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Nous contacter</p>
        <h1 className="font-display text-4xl mt-2">Une question, une demande sur mesure ?</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Notre équipe est joignable 7j/7, 24h/24 — par téléphone, email ou via le formulaire
          ci-dessous.
        </p>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] mt-10">
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

          <Card className="border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
            <CardContent className="p-6">
              <form onSubmit={submit} className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nom</Label>
                    <Input
                      className="mt-1.5"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input
                      className="mt-1.5"
                      value={form.tel}
                      onChange={(e) => setForm({ ...form, tel: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Objet</Label>
                  <Input
                    className="mt-1.5"
                    value={form.objet}
                    onChange={(e) => setForm({ ...form, objet: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    className="mt-1.5 min-h-32"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  className="justify-self-end cursor-pointer"
                  disabled={sending}
                >
                  {sending ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>
            </CardContent>
          </Card>
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
      <span className="grid h-10 w-10 place-items-center rounded-md border border-primary/30 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-primary">{title}</div>
        <div className="mt-1 text-sm text-foreground/90 leading-relaxed">
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        {href ? (
          <a href={href} className="block">
            {body}
          </a>
        ) : (
          body
        )}
      </CardContent>
    </Card>
  );
}
