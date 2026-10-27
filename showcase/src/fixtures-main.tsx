import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import 'swiper/css/bundle';
import { ChoiceGroup } from '@/components/ui/choice-group';
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gallery, type GalleryPhoto } from '@/components/ui/gallery';
import { ContactFooter, PageCanvas, PageSection } from '@/components/ui/page-canvas';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import './index.css';

const sizes = (n: number) => ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'].slice(0, n).map((s) => ({ value: s, label: s }));

// Groups in containers of known widths, so the test can count the columns each range lays out.
function Choices() {
  const [value, setValue] = useState<string | null>(null);
  const cases: Array<[string, number]> = [['16rem', 5], ['16rem', 6], ['16rem', 7], ['30rem', 6], ['9.5rem', 3], ['20rem', 10]];
  const long = Array.from({ length: 22 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` }));
  return (
    <main className="grid gap-6 p-4">
      {cases.map(([width, n]) => (
        <div key={`${width}-${n}`} style={{ width }} data-testid={`choices-${width}-${n}`}>
          <ChoiceGroup aria-label={`${n} tailles, ${width}`} choices={sizes(n)} value={value} onValueChange={setValue} />
        </div>
      ))}
      {/* Held while it saves: the chosen choice keeps its look; a choice that cannot be had is dashed. */}
      <div style={{ width: '20rem' }} data-testid="choices-held">
        <ChoiceGroup aria-label="Taille, en attente" choices={[...sizes(3), { value: 'XL', label: 'XL', disabled: true }]} value="S" disabled />
      </div>
      <div style={{ width: '20rem' }} data-testid="choices-open">
        <ChoiceGroup aria-label="Taille, ouverte" choices={[...sizes(3), { value: 'XL', label: 'XL', disabled: true }]} value="S" />
      </div>
      <div style={{ width: '21.4375rem' }} data-testid="choices-long">
        <ChoiceGroup aria-label="Numéros" choices={long} />
      </div>
    </main>
  );
}

// The parents a phone puts a group in, on a page with nothing wider than the phone: those whose width
// comes from their content, where a size container would be 0px wide (review M5), and those that give
// it a width, which it takes and wraps in (review N1).
function ChoicesPhone() {
  // Parents whose width comes from their content, where a size container would be 0px wide (review M5).
  const shrinking: Array<[string, (group: React.ReactNode) => React.ReactNode]> = [
    ['table-cell', (g) => <table><tbody><tr><td>{g}</td></tr></tbody></table>],
    ['inline-block', (g) => <div style={{ display: 'inline-block' }}>{g}</div>],
    ['fit-content', (g) => <div style={{ width: 'fit-content' }}>{g}</div>],
    ['flex-row', (g) => <div style={{ display: 'flex' }}><div>{g}</div></div>],
    ['flex-column', (g) => <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}><div>{g}</div></div>],
    ['grid-auto', (g) => <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}><div>{g}</div><span /></div>],
    ['absolute', (g) => <div style={{ position: 'relative', height: '7rem' }}><div style={{ position: 'absolute' }}>{g}</div></div>],
  ];
  // Parents that give the group a width, which it takes and wraps in.
  const places: Array<[string, (group: React.ReactNode) => React.ReactNode]> = [
    ['grid', (g) => <div style={{ display: 'grid' }}><div>{g}</div></div>],
    ['grid-1fr', (g) => <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}><div>{g}</div></div>],
    ['list', (g) => <ul style={{ display: 'grid', listStyle: 'none', margin: 0, padding: 0 }}><li>{g}</li></ul>],
    ['fieldset', (g) => <fieldset><legend>Taille</legend>{g}</fieldset>],
  ];
  const colours = ['Blanc', 'Noir', 'Marine', 'Rouge', 'Forêt', 'Gris', 'Sable', 'Bourgogne'].map((c, i) => ({ value: c, label: c, swatch: `hsl(${i * 45} 40% 50%)` }));
  return (
    <main className="grid gap-6 p-4">
      {shrinking.map(([name, wrap]) => (
        <div key={name} data-testid={`choices-in-${name}`}>
          {wrap(<ChoiceGroup aria-label={`5 tailles, ${name}`} choices={sizes(5)} />)}
        </div>
      ))}
      {places.map(([name, wrap]) => (
        <div key={name} data-testid={`choices-place-${name}`}>
          {wrap(<ChoiceGroup aria-label={`8 tailles, ${name}`} choices={sizes(8)} />)}
        </div>
      ))}
      <div data-testid="choices-place-swatches">
        <div style={{ display: 'grid' }}><div><ChoiceGroup variant="swatch" aria-label="8 couleurs" choices={colours} /></div></div>
      </div>
    </main>
  );
}

// The registry's dialog on a phone, its group in a plain div (review N1).
function ChoiceDialog() {
  return (
    <Dialog defaultOpen>
      <DialogContent closeLabel="Fermer">
        <DialogHeader>
          <DialogTitle>Taille</DialogTitle>
          <DialogDescription>Une taille par personne.</DialogDescription>
        </DialogHeader>
        <div>
          <ChoiceGroup aria-label="Taille, dans un dialogue" choices={sizes(5)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Three copies of each photo, as UDesign's sets have: 160px for the thumbnail, 640 and 1200 for the slide.
// A tag sets one gallery's requests apart from the others'.
const photos = (product: string, ids: number[], views: string[], tag = ''): GalleryPhoto[] =>
  ids.map((id, i) => ({
    src: `/gallery/photo-${id}.svg?w=640${tag}`,
    srcSet: [160, 640, 1200].map((w) => `/gallery/photo-${id}.svg?w=${w}${tag} ${w}w`).join(', '),
    thumb: `/gallery/photo-${id}.svg?w=160${tag}`,
    alt: `${views[i]}, ${product}`,
    label: views[i],
  }));

// Two galleries on one screen and a choice group: the arrow keys move only the gallery in focus or
// under the pointer, and the group keeps its own. A sheet opens over them, as Boutique's cart does.
// The page is long, so Page Down has somewhere to go.
function Galleries() {
  const [size, setSize] = useState<string | null>('M');
  const [colour, setColour] = useState('Blanc');
  const tee = colour === 'Blanc' ? [1, 2, 3] : [3, 2, 1];
  return (
    <main className="grid gap-6 p-4">
      <div className="grid grid-cols-2 gap-6">
        <Gallery data-testid="gallery-a" photos={photos(`T-shirt exemple, ${colour}`, tee, ['Devant', 'Dos', 'Photo 1'])} sizes="50vw" priority />
        <Gallery data-testid="gallery-b" photos={photos('Casquette exemple', [4, 1, 3], ['Devant', 'Côté', 'Dos'])} sizes="50vw" />
      </div>
      <ChoiceGroup aria-label="Taille" choices={sizes(5)} value={size} onValueChange={setSize} />
      <ChoiceGroup aria-label="Couleur" choices={[{ value: 'Blanc', label: 'Blanc' }, { value: 'Noir', label: 'Noir' }]} value={colour} onValueChange={(c) => setColour(c)} />
      <Sheet>
        <SheetTrigger className="justify-self-start">Ouvrir le panier</SheetTrigger>
        <SheetContent closeLabel="Fermer">
          <SheetTitle>Panier</SheetTitle>
          <SheetDescription>Aucun article pour l’instant.</SheetDescription>
        </SheetContent>
      </Sheet>
      <div style={{ height: '150rem' }} />
      {/* A card's gallery far below the screen, past Chromium's lazy-loading margin, without priority: its photos wait until it is near. */}
      <div style={{ height: '300rem' }} />
      <div className="max-w-xs">
        <Gallery data-testid="gallery-c" photos={photos('Tuque exemple', [2, 4], ['Devant', 'Dos'], '&set=c')} sizes="20rem" />
      </div>
    </main>
  );
}

// Specifications as UDesign Pages sets them, a pair grouped in a div, and a value too long for a phone.
function Specs() {
  return (
    <main className="p-4">
      <DescriptionList data-testid="specs">
        <DescriptionTerm>Tissu</DescriptionTerm>
        <DescriptionDetails>Coton épais, 6,5 oz</DescriptionDetails>
        <div>
          <DescriptionTerm>Coupe</DescriptionTerm>
          <DescriptionDetails>Ample</DescriptionDetails>
        </div>
        <DescriptionTerm>Entretien</DescriptionTerm>
        <DescriptionDetails>Lavage-à-froid-avec-des-couleurs-semblables-et-séchage-par-culbutage-à-basse-température</DescriptionDetails>
      </DescriptionList>
    </main>
  );
}

// A page's last section and its contact footer, as ?fixture=footer&end= sets them: a band ending main,
// a band ending main's last block (an article), a band right before the footer, or the page field.
function Footer() {
  const end = new URLSearchParams(location.search).get('end') ?? 'canvas';
  const band = <PageSection variant="band"><h2 className="ud-h2">Articles</h2></PageSection>;
  const canvas = <PageSection><h2 className="ud-h2">Suivi</h2></PageSection>;
  const footer = <ContactFooter data-testid="footer" address="Entreprise exemple" phone={{ label: '819 555-0100', href: 'tel:+18195550100' }} />;
  return (
    <PageCanvas>
      {end === 'sibling' ? (
        <>{canvas}{band}</>
      ) : (
        <main>
          {canvas}
          {end === 'band' ? band : end === 'nested' ? <article>{canvas}{band}</article> : canvas}
        </main>
      )}
      {footer}
    </PageCanvas>
  );
}

const fixtures: Record<string, React.ComponentType> = { choices: Choices, footer: Footer, 'choices-phone': ChoicesPhone, 'choice-dialog': ChoiceDialog, galleries: Galleries, specs: Specs };
const Fixture = fixtures[new URLSearchParams(location.search).get('fixture') ?? ''] ?? (() => <p>Unknown fixture</p>);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Fixture />
  </React.StrictMode>,
);
