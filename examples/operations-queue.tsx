// Reference screen, operations profile: the shop's production queue.
// Dense on purpose. UDesign values simplicity over minimalism: a busy working
// screen is correct when every element does a job, and it still spends one accent.
// Copy the parts you need; the restraint travels with each part.
// Pin the profile once on the document root: <html data-design="operations">.
// Placeholder data: no real client, order, or date.
"use client"

import * as React from "react"

import { AppShell, AppShellPane, AppShellPanes, AppShellSidebar, AppShellToolbar } from "@/components/ui/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MetricCard } from "@/components/ui/metric-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Internal navigation goes through your framework's link primitive (ban 17):
// replace this one line with next/link or react-router's Link.
const Link = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />

// Codes, dates and counts outside a numeric TableCell use the numeric roles directly.
const num = "[font-family:var(--font-numeric)] [font-variant-numeric:var(--font-numeric-variant)]"

type Tone = "success" | "progress" | "neutral" | "danger"
type Order = { id: string; client: string; method: string; pieces: number; step: string; tone: Tone; due: string }

const orders: Order[] = [
  { id: "UD-1036", client: "Entreprise A", method: "Broderie", pieces: 24, step: "Prêt", tone: "success", due: "1 oct." },
  { id: "UD-1038", client: "Entreprise B", method: "DTF", pieces: 120, step: "Prêt", tone: "success", due: "2 oct." },
  { id: "UD-1039", client: "Équipe H", method: "Écussons", pieces: 80, step: "En production", tone: "progress", due: "5 oct." },
  { id: "UD-1040", client: "École C", method: "Broderie", pieces: 60, step: "En production", tone: "progress", due: "6 oct." },
  { id: "UD-1041", client: "Équipe D", method: "DTF", pieces: 200, step: "En attente", tone: "neutral", due: "8 oct." },
  { id: "UD-1042", client: "Club exemple", method: "Broderie, DTF", pieces: 108, step: "En production", tone: "progress", due: "9 oct." },
  { id: "UD-1043", client: "Ligue E", method: "Broderie", pieces: 36, step: "En retard", tone: "danger", due: "30 sept." },
  { id: "UD-1044", client: "Commerce F", method: "DTF", pieces: 72, step: "En attente", tone: "neutral", due: "14 oct." },
  { id: "UD-1045", client: "Association G", method: "Écussons", pieces: 150, step: "En attente", tone: "neutral", due: "16 oct." },
  { id: "UD-1046", client: "Entreprise I", method: "Broderie", pieces: 12, step: "En attente", tone: "neutral", due: "17 oct." },
]

const lines = [
  { name: "T-shirt coton épais", decoration: "Broderie poitrine", pieces: 48, sizes: [6, 14, 16, 12] },
  { name: "Hoodie molleton", decoration: "DTF dos", pieces: 36, sizes: [4, 10, 12, 10] },
  { name: "Casquette structurée", decoration: "Broderie avant", pieces: 24, sizes: null },
]

const history = [
  ["24 sept. 09:12", "Soumission approuvée par le client"],
  ["24 sept. 14:40", "Paiement reçu, production débloquée"],
  ["25 sept. 08:05", "Numérisation terminée, épreuve envoyée"],
  ["25 sept. 16:22", "Épreuve approuvée"],
  ["26 sept. 07:30", "Broderie en cours, poste 2"],
]

const sections = [["Tableau", ""], ["Commandes", "14"], ["Production", "10"], ["Soumissions", "5"], ["Inventaire", ""], ["Clients", ""], ["Factures", ""]]
const counts = [["En attente", 4], ["En production", 3], ["Prêt", 2], ["En retard", 1]] as const

export function OperationsQueue() {
  const [method, setMethod] = React.useState<string | null>(null)
  const visible = method ? orders.filter((o) => o.method.includes(method)) : orders

  return (
    // AppShell: fixed viewport, panes scroll, hierarchy from structure (ban 27).
    <AppShell>
      <AppShellSidebar>
        {/* The lockup stays Montserrat in both profiles; nothing else in the chrome is decorated. */}
        <div className="flex min-h-[var(--control-height)] items-center border-b border-[var(--sidebar-border)] px-4">
          <span className="[font-family:'Montserrat',sans-serif] font-black">UDesign</span>
        </div>
        <nav aria-label="Principal" className="flex py-2 md:flex-col">
          {sections.map(([name, count]) => (
            // Navigation is chrome: ghost, never the accent. The current page is marked by weight and surface.
            <Button key={name} asChild variant="ghost" className="justify-between px-4 aria-[current=page]:bg-[var(--sidebar-accent)] aria-[current=page]:font-semibold">
              <Link href={`/${name.toLowerCase()}`} aria-current={name === "Production" ? "page" : undefined}>
                <span>{name}</span>
                <span className={`text-[var(--muted-foreground)] ${num}`}>{count}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </AppShellSidebar>

      <AppShellToolbar className="flex-wrap">
        <h1 className="ud-h1 mr-auto">File de production</h1>
        <Input aria-label="Rechercher une commande" placeholder="Rechercher une commande" className="w-full sm:w-56" />
        {/* A toolbar is a group of peers: ghost, with the active filter shown by aria-pressed. */}
        {["Broderie", "DTF", "Écussons"].map((m) => (
          <Button key={m} variant="ghost" aria-pressed={method === m} className="aria-pressed:bg-[var(--interactive-selected)]" onClick={() => setMethod(method === m ? null : m)}>
            {m}
          </Button>
        ))}
      </AppShellToolbar>

      <AppShellPanes className="md:grid-cols-[minmax(0,1fr)_20rem]">
        <AppShellPane aria-label="Commandes actives">
          {/* Flat in operations: MetricCard needs no shadow or radius override, the profile resolves both. */}
          <div className="grid grid-cols-2 border-b border-[var(--border)] sm:grid-cols-4">
            {counts.map(([label, value]) => (
              <MetricCard key={label} label={label} value={value} className="border-0 border-r border-[var(--border)] last:border-r-0" />
            ))}
          </div>
          <Table scrollLabel="Tableau des commandes">
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead numeric>Qté</TableHead>
                <TableHead>Étape</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((o) => (
                // A row has no press state; its action is a control inside it.
                <TableRow key={o.id} data-state={o.id === "UD-1042" ? "selected" : undefined}>
                  <TableCell className={num}>{o.id}</TableCell>
                  <TableCell className="whitespace-nowrap">{o.client}</TableCell>
                  <TableCell className="whitespace-nowrap">{o.method}</TableCell>
                  <TableCell numeric>{o.pieces}</TableCell>
                  {/* The label carries the status; the tone only reinforces it (ban 11). */}
                  <TableCell><StatusBadge tone={o.tone}>{o.step}</StatusBadge></TableCell>
                  <TableCell className={`whitespace-nowrap ${num}`}>{o.due}</TableCell>
                  {/* py-0: the button is the row's height, so the row stays on the 44px floor. */}
                  <TableCell className="py-0">
                    {/* Repeated once per row: ghost, never the accent (AGENTS.md rule 5). */}
                    <Button variant="ghost" aria-label={`Ouvrir ${o.id}`}>Ouvrir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AppShellPane>

        <AppShellPane aria-label="Détail de la commande" className="bg-[var(--card)]">
          <div className="grid gap-3 border-b border-[var(--border)] p-[var(--surface-padding,1.5rem)]">
            <div>
              <p className={`ud-label ${num}`}>UD-1042</p>
              <h2 className="ud-h2">Club exemple</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* The one accent-filled control on this screen: it commits work. */}
              <Button>Terminer l’étape</Button>
              <Button variant="secondary">Imprimer le bon</Button>
            </div>
          </div>
          {lines.map((l) => (
            <Card key={l.name} className="border-0 border-b">
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle>{l.name}</CardTitle>
                  <CardDescription>{l.decoration}</CardDescription>
                </div>
                <span className={`font-semibold ${num}`}>{l.pieces}</span>
              </CardHeader>
              <CardContent>
                {l.sizes ? (
                  <dl className="grid grid-cols-4 border border-[var(--border)]">
                    {["S", "M", "L", "XL"].map((size, i) => (
                      <div key={size} className="flex justify-between border-r border-[var(--border)] px-2 py-1 last:border-r-0">
                        <dt className="text-[var(--muted-foreground)]">{size}</dt>
                        <dd className={num}>{l.sizes[i]}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-[var(--muted-foreground)]">Taille unique</p>
                )}
              </CardContent>
            </Card>
          ))}
          <Card className="border-0">
            <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
            <CardContent>
              <ul className="grid">
                {history.map(([time, event]) => (
                  <li key={time} className="grid grid-cols-[9.5rem_1fr] gap-2 border-t border-[var(--border)] py-1.5 first:border-t-0">
                    <span className={`text-[var(--muted-foreground)] ${num}`}>{time}</span>
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </AppShellPane>
      </AppShellPanes>
    </AppShell>
  )
}
