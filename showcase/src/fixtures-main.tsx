import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import 'swiper/css/bundle';
import { ChoiceGroup } from '@/components/ui/choice-group';
import { Gallery, type GalleryPhoto } from '@/components/ui/gallery';
import './index.css';

const sizes = (n: number) => ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'].slice(0, n).map((s) => ({ value: s, label: s }));

// Groups in containers of known widths, so the test can count the columns each range lays out.
function Choices() {
  const [value, setValue] = useState<string | null>(null);
  const cases: Array<[string, number]> = [['16rem', 5], ['16rem', 6], ['16rem', 7], ['30rem', 6], ['9.5rem', 3], ['20rem', 10]];
  return (
    <main className="grid gap-6 p-4">
      {cases.map(([width, n]) => (
        <div key={`${width}-${n}`} style={{ width }} data-testid={`choices-${width}-${n}`}>
          <ChoiceGroup aria-label={`${n} tailles, ${width}`} choices={sizes(n)} value={value} onValueChange={setValue} />
        </div>
      ))}
    </main>
  );
}

// Three copies of each photo, as UDesign's sets have: 160px for the thumbnail, 640 and 1200 for the slide.
const photos = (product: string, ids: number[], views: string[]): GalleryPhoto[] =>
  ids.map((id, i) => ({
    src: `/gallery/photo-${id}.svg?w=640`,
    srcSet: [160, 640, 1200].map((w) => `/gallery/photo-${id}.svg?w=${w} ${w}w`).join(', '),
    thumb: `/gallery/photo-${id}.svg?w=160`,
    alt: `${views[i]}, ${product}`,
    label: views[i],
  }));

// Two galleries on one screen and a choice group: the arrow keys move only the gallery in focus or
// under the pointer, and the group keeps its own. The page is long, so Page Down has somewhere to go.
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
      <div style={{ height: '150rem' }} />
    </main>
  );
}

const fixtures: Record<string, React.ComponentType> = { choices: Choices, galleries: Galleries };
const Fixture = fixtures[new URLSearchParams(location.search).get('fixture') ?? ''] ?? (() => <p>Unknown fixture</p>);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Fixture />
  </React.StrictMode>,
);
