// Reference screen, presentation profile: a client's view of one order.
// Copy the parts you need; the restraint travels with each part.
// Pin the profile once on the document root: <html data-design="presentation">.
// Placeholder data: no real client, order, or date.
"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lockup } from "@/components/ui/lockup"
import { ContactFooter, PageCanvas, PageHeader, PageSection } from "@/components/ui/page-canvas"

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
  const [approved, setApproved] = React.useState(false)
  return (
    // PageCanvas: the page scrolls and each PageSection centres a column (ban 27).
    <PageCanvas>
      {/* The lockup at left, at most one action at right, one row whoever is on the page (D-52). The
          lockup is the logo (D-62), the one signature, so the action beside it stays quiet: ghost. */}
      <PageHeader action={<Button asChild variant="ghost"><Link href="/commandes">Mes commandes</Link></Button>}>
        <Lockup />
      </PageHeader>

      {/* A short head meets the first band at --space-8 on each side, 64px at every width (D-56). */}
      <PageSection aria-labelledby="commande" compact="bottom">
        <p className="ud-label">Commande <span className={num}>UD-1042</span></p>
        <h1 id="commande" className="ud-display mt-3 max-w-[14ch]">Club exemple, saison 2026</h1>
        <p className="mt-4 max-w-[52ch] text-[var(--muted-foreground)]">
          <span className={num}>108</span> pièces, trois articles. L’épreuve de broderie est prête.
          Livraison prévue le <span className={num}>9 octobre 2026</span>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {/* The one accent-filled control on this screen: the action the page exists for. */}
          <Button onClick={() => setApproved(true)}>Approuver l’épreuve</Button>
          {/* Its negative half is secondary, never a second accent. */}
          <Button variant="secondary">Demander une modification</Button>
        </div>
        {/* Says the result once there is one. Idle, a live region takes no room: it sits after the
            row, never in its gap, and the margin is on its words (DESIGN.md "Feedback primitives"). */}
        <div role="status">{approved ? <p className="mt-4">Épreuve approuvée. La production commence.</p> : null}</div>
      </PageSection>

      <PageSection variant="band" compact="top" aria-labelledby="vetements">
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
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <h2 id="suivi" className="ud-h2">Où en est votre commande</h2>
          <ol className="grid gap-4">
            {steps.map(([step, date]) => (
              <li key={step} className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-4">
                <span className="ud-h3">{step}</span>
                <span className={`text-[var(--muted-foreground)] ${num}`}>{date}</span>
              </li>
            ))}
          </ol>
        </div>
      </PageSection>

      {/* The business's public contact ends the page. The page supplies it: placeholder data here. */}
      <ContactFooter
        address="Entreprise exemple, 1 rue Exemple, Ville QC A1A 1A1"
        phone={{ label: "819 555-0100", href: "tel:+18195550100" }}
        email={{ label: "contact@example.com", href: "mailto:contact@example.com" }}
      />
    </PageCanvas>
  )
}
