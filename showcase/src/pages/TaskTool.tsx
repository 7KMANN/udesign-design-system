import * as React from 'react';
import { Code2, Layers, ListChecks, Sun } from 'lucide-react';
import { type Category, type Item, ownedBy, type Project } from './task-tool/data';
import { type Detail, DetailPanel } from './task-tool/DetailPanel';
import { DevView } from './task-tool/DevView';
import type { Lang } from './task-tool/data';
import { DICT, LangContext } from './task-tool/i18n';
import { ListView } from './task-tool/ListView';
import { SelectedContext, UndoToast } from './task-tool/parts';
import { ProjectsView } from './task-tool/ProjectsView';
import { useTaskStore } from './task-tool/store';
import { type Scope, TodayView } from './task-tool/TodayView';
import './task-tool/task-tool.css';

type Place = { to: 'today' } | { to: 'list'; category: Exclude<Category, 'dev'> } | { to: 'projects' } | { to: 'dev' };
const LISTS: Exclude<Category, 'dev'>[] = ['day', 'business', 'ideas'];

// Route A as approved by Kaleb on 2026-11-15 (D-65): colored lists, the rounded-square
// check, comfortable rows, a ticked row that leaves at once. The words on screen are English;
// the dictionaries keep both languages for the product.
const LANG: Lang = 'en';

/** Width of the tool's own frame, so modal behavior follows the layout the
 *  container queries chose, not the window. */
function useFrameWidth(ref: React.RefObject<HTMLElement>) {
  const [width, setWidth] = React.useState(1200);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export function TaskTool() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const store = useTaskStore(rootRef);
  const [place, setPlace] = React.useState<Place>({ to: 'today' });
  const [scope, setScope] = React.useState<Scope>('mine');
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);
  const mainRef = React.useRef<HTMLElement>(null);
  const frameWidth = useFrameWidth(frameRef);
  const t = DICT[LANG];
  // The side panel overlays the list below 1080px and covers it below 720px:
  // in both cases it is a modal and traps focus.
  const panelIsModal = frameWidth <= 1080;

  const go = (next: Place) => {
    setPlace(next);
    setDetail(null);
    mainRef.current?.scrollTo({ top: 0 });
  };
  const openItem = (item: Item, opener: HTMLElement | null) => {
    openerRef.current = opener;
    setDetail({ type: 'item', id: item.id });
  };
  const openProject = (project: Project, opener: HTMLElement | null) => {
    openerRef.current = opener;
    setDetail({ type: 'project', id: project.id });
  };
  const closeDetail = () => {
    const opener = openerRef.current;
    setDetail(null);
    // After the modal's inert siblings are released.
    window.setTimeout(() => { if (opener?.isConnected) opener.focus(); }, 0);
  };

  // Ctrl+Z / Cmd+Z undoes the open toast, unless the person is typing.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.key === 'z' && (event.ctrlKey || event.metaKey))) return;
      const target = event.target as HTMLElement;
      if ((target !== document.body && !rootRef.current?.contains(target)) || target.closest('input, textarea, select')) return;
      if (store.toast) { event.preventDefault(); store.undoToast(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [store]);

  const open = (item: Item) => !item.done && !item.projectId && !item.devState;
  const todayCount = store.items.filter((i) => open(i) && ownedBy(scope, i.owner) && (i.today || (i.due !== undefined && i.due < 0))).length;
  const listCount = (c: Category) => store.items.filter((i) => open(i) && i.category === c).length;
  const triageCount = store.items.filter((i) => i.devState === 'triage').length;

  const isList = (c: Category) => place.to === 'list' && place.category === c;
  const listSwitcher = (
    <nav className="tt-listswitch" aria-label={t.lists}>
      {LISTS.map((c) => (
        <button key={c} type="button" className="tt-nav" data-cat={c} aria-current={isList(c) ? 'page' : undefined} onClick={() => go({ to: 'list', category: c })}>
          <span className="tt-nav-dot" aria-hidden="true" />{t.cat[c]}
        </button>
      ))}
    </nav>
  );

  return (
    <LangContext.Provider value={LANG}>
      <div
        ref={rootRef}
        lang={LANG === 'fr' ? 'fr-CA' : 'en'}
        data-scenario="task"
      >
        <div className="tt-frame" ref={frameRef}>
          <SelectedContext.Provider value={detail?.id ?? null}>
              <div className="tt-shell" data-panel={detail ? 'open' : undefined}>
                <nav className="tt-rail" aria-label="ECHELON">
                  <div className="tt-rail-brand">ECHELON</div>
                  <button type="button" className="tt-nav" aria-current={place.to === 'today' ? 'page' : undefined} onClick={() => go({ to: 'today' })}>
                    <Sun aria-hidden="true" />{t.today}{todayCount ? <span className="tt-nav-count">{todayCount}</span> : null}
                  </button>
                  <div className="tt-rail-label">{t.lists}</div>
                  {LISTS.map((c) => (
                    <button key={c} type="button" className="tt-nav" data-cat={c} aria-current={isList(c) ? 'page' : undefined} onClick={() => go({ to: 'list', category: c })}>
                      <span className="tt-nav-dot" aria-hidden="true" />{t.cat[c]}
                      {listCount(c) ? <span className="tt-nav-count">{listCount(c)}</span> : null}
                    </button>
                  ))}
                  <div className="tt-rail-label">{t.planning}</div>
                  <button type="button" className="tt-nav" aria-current={place.to === 'projects' ? 'page' : undefined} onClick={() => go({ to: 'projects' })}>
                    <Layers aria-hidden="true" />{t.projects}
                  </button>
                  <hr className="tt-rail-sep" />
                  <button type="button" className="tt-nav" data-cat="dev" aria-current={place.to === 'dev' ? 'page' : undefined} onClick={() => go({ to: 'dev' })}>
                    <Code2 aria-hidden="true" />{t.dev}
                    {triageCount ? <span className="tt-nav-count">{t.toSort(triageCount)}</span> : null}
                  </button>
                </nav>

                <main ref={mainRef} className="tt-main" data-space={place.to === 'dev' ? 'dev' : 'everyday'} aria-label={t.today}>
                  {place.to === 'today' ? <TodayView store={store} scope={scope} setScope={setScope} onOpen={openItem} goDev={() => go({ to: 'dev' })} /> : null}
                  {place.to === 'list' ? <ListView store={store} category={place.category} switcher={listSwitcher} onOpen={openItem} /> : null}
                  {place.to === 'projects' ? <ProjectsView store={store} onOpen={openItem} onOpenProject={openProject} /> : null}
                  {place.to === 'dev' ? <DevView store={store} onOpen={openItem} /> : null}
                </main>

                {detail ? <DetailPanel key={detail.id} detail={detail} store={store} onClose={closeDetail} modal={panelIsModal} /> : null}

                <nav className="tt-bottombar" aria-label="ECHELON">
                  <button type="button" aria-current={place.to === 'today' ? 'page' : undefined} onClick={() => go({ to: 'today' })}><Sun aria-hidden="true" />{t.today}</button>
                  <button type="button" aria-current={place.to === 'list' ? 'page' : undefined} onClick={() => go({ to: 'list', category: place.to === 'list' ? place.category : 'day' })}><ListChecks aria-hidden="true" />{t.lists}</button>
                  <button type="button" aria-current={place.to === 'projects' ? 'page' : undefined} onClick={() => go({ to: 'projects' })}><Layers aria-hidden="true" />{t.projects}</button>
                  <button type="button" aria-current={place.to === 'dev' ? 'page' : undefined} onClick={() => go({ to: 'dev' })}><Code2 aria-hidden="true" />{t.dev}</button>
                </nav>
              </div>
          </SelectedContext.Provider>
          <UndoToast store={store} />
        </div>
      </div>
    </LangContext.Provider>
  );
}
