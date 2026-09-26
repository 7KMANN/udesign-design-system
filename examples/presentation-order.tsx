// Reference screen, presentation profile: a client's view of one order.
// Copy the parts you need; the restraint travels with each part.
// Pin the profile once on the document root: <html data-design="presentation">.
// Placeholder data: no real client, order, or date.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageCanvas, PageSection } from "@/components/ui/page-canvas"

// Internal navigation goes through your framework's link primitive (ban 17):
// replace this one line with next/link or react-router's Link.
const Link = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />

// Every figure goes through the numeric roles: proportional here, tabular mono in operations.
const num = "[font-family:var(--font-numeric)] [font-variant-numeric:var(--font-numeric-variant)]"

const garments = [
  { name: "T-shirt coton épais", decoration: "Broderie poitrine", pieces: 48, why: "Choisi pour les entraînements extérieurs." },
  { name: "Hoodie molleton", decoration: "DTF dos", pieces: 36, why: "Choisi pour les déplacements en autobus." },
  { name: "Casquette structurée", decoration: "Broderie avant", pieces: 24, why: "Taille unique, fermoir ajustable." },
]

const steps = [
  ["Soumission approuvée", "24 sept."],
  ["Épreuve envoyée", "25 sept."],
  ["En production", "26 sept."],
  ["Livraison", "9 oct."],
]

export function PresentationOrder() {
  return (
    // PageCanvas: the page scrolls and each PageSection centres a column (ban 27).
    <PageCanvas>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-[var(--content-gutter-mobile)] py-6 sm:px-[var(--space-8)]">
        {/* The lockup is the one Montserrat signature, so the navigation beside it stays quiet. */}
        <span className="[font-family:var(--font-display)] text-xl font-black">UDesign</span>
        <nav aria-label="Compte" className="flex flex-wrap gap-2">
          <Button asChild variant="ghost"><Link href="/commandes" aria-current="page">Mes commandes</Link></Button>
          <Button asChild variant="ghost"><Link href="/epreuves">Épreuves</Link></Button>
          <Button asChild variant="ghost"><Link href="/factures">Factures</Link></Button>
        </nav>
      </header>

      <PageSection aria-labelledby="commande">
        <p className="ud-label">Commande <span className={num}>UD-1042</span></p>
        <h1 id="commande" className="ud-display mt-3 max-w-[14ch]">Club exemple, saison 2026</h1>
        <p className="mt-5 max-w-[52ch] text-[var(--muted-foreground)]">
          <span className={num}>108</span> pièces, trois articles. L’épreuve de broderie est prête.
          Livraison prévue le <span className={num}>9 octobre 2026</span>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {/* The one accent-filled control on this screen: the action the page exists for. */}
          <Button>Approuver l’épreuve</Button>
          {/* Its negative half is secondary, never a second accent. */}
          <Button variant="secondary">Demander une modification</Button>
        </div>
      </PageSection>

      <PageSection variant="band" aria-labelledby="vetements">
        <h2 id="vetements" className="ud-h2 mb-8">Les vêtements choisis</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {garments.map((g) => (
            // Cards float on --shadow-2 by default: no shadow utility, no override.
            <Card key={g.name}>
              <div className="aspect-[4/3] rounded-t-[var(--radius-lg)] bg-[var(--secondary)]" aria-hidden="true" />
              <CardHeader>
                <CardTitle>{g.name}</CardTitle>
                <CardDescription>{g.decoration}</CardDescription>
              </CardHeader>
              <CardContent>
                <p><span className={num}>{g.pieces}</span> pièces</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{g.why}</p>
              </CardContent>
              <CardFooter>
                {/* Repeated once per card: secondary, never the accent (AGENTS.md rule 5). */}
                <Button variant="secondary">Voir l’épreuve</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection aria-labelledby="suivi">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-12">
          <h2 id="suivi" className="ud-h2">Où en est votre commande</h2>
          <ol className="grid gap-5">
            {steps.map(([step, date]) => (
              <li key={step} className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-4">
                <span className="ud-h3">{step}</span>
                <span className={`text-[var(--muted-foreground)] ${num}`}>{date}</span>
              </li>
            ))}
          </ol>
        </div>
      </PageSection>
    </PageCanvas>
  )
}
