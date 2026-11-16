import * as React from 'react';
import { AlertCircle, CornerDownLeft, MessageCircleQuestion, Plus } from 'lucide-react';
import { type Category, type Item, type Owner, ownedBy, type Question, SHIPPED } from './data';
import { todayLabel, useLang, useT } from './i18n';
import { QuestionCard, TaskRow } from './parts';
import type { TaskStore } from './store';

export type Scope = 'mine' | 'jules' | 'everyone';

export const SCOPE_OWNER: Record<Scope, Owner> = { mine: 'Kaleb', jules: 'Jules', everyone: 'Kaleb' };

/** "#business buy tape @jules" -> list and owner from the line, the rest is the title.
 *  The list words work in both languages (#affaires, #quotidien, #idees). */
export function parseCapture(raw: string, fallback: Category, fallbackOwner: Owner) {
  let category = fallback;
  let owner = fallbackOwner;
  const title = raw
    .replace(/#(day|daily|quotidien|business|biz|affaires|ideas?|id[eé]es?)\b/i, (_, word: string) => {
      const w = word.toLowerCase();
      category = w.startsWith('b') || w.startsWith('a') ? 'business' : w.startsWith('i') ? 'ideas' : 'day';
      return '';
    })
    .replace(/@(kaleb|jules|both|les deux)\b/i, (_, who: string) => {
      const w = who.toLowerCase();
      owner = w === 'kaleb' ? 'Kaleb' : w === 'jules' ? 'Jules' : 'Both';
      return '';
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { title, category, owner };
}

export function CaptureField({ placeholder, onCapture }: { placeholder: string; onCapture: (raw: string) => void }) {
  const t = useT();
  const [value, setValue] = React.useState('');
  return (
    <form
      className="tt-capture"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        onCapture(value.trim());
        setValue('');
      }}
    >
      <Plus aria-hidden="true" />
      <input
        aria-label={t.addTask}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <span className="tt-capture-hint" aria-hidden="true">
        <kbd>#list</kbd><kbd>@who</kbd><CornerDownLeft size={14} />
      </span>
    </form>
  );
}

export function AllClear({ title, detail, category, compact = false }: { title: string; detail: string; category?: Category; compact?: boolean }) {
  return (
    <div className="tt-clear" role="status" data-cat={category} data-compact={compact || undefined}>
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r="26" />
        <path d="M17 29l7.5 7.5L40 20" pathLength={1} />
      </svg>
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}

export function ScopeSwitch({ scope, setScope }: { scope: Scope; setScope: (scope: Scope) => void }) {
  const t = useT();
  return (
    <div className="tt-scope" role="group" aria-label={t.whose}>
      {(['mine', 'jules', 'everyone'] as Scope[]).map((s) => (
        <button key={s} type="button" aria-pressed={scope === s} onClick={() => setScope(s)}>
          {t.scope[s]}
        </button>
      ))}
    </div>
  );
}

export function TodayView({
  store, scope, setScope, onOpen, goDev,
}: {
  store: TaskStore;
  scope: Scope;
  setScope: (scope: Scope) => void;
  onOpen: (item: Item, opener: HTMLElement | null) => void;
  goDev: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const { items, phases, fresh, questions } = store;
  const asksRef = React.useRef<HTMLDivElement>(null);
  const visible = (item: Item) => item.category !== 'dev' && !item.projectId && ownedBy(scope, item.owner) && (!item.done || phases[item.id]);
  const earlier = items.filter((item) => visible(item) && item.due !== undefined && item.due < 0);
  const today = items.filter((item) => visible(item) && item.today && !(item.due !== undefined && item.due < 0));
  const asks = questions.filter((q) => ownedBy(scope, q.owner));
  // Agents' questions on Dev items reach Today in a block of their own, below the others.
  const everydayAsks = asks.filter((q) => q.category !== 'dev');
  const devAsks = asks.filter((q) => q.category === 'dev');
  const tomorrow = items.filter((item) => !item.done && item.category !== 'dev' && !item.projectId && ownedBy(scope, item.owner) && item.due === 1).length;
  const inFlight = items.filter((item) => item.devState === 'flight').length;
  const shippedToday = SHIPPED.filter((s) => s.day === 'today').length;
  const settledEmpty = earlier.length === 0 && today.length === 0;

  return (
    <div className="tt-view" data-keyscope>
      <header className="tt-head tt-head-grid">
        <h2>{t.today}</h2>
        <ScopeSwitch scope={scope} setScope={setScope} />
        <div className="tt-sub">
          <span>{todayLabel(lang)}</span>
          {/* The questions stay reachable from the top without pushing tasks down. */}
          {asks.length > 0 ? (
            <button type="button" className="tt-devline" onClick={() => { asksRef.current?.scrollIntoView({ block: 'start' }); asksRef.current?.querySelector<HTMLElement>('.tt-ask-focus')?.focus(); }}>
              <MessageCircleQuestion aria-hidden="true" />
              {t.questionsWaiting(asks.length)}
            </button>
          ) : null}
          <button type="button" className="tt-devline" onClick={goDev}>
            <span className="tt-devdot" aria-hidden="true" />
            {t.devLine(inFlight, shippedToday)}
          </button>
        </div>
      </header>

      <CaptureField
        placeholder={t.addToday}
        onCapture={(raw) => {
          const parsed = parseCapture(raw, 'day', SCOPE_OWNER[scope]);
          if (parsed.title) store.capture(parsed.title, parsed.category, parsed.owner, true, lang);
        }}
      />

      {earlier.length > 0 ? (
        <section className="tt-group" aria-labelledby="tt-earlier-h">
          <h3 className="tt-group-head" id="tt-earlier-h" data-tone="overdue">
            <AlertCircle aria-hidden="true" /> {t.fromEarlier} <small>{t.overdueN(earlier.length)}</small>
          </h3>
          <ul className="tt-rows">
            {earlier.map((item) => (
              <TaskRow key={item.id} item={item} store={store} phase={phases[item.id]} fresh={fresh[item.id]} onOpen={onOpen} showCategory inOverdueGroup />
            ))}
          </ul>
        </section>
      ) : null}

      {today.length > 0 ? (
        <section className="tt-group" aria-labelledby="tt-today-h">
          <h3 className="tt-group-head" id="tt-today-h">{t.today} <small>{today.length}</small></h3>
          <ul className="tt-rows">
            {today.map((item) => (
              <TaskRow key={item.id} item={item} store={store} phase={phases[item.id]} fresh={fresh[item.id]} onOpen={onOpen} showCategory />
            ))}
          </ul>
        </section>
      ) : null}

      {settledEmpty ? (
        <AllClear
          compact={asks.length > 0}
          title={asks.length ? t.clearTasks : t.clearToday}
          detail={tomorrow > 0 ? t.tomorrowHas(tomorrow) : t.nothingElse}
        />
      ) : null}

      {/* The jump from the header lands on the first block that has questions. */}
      <div ref={asksRef}>
        {everydayAsks.length > 0 ? (
          <section className="tt-group" aria-labelledby="tt-asks-h">
            <h3 className="tt-group-head" id="tt-asks-h">{t.waiting} <small>{everydayAsks.length}</small></h3>
            <QuestionList questions={everydayAsks} store={store} />
          </section>
        ) : null}

        {devAsks.length > 0 ? (
          <section className="tt-group" aria-labelledby="tt-devasks-h">
            <h3 className="tt-group-head" id="tt-devasks-h">
              <span className="tt-devdot" aria-hidden="true" /> {t.devQuestions} <small>{devAsks.length}</small>
            </h3>
            <QuestionList questions={devAsks} store={store} />
          </section>
        ) : null}
      </div>
    </div>
  );
}

function QuestionList({ questions, store }: { questions: Question[]; store: TaskStore }) {
  const { phases, fresh } = store;
  return (
    <div className="tt-asks">
      {questions.map((q) => (
        <div key={q.id} className="tt-collapse" data-row-id={q.id} data-phase={phases[q.id] === 'leave' ? 'leave' : undefined} data-fresh={fresh[q.id] || undefined}>
          <div><QuestionCard question={q} store={store} /></div>
        </div>
      ))}
    </div>
  );
}
