import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Horizon, Item, Project, ProjectStatus } from './data';
import { Content, str, useLang, useT } from './i18n';
import { Menu, OwnerMark, rowKeys, TaskCheck } from './parts';
import type { TaskStore } from './store';

export const STATUSES: ProjectStatus[] = ['Not started', 'Working', 'Stuck', 'Done'];
export const HORIZONS: Horizon[] = ['Now', 'Next', 'Later'];

function Progress({ children }: { children: Item[] }) {
  const t = useT();
  const done = children.filter((c) => c.projectStatus === 'Done').length;
  const stuck = children.filter((c) => c.projectStatus === 'Stuck').length;
  const rank: ProjectStatus[] = ['Done', 'Working', 'Stuck', 'Not started'];
  const sorted = [...children].sort((a, b) => rank.indexOf(a.projectStatus ?? 'Not started') - rank.indexOf(b.projectStatus ?? 'Not started'));
  return (
    <span className="tt-progress">
      <span className="tt-progress-bar" aria-hidden="true">
        {sorted.map((c) => <span key={c.id} data-s={c.projectStatus} />)}
      </span>
      <span>{t.progress(done, children.length, stuck)}</span>
    </span>
  );
}

export function StatusCell({ item, store }: { item: Item; store: TaskStore }) {
  const t = useT();
  const status = item.projectStatus ?? 'Not started';
  return (
    <Menu
      label={`${t.col.status}: ${t.status[status]}`}
      items={STATUSES.map((s) => ({ key: s, label: t.status[s], checked: s === status, swatch: s, onSelect: () => store.setProjectStatus(item, s) }))}
      renderButton={({ ref, ...props }) => (
        <button ref={ref} type="button" className="tt-status" data-s={status} {...props}>
          {t.status[status]}
        </button>
      )}
    />
  );
}

function ChildRow({ item, store, onOpen }: { item: Item; store: TaskStore; onOpen: (item: Item, opener: HTMLElement | null) => void }) {
  const t = useT();
  const lang = useLang();
  const checkRef = React.useRef<HTMLButtonElement>(null);
  const checked = item.projectStatus === 'Done';
  const open = () => onOpen(item, checkRef.current);
  return (
    <tr data-row-id={item.id}>
      <td>
        <div className="tt-cell-task" data-cat={item.category} data-checked={checked}>
          <TaskCheck
            ref={checkRef}
            checked={checked}
            label={str(item.title, item.origin, lang)}
            onCheckedChange={(value) => store.setProjectStatus(item, value ? 'Done' : 'Working')}
            onKeyDown={(event) => rowKeys(event, open)}
          />
          <button type="button" className="tt-title" tabIndex={-1} onClick={open}>
            <Content className="tt-title-text" text={item.title} origin={item.origin} />
          </button>
        </div>
      </td>
      <td className="tt-statuscell"><StatusCell item={item} store={store} /></td>
      <td><span className="tt-ownercell"><OwnerMark owner={item.owner} />{item.owner === 'Both' ? t.both : item.owner}</span></td>
      <td><span className="tt-when"><Content text={item.when} origin={item.origin} /></span></td>
    </tr>
  );
}

function ProjectGroup({
  project, children, store, onOpen, onOpenProject, defaultOpen,
}: {
  project: Project;
  children: Item[];
  store: TaskStore;
  onOpen: (item: Item, opener: HTMLElement | null) => void;
  onOpenProject: (project: Project, opener: HTMLElement | null) => void;
  defaultOpen: boolean;
}) {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = React.useState(defaultOpen);
  const id = `tt-proj-${project.id}`;
  const title = str(project.title, project.origin, lang);
  return (
    <section className="tt-proj" data-cat={project.category} aria-labelledby={`${id}-h`}>
      <div className="tt-proj-head">
        <button type="button" id={`${id}-h`} className="tt-proj-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          <ChevronRight aria-hidden="true" />
          <span className="tt-dot" aria-hidden="true" />
          <Content text={project.title} origin={project.origin} />
          <small className="tt-proj-cat">{t.cat[project.category]}</small>
        </button>
        <button type="button" className="tt-proj-open" onClick={(event) => onOpenProject(project, event.currentTarget)}>
          {t.details}<span className="tt-sr"> {title}</span>
        </button>
        <Progress>{children}</Progress>
      </div>
      {open ? (
        <table className="tt-table" id={id} data-keyscope>
          <thead>
            <tr><th scope="col">{t.col.task}</th><th scope="col">{t.col.status}</th><th scope="col">{t.col.owner}</th><th scope="col">{t.col.when}</th></tr>
          </thead>
          <tbody>
            {children.map((item) => <ChildRow key={item.id} item={item} store={store} onOpen={onOpen} />)}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}

function HorizonGroup({
  horizon, projects, store, onOpenProject,
}: {
  horizon: Horizon;
  projects: Project[];
  store: TaskStore;
  onOpenProject: (project: Project, opener: HTMLElement | null) => void;
}) {
  const t = useT();
  const lang = useLang();
  if (projects.length === 0) return null;
  return (
    <section className="tt-group">
      <h3 className="tt-group-head">{t.horizon[horizon]} <small>{projects.length}</small></h3>
      <div className="tt-proj">
        <table className="tt-table tt-roadmap">
          <thead>
            <tr><th scope="col">{t.col.project}</th><th scope="col">{t.col.progress}</th><th scope="col">{t.col.owner}</th><th scope="col">{t.col.when}</th></tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const children = store.items.filter((i) => i.projectId === project.id);
              const title = str(project.title, project.origin, lang);
              return (
                <tr key={project.id}>
                  <td>
                    <div className="tt-cell-task" data-kind="project" data-cat={project.category}>
                      <span className="tt-dot" aria-hidden="true" />
                      <button type="button" className="tt-title" onClick={(event) => onOpenProject(project, event.currentTarget)}>
                        <Content className="tt-title-text" text={project.title} origin={project.origin} />
                      </button>
                      <small className="tt-proj-cat">{t.cat[project.category]}</small>
                    </div>
                  </td>
                  <td><Progress>{children}</Progress></td>
                  <td><span className="tt-ownercell"><OwnerMark owner={project.owner} />{project.owner === 'Both' ? t.both : project.owner}</span></td>
                  <td>
                    <Menu
                      label={t.horizonFor(title)}
                      items={HORIZONS.map((h) => ({ key: h, label: t.horizon[h], checked: h === project.horizon, onSelect: () => store.setHorizon(project.id, h) }))}
                      renderButton={({ ref, ...props }) => (
                        <button ref={ref} type="button" className="tt-horizon-chip" {...props}>
                          {t.horizon[project.horizon]}<ChevronDown aria-hidden="true" />
                        </button>
                      )}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ProjectsView({
  store, onOpen, onOpenProject,
}: {
  store: TaskStore;
  onOpen: (item: Item, opener: HTMLElement | null) => void;
  onOpenProject: (project: Project, opener: HTMLElement | null) => void;
}) {
  const t = useT();
  const [grouping, setGrouping] = React.useState<'project' | 'horizon'>('project');
  return (
    <div className="tt-view tt-view-wide">
      <header className="tt-head">
        <div>
          <h2>{t.projects}</h2>
          <div className="tt-sub"><span>{t.projectsSub}</span></div>
        </div>
        <div className="tt-scope" role="group" aria-label={t.groupBy}>
          <button type="button" aria-pressed={grouping === 'project'} onClick={() => setGrouping('project')}>{t.byProject}</button>
          <button type="button" aria-pressed={grouping === 'horizon'} onClick={() => setGrouping('horizon')}>{t.byHorizon}</button>
        </div>
      </header>
      {grouping === 'project'
        ? store.projects.map((project, index) => (
          <ProjectGroup
            key={project.id}
            project={project}
            children={store.items.filter((i) => i.projectId === project.id)}
            store={store}
            onOpen={onOpen}
            onOpenProject={onOpenProject}
            defaultOpen={index < 2}
          />
        ))
        : HORIZONS.map((horizon) => (
          <HorizonGroup key={horizon} horizon={horizon} projects={store.projects.filter((p) => p.horizon === horizon)} store={store} onOpenProject={onOpenProject} />
        ))}
    </div>
  );
}
