import * as React from 'react';
import { ChevronsUp, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCheck } from '@/components/ui/task-check';
import type { Item, Question } from './data';
import { Content, dueLabel, str, useLang, useT } from './i18n';
import type { Phase, TaskStore } from './store';

/** The id of the item open in the detail view, so its row reads as selected. */
export const SelectedContext = React.createContext<string | null>(null);


/** Arrow keys move between ticks in the current scope; Enter opens the item. */
export function rowKeys(event: React.KeyboardEvent<HTMLElement>, open: () => void) {
  if (event.key === 'Enter') {
    event.preventDefault();
    open();
    return;
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const scope = event.currentTarget.closest('[data-keyscope]');
  if (!scope) return;
  const all = Array.from(scope.querySelectorAll<HTMLElement>('[data-row-id] .tt-check'));
  const index = all.indexOf(event.currentTarget as HTMLElement);
  const next = all[index + (event.key === 'ArrowDown' ? 1 : -1)];
  if (next) {
    event.preventDefault();
    next.focus();
  }
}

export function DueMark({ due, inOverdueGroup = false }: { due: number; inOverdueGroup?: boolean }) {
  const lang = useLang();
  const t = useT();
  const overdue = due < 0;
  const day = dueLabel(due, lang);
  return (
    <span className="tt-due" data-overdue={overdue}>
      {overdue ? <Clock aria-hidden="true" /> : null}
      {overdue && !inOverdueGroup ? <span>{t.overdueOn(day)}</span> : <span>{overdue ? <span className="tt-sr">{t.overdueSr}</span> : null}{day}</span>}
    </span>
  );
}

export function PriorityMark() {
  const t = useT();
  return (
    <span className="tt-prio" title={t.highPriority}>
      <ChevronsUp aria-hidden="true" />
      <span className="tt-sr">{t.highPriority}</span>
    </span>
  );
}

export function OwnerMark({ owner }: { owner: Item['owner'] }) {
  const t = useT();
  const name = owner === 'Both' ? t.both : owner;
  return <span className="tt-owner" title={name} aria-label={`${t.field.owner}: ${name}`}>{owner === 'Both' ? 'KJ' : owner[0]}</span>;
}

/**
 * One task row. At most four things by default: the tick, a one-line title,
 * and two of category, due date and priority. The owner appears on hover or
 * focus. Long text lives in the detail view, never here.
 */
export function TaskRow({
  item, store, phase, fresh, onOpen, showCategory = false, inOverdueGroup = false,
}: {
  item: Item;
  store: TaskStore;
  phase?: Phase;
  fresh?: boolean;
  onOpen: (item: Item, opener: HTMLElement | null) => void;
  showCategory?: boolean;
  inOverdueGroup?: boolean;
}) {
  const t = useT();
  const lang = useLang();
  const checkRef = React.useRef<HTMLButtonElement>(null);
  const selected = React.useContext(SelectedContext) === item.id;
  const checked = item.done || Boolean(phase);
  const meta: React.ReactNode[] = [];
  // A finished row says nothing more about dates or urgency.
  const settled = item.done && !phase;
  if (showCategory) meta.push(<span key="c" className="tt-catmark"><span className="tt-catmark-label">{t.cat[item.category]}</span></span>);
  if (!settled && item.due !== undefined && meta.length < 2) meta.push(<DueMark key="d" due={item.due} inOverdueGroup={inOverdueGroup} />);
  else if (!settled && !showCategory && item.today && meta.length < 2) meta.push(<span key="d" className="tt-due">{t.today}</span>);
  if (!settled && item.priority === 'high' && meta.length < 2) meta.push(<PriorityMark key="p" />);
  const open = () => onOpen(item, checkRef.current);

  return (
    <li className="tt-rowwrap" data-row-id={item.id} data-phase={phase === 'leave' ? 'leave' : undefined} data-fresh={fresh || undefined}>
      <div>
        <div className="tt-row" data-cat={item.category} data-checked={checked} data-selected={selected || undefined}>
          <TaskCheck
            ref={checkRef}
            checked={checked}
            className="tt-check"
            hue={item.category}
            aria-label={str(item.title, item.origin, lang)}
            onCheckedChange={(value) => (value ? store.complete(item) : store.reopen(item))}
            onKeyDown={(event) => rowKeys(event, open)}
          />
          <button type="button" className="tt-title" tabIndex={-1} onClick={open}>
            <Content className="tt-title-text" text={item.title} origin={item.origin} />
          </button>
          <span className="tt-meta">
            <OwnerMark owner={item.owner} />
            {meta}
          </span>
        </div>
      </div>
    </li>
  );
}

/**
 * A small menu: a button that opens a list of items. Escape and a click
 * outside close it; focus returns to the button. Arrow keys move.
 */
export interface MenuItem {
  key: string;
  label: string;
  onSelect: () => void;
  checked?: boolean;
  swatch?: string;
}
export function Menu({
  label, items, renderButton, align = 'end',
}: {
  label: string;
  items: MenuItem[];
  renderButton: (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref: React.Ref<HTMLButtonElement> }) => React.ReactNode;
  align?: 'start' | 'end';
}) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]') ?? menuRef.current?.querySelector<HTMLButtonElement>('button');
    first?.focus();
    const away = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);
  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };
  return (
    <div className="tt-menu-anchor">
      {renderButton({ ref: buttonRef, 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-label': label, onClick: (event) => { event.stopPropagation(); setOpen(!open); } })}
      {open ? (
        <div
          ref={menuRef}
          className="tt-menu"
          data-align={align}
          role="menu"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
            if (event.key === 'Tab') { setOpen(false); }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              const all = Array.from(menuRef.current!.querySelectorAll<HTMLButtonElement>('button'));
              const i = all.indexOf(document.activeElement as HTMLButtonElement);
              all[(i + (event.key === 'ArrowDown' ? 1 : all.length - 1)) % all.length]?.focus();
            }
          }}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role={item.checked === undefined ? 'menuitem' : 'menuitemradio'}
              aria-checked={item.checked}
              onClick={(event) => { event.stopPropagation(); close(); item.onSelect(); }}
            >
              {item.swatch ? <span className="tt-menu-swatch" data-s={item.swatch} aria-hidden="true" /> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Keeps Tab inside `ref` while `active`, and makes everything beside it
 * inert, so a phone sheet or a centered card behaves as a modal.
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean) {
  React.useEffect(() => {
    const node = ref.current;
    if (!node || !active) return;
    const siblings = Array.from(node.parentElement?.children ?? []).filter((el) => el !== node && !el.hasAttribute('inert')) as HTMLElement[];
    siblings.forEach((el) => el.setAttribute('inert', ''));
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      siblings.forEach((el) => el.removeAttribute('inert'));
    };
  }, [ref, active]);
}

/**
 * A question from an agent. The face holds who asked, the question and its
 * answers, the recommended one first and labeled. Reply in words, reject and
 * snooze sit behind one More control.
 */
export function QuestionCard({ question, store }: { question: Question; store: TaskStore }) {
  const t = useT();
  const lang = useLang();
  const [replying, setReplying] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const busy = Boolean(store.phases[question.id]);
  const parts = t.askParts(question.about ? str(question.about, question.origin, lang) : undefined);
  const options = [...question.options].sort((a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)));
  return (
    <article className="tt-ask" data-cat={question.category} aria-label={t.asks(question.askedBy)}>
      <span className="tt-ask-who">{parts[0]}<strong>{question.askedBy}</strong>{parts[1]}</span>
      <p className="tt-ask-q"><Content text={question.question} origin={question.origin} /></p>
      {replying ? (
        <form
          className="tt-reply"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            store.reply(question);
          }}
        >
          <textarea
            aria-label={t.replyTo(question.askedBy)}
            placeholder={t.replyTo(question.askedBy)}
            value={draft}
            rows={2}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); setReplying(false); } }}
          />
          <div className="tt-ask-actions">
            <Button type="submit" variant="secondary" size="compact" disabled={!draft.trim() || busy}>{t.send}</Button>
            <Button type="button" variant="ghost" size="compact" onClick={() => setReplying(false)}>{t.cancel}</Button>
          </div>
        </form>
      ) : (
        <div className="tt-ask-actions">
          {options.map((option, index) => (
            <Button
              key={index}
              className={index === 0 ? 'tt-ask-focus' : undefined}
              variant={option.recommended ? 'secondary' : 'ghost'}
              size="compact"
              onClick={() => store.answer(question, option.label)}
              disabled={busy}
            >
              <Content text={option.label} origin={question.origin} />
              {option.recommended ? <span className="tt-rec">{t.recommended}</span> : null}
            </Button>
          ))}
          <Menu
            label={t.moreFor(question.askedBy)}
            items={[
              { key: 'reply', label: t.replyWords, onSelect: () => setReplying(true) },
              { key: 'snooze', label: t.snoozeTomorrow, onSelect: () => store.snoozeQuestion(question) },
              { key: 'reject', label: t.reject, onSelect: () => store.reject(question) },
            ]}
            renderButton={({ ref, ...props }) => (
              <button ref={ref} type="button" className="tt-more" disabled={busy} {...props}>
                <MoreHorizontal aria-hidden="true" /><span>{t.more}</span>
              </button>
            )}
          />
        </div>
      )}
    </article>
  );
}

export function UndoToast({ store }: { store: TaskStore }) {
  const t = useT();
  const lang = useLang();
  const { toast } = store;
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => setPaused(false), [toast?.key]);
  if (!toast) return <div className="tt-sr" role="status" aria-live="polite" />;
  const n = toast.entries.length;
  const last = toast.entries[n - 1];
  const text = n === 1
    ? last.label(t, lang)
    : toast.noun === 'done' ? t.tasksDone(n) : toast.noun === 'answered' ? t.questionsAnswered(n) : t.changes(n);
  const pause = (value: boolean) => {
    setPaused(value);
    store.pauseToast(value);
  };
  return (
    <div
      className="tt-toast"
      role="status"
      aria-live="polite"
      data-paused={paused}
      onMouseEnter={() => pause(true)}
      onMouseLeave={() => pause(false)}
      onFocus={() => pause(true)}
      onBlur={() => pause(false)}
    >
      <span className="tt-toast-text">{text}</span>
      <button type="button" className="tt-toast-undo" onClick={store.undoToast}>
        {n > 1 ? t.undoAll(n) : t.undo}
      </button>
      {/* Re-keyed per entry so the bar restarts with the window. */}
      <span key={`${toast.key}-${n}`} className="tt-toast-timer" aria-hidden="true" />
    </div>
  );
}
