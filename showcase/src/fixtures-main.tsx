import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ChoiceGroup } from '@/components/ui/choice-group';
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

const fixtures: Record<string, React.ComponentType> = { choices: Choices };
const Fixture = fixtures[new URLSearchParams(location.search).get('fixture') ?? ''] ?? (() => <p>Unknown fixture</p>);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Fixture />
  </React.StrictMode>,
);
