import * as React from 'react';
import { ChevronRight, Languages, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import type { Item, Lang, Project, Text } from './data';
import { Content, pick, str, useLang, useT } from './i18n';
import { TaskCheck } from '@/components/ui/task-check';
import { DueMark, PriorityMark, useFocusTrap } from './parts';
import type { TaskStore } from './store';

export type Detail = { type: 'item'; id: string } | { type: 'project'; id: string };

/** A field with no value is not rendered. v1 printed "None" 18 times. */
function DetailsSection({ rows }: { rows: [string, React.ReactNode | undefined][] }) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const present = rows.filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (present.length === 0) return null;
  return (
    <section className="tt-details">
      <button type="button" className="tt-disclosure" aria-expanded={open} onClick={() => setOpen(!open)}>
        <ChevronRight aria-hidden="true" /> {t.details}
      </button>
      {open ? (
        <dl>
          {present.map(([label, value]) => (
            <React.Fragment key={label}><dt>{label}</dt><dd>{value}</dd></React.Fragment>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

/**
 * Where the words on screen come from. One quiet line under the title; it
 * never appears on rows. States: original, translated (with Show original,
 * which swaps the text in place), pending (original shown, other language
 * not ready), and edited (the edited language became the original).
 */
function OriginLine({ text, origin, edited, showOriginal, setShowOriginal }: {
  text: Text;
  origin: Lang;
  edited?: boolean;
  showOriginal: boolean;
  setShowOriginal: (v: boolean) => void;
}) {
  const t = useT();
  const lang = useLang();
  const other: Lang = origin === 'en' ? 'fr' : 'en';
  const otherMissing = !text[other];
  let note: string;
  let swap: React.ReactNode = null;
  if (otherMissing) {
    note = edited ? t.editedPending(origin) : t.pending(origin);
  } else if (lang === origin) {
    note = edited ? t.editedDone(origin) : t.original(origin);
  } else if (showOriginal) {
    note = t.showingOriginal(origin);
    swap = <button type="button" className="tt-origin-swap" onClick={() => setShowOriginal(false)}>{t.showTranslation}</button>;
  } else {
    note = t.translatedFrom(origin);
    swap = <button type="button" className="tt-origin-swap" onClick={() => setShowOriginal(true)}>{t.showOriginal}</button>;
  }
  return (
    <p className="tt-origin" data-state={otherMissing ? 'pending' : lang === origin ? 'original' : 'translated'} aria-live="polite">
      <Languages aria-hidden="true" />
      <span>{note}</span>
      {swap}
    </p>
  );
}

function Shown({ text, origin, forceOriginal }: { text: Text | undefined; origin: Lang; forceOriginal: boolean }) {
  const lang = useLang();
  const shown = pick(text, origin, lang, forceOriginal);
  if (!shown) return null;
  return <span lang={shown.lang === lang ? undefined : shown.lang}>{shown.text}</span>;
}

export function DetailPanel({
  detail, store, onClose, modal = false,
}: {
  detail: Detail;
  store: TaskStore;
  onClose: () => void;
  modal?: boolean;
}) {
  const t = useT();
  const lang = useLang();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const [showOriginal, setShowOriginal] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState('');
  const [draftNext, setDraftNext] = React.useState('');
  React.useEffect(() => { headingRef.current?.focus(); setShowOriginal(false); setEditing(false); }, [detail.id]);
  React.useEffect(() => setShowOriginal(false), [lang]);
  useFocusTrap(rootRef, modal);

  const item: Item | undefined = detail.type === 'item' ? store.items.find((i) => i.id === detail.id) : undefined;
  const project: Project | undefined = detail.type === 'project' ? store.projects.find((p) => p.id === detail.id) : undefined;
  if (!item && !project) return null;
  const record = (item ?? project)!;
  const category = record.category;
  const origin = record.origin;
  const titleText = record.title;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && !editing) { event.stopPropagation(); onClose(); }
  };

  const projectChildren = project ? store.items.filter((i) => i.projectId === project.id) : [];
  const subItems = item?.subItems;
  const checked = item ? (item.projectId ? item.projectStatus === 'Done' : item.done || Boolean(store.phases[item.id])) : false;
  const isDev = Boolean(item?.devState);
  const parent = item?.projectId ? store.projects.find((p) => p.id === item.projectId) : undefined;

  const startEdit = () => {
    if (!item) return;
    setDraftTitle(pick(item.title, item.origin, lang, showOriginal)?.text ?? '');
    setDraftNext(pick(item.nextStep, item.origin, lang, showOriginal)?.text ?? '');
    setEditing(true);
  };
  // Saving writes in the language of the reader, unless the original was on screen.
  const editLang: Lang = showOriginal ? origin : lang;

  const body = (
    <>
      <div className="tt-panel-bar">
        <span className="tt-panel-crumb">
          <span className="tt-dot" aria-hidden="true" />
          {project ? t.project : t.cat[category]}
          {parent ? <>, <Content text={parent.title} origin={parent.origin} /></> : null}
        </span>
        <span className="tt-panel-tools">
          {item && !editing ? (
            <IconButton variant="ghost" label={t.edit} icon={<Pencil size={16} />} onClick={startEdit} />
          ) : null}
          <IconButton variant="ghost" label={t.close} icon={<X size={18} />} onClick={onClose} />
        </span>
      </div>
      <div className="tt-panel-body">
        {editing && item ? (
          <form
            className="tt-edit"
            lang={editLang === lang ? undefined : editLang}
            onSubmit={(event) => {
              event.preventDefault();
              if (!draftTitle.trim()) return;
              store.editText(item, { title: draftTitle.trim(), nextStep: draftNext.trim() }, editLang);
              setShowOriginal(false);
              setEditing(false);
              requestAnimationFrame(() => headingRef.current?.focus());
            }}
            onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); setEditing(false); } }}
          >
            <label>
              <span>{t.editTitle}</span>
              <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} autoFocus />
            </label>
            <label>
              <span>{t.nextStep}</span>
              <textarea value={draftNext} rows={5} onChange={(e) => setDraftNext(e.target.value)} />
            </label>
            <div className="tt-ask-actions">
              <Button type="submit" size="compact">{t.save}</Button>
              <Button type="button" variant="ghost" size="compact" onClick={() => setEditing(false)}>{t.cancel}</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="tt-panel-title" data-checked={checked} data-notick={project || isDev ? true : undefined}>
              {item && !isDev ? (
                <TaskCheck
                  className="tt-check"
                  checked={checked}
                  hue={item.category}
                  aria-label={str(item.title, item.origin, lang)}
                  onCheckedChange={(value) => {
                    if (item.projectId) store.setProjectStatus(item, value ? 'Done' : 'Working');
                    else if (value) store.complete(item);
                    else store.reopen(item);
                  }}
                />
              ) : null}
              <h3 ref={headingRef} tabIndex={-1}><Shown text={titleText} origin={origin} forceOriginal={showOriginal} /></h3>
            </div>
            <OriginLine text={titleText} origin={origin} edited={item?.edited} showOriginal={showOriginal} setShowOriginal={setShowOriginal} />

            <div className="tt-panel-facts">
              {item?.due !== undefined && !item.done ? <DueMark due={item.due} /> : null}
              {item?.priority === 'high' ? <span className="tt-inline-mark"><PriorityMark /> {t.highPriority}</span> : null}
              {item ? <span>{item.owner === 'Both' ? t.both : item.owner}</span> : null}
              {item?.stage ? <span>{item.executor ? `${item.executor}: ` : ''}{t.stage[item.stage]}</span> : null}
              {item?.projectStatus ? <span>{t.status[item.projectStatus]}</span> : null}
              {checked && !item?.projectId ? <span>{t.completed}</span> : null}
              {project ? <span>{t.horizon[project.horizon]}</span> : null}
            </div>

            {item?.nextStep ? (
              <section className="tt-panel-section">
                <h4>{t.nextStep}</h4>
                <p><Shown text={item.nextStep} origin={origin} forceOriginal={showOriginal} /></p>
              </section>
            ) : null}
            {project?.summary ? (
              <section className="tt-panel-section">
                <h4>{t.goal}</h4>
                <p><Shown text={project.summary} origin={origin} forceOriginal={showOriginal} /></p>
              </section>
            ) : null}
            {item?.notes ? (
              <section className="tt-panel-section">
                <h4>{t.notes}</h4>
                <p><Shown text={item.notes} origin={origin} forceOriginal={showOriginal} /></p>
              </section>
            ) : null}

            {subItems && subItems.length > 0 ? (
              <section className="tt-panel-section">
                <h4>{t.steps(subItems.filter((s) => s.done).length, subItems.length)}</h4>
                <ul className="tt-subitems">
                  {subItems.map((sub) => (
                    <li key={sub.id} data-checked={sub.done}>
                      <TaskCheck className="tt-check" hue={item!.category} checked={sub.done} aria-label={str(sub.title, origin, lang)} onCheckedChange={() => store.toggleSubItem(item!.id, sub.id)} />
                      <Shown text={sub.title} origin={origin} forceOriginal={showOriginal} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {project ? (
              <section className="tt-panel-section">
                <h4>{t.tasksOf(projectChildren.filter((c) => c.projectStatus === 'Done').length, projectChildren.length)}</h4>
                <ul className="tt-subitems">
                  {projectChildren.map((child) => (
                    <li key={child.id} data-checked={child.projectStatus === 'Done'}>
                      <TaskCheck className="tt-check" hue={child.category} checked={child.projectStatus === 'Done'} aria-label={str(child.title, child.origin, lang)} onCheckedChange={(value) => store.setProjectStatus(child, value ? 'Done' : 'Working')} />
                      <Content text={child.title} origin={child.origin} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <DetailsSection rows={item ? [
              [t.field.code, item.code],
              [t.field.owner, item.owner === 'Both' ? t.both : item.owner],
              [t.field.doneBy, item.executor],
              [t.field.loggedBy, item.loggedBy],
              [t.field.when, item.when ? str(item.when, item.origin, lang) : undefined],
              [t.field.added, item.created ? str(item.created, item.origin, lang) : undefined],
            ] : project ? [
              [t.field.owner, project.owner === 'Both' ? t.both : project.owner],
            ] : []} />
          </>
        )}
      </div>
    </>
  );

  return (
    <div
      ref={rootRef}
      className="tt-panel"
      role={modal ? 'dialog' : 'complementary'}
      aria-modal={modal || undefined}
      aria-label={`${t.details}: ${str(titleText, origin, lang)}`}
      onKeyDown={onKeyDown}
      data-cat={category}
    >
      {body}
    </div>
  );
}
