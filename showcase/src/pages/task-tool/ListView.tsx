import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Category, Item } from './data';
import { useLang, useT } from './i18n';
import { TaskRow } from './parts';
import type { TaskStore } from './store';
import { AllClear, CaptureField, parseCapture } from './TodayView';

export function ListView({
  store, category, switcher, onOpen,
}: {
  store: TaskStore;
  category: Category;
  switcher: React.ReactNode;
  onOpen: (item: Item, opener: HTMLElement | null) => void;
}) {
  const t = useT();
  const lang = useLang();
  const { items, phases, fresh } = store;
  const [showDone, setShowDone] = React.useState(false);
  React.useEffect(() => setShowDone(false), [category]);
  const mine = items.filter((item) => item.category === category && !item.projectId && !item.devState);
  // Overdue first, then dated, then undated; capture order otherwise.
  const open = mine
    .filter((item) => !item.done || phases[item.id])
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (a.item.due ?? (a.item.today ? 0 : 99)) - (b.item.due ?? (b.item.today ? 0 : 99)) || a.index - b.index)
    .map(({ item }) => item);
  const done = mine.filter((item) => item.done && !phases[item.id]);
  const name = t.cat[category];

  return (
    <div className="tt-view" data-keyscope data-cat={category}>
      {switcher}
      <header className="tt-head tt-listhead">
        <div>
          <h2><span className="tt-listhead-mark" aria-hidden="true" />{name}</h2>
          <div className="tt-sub"><span>{t.openN(open.length)}</span></div>
        </div>
      </header>

      <CaptureField
        placeholder={t.addTo(name)}
        onCapture={(raw) => {
          const parsed = parseCapture(raw, category, 'Kaleb');
          if (parsed.title) store.capture(parsed.title, parsed.category, parsed.owner, false, lang);
        }}
      />

      {open.length > 0 ? (
        <ul className="tt-rows" aria-label={name}>
          {open.map((item) => (
            <TaskRow key={item.id} item={item} store={store} phase={phases[item.id]} fresh={fresh[item.id]} onOpen={onOpen} />
          ))}
        </ul>
      ) : (
        <AllClear category={category} title={t.listClear(name)} detail={t.listClearDetail} />
      )}

      {done.length > 0 ? (
        <section className="tt-group tt-donegroup">
          <button type="button" className="tt-disclosure" aria-expanded={showDone} onClick={() => setShowDone(!showDone)}>
            <ChevronRight aria-hidden="true" /> {t.done} <span className="tt-nav-count tt-count-inline">{done.length}</span>
          </button>
          {showDone ? (
            <ul className="tt-rows" aria-label={t.done}>
              {done.map((item) => (
                <TaskRow key={item.id} item={item} store={store} fresh={fresh[item.id]} onOpen={onOpen} />
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
