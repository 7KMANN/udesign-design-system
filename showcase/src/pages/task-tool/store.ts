import { useCallback, useEffect, useRef, useState } from 'react';
import { ITEMS, PROJECTS, QUESTIONS, type Category, type DevState, type Horizon, type Item, type Lang, type Owner, type Project, type ProjectStatus, type Question, type Text } from './data';
import { DICT, str } from './i18n';

/** 'tick': checked and struck, still in place. 'leave': collapsing out. */
export type Phase = 'tick' | 'leave';
type Dict = (typeof DICT)['en'];

export interface ToastEntry {
  /** Resolved at render, so the toast follows the language switch. */
  label: (t: Dict, lang: Lang) => string;
  undo: () => void;
}

export interface ToastState {
  key: number;
  entries: ToastEntry[];
  noun: 'done' | 'answered' | 'other';
}

/** Reads a duration role off the scenario root, so the timing in JS is the
 *  timing in CSS (and collapses with it under reduced motion). */
function readMs(root: HTMLElement | null, name: string): number {
  if (!root) return 0;
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  if (!raw) return 0;
  if (raw.endsWith('ms')) return parseFloat(raw);
  if (raw.endsWith('s')) return parseFloat(raw) * 1000;
  return parseFloat(raw) || 0;
}

let nextId = 100;

/**
 * In-memory stand-in for the real store.
 *
 * Writes model the agreed server contract: a change is held locally and sent
 * when its undo toast closes, about 3 seconds after the last change. Undo
 * inside that window drops the change before it is sent, so it leaves no
 * trace on the server. `sent` counts what would have reached it.
 */
export function useTaskStore(rootRef: React.RefObject<HTMLElement>) {
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);
  const [phases, setPhases] = useState<Record<string, Phase>>({});
  const [fresh, setFresh] = useState<Record<string, true>>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sent, setSent] = useState(0);
  const timers = useRef<Record<string, number[]>>({});
  const toastTimer = useRef<number | null>(null);
  const toastPaused = useRef(false);
  const toastRef = useRef<ToastState | null>(null);

  const clearTimers = (id: string) => {
    (timers.current[id] ?? []).forEach((t) => window.clearTimeout(t));
    delete timers.current[id];
  };
  const setPhase = (id: string, phase: Phase | null) =>
    setPhases((current) => {
      const next = { ...current };
      if (phase) next[id] = phase;
      else delete next[id];
      return next;
    });
  const markFresh = useCallback((id: string) => {
    setFresh((current) => ({ ...current, [id]: true }));
    window.setTimeout(() => setFresh((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    }), readMs(rootRef.current, '--motion-duration-standard') + 50);
  }, [rootRef]);

  const showToast = (next: ToastState | null) => {
    toastRef.current = next;
    setToast(next);
  };

  // One toast. A change inside the window joins it and restarts the window,
  // so nothing stacks and every undo stays reachable until the batch is sent.
  const armToastTimer = useCallback(() => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    if (toastPaused.current) return;
    toastTimer.current = window.setTimeout(() => {
      const batch = toastRef.current;
      if (batch) setSent((n) => n + batch.entries.length);
      showToast(null);
    }, readMs(rootRef.current, '--task-undo-window'));
  }, [rootRef]);

  const pushToast = useCallback((entry: ToastEntry, noun: ToastState['noun']) => {
    const current = toastRef.current;
    showToast(current
      ? { key: current.key, entries: [...current.entries, entry], noun: current.noun === noun ? noun : 'other' }
      : { key: Date.now(), entries: [entry], noun });
    armToastTimer();
  }, [armToastTimer]);

  const pauseToast = useCallback((paused: boolean) => {
    toastPaused.current = paused;
    if (paused) {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    } else {
      armToastTimer();
    }
  }, [armToastTimer]);

  const undoToast = useCallback(() => {
    const current = toastRef.current;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    showToast(null);
    current?.entries.slice().reverse().forEach((entry) => entry.undo());
  }, []);

  /** Plays tick, hold, leave, then applies `finish`. Focus moves to the next
   *  row first if it was on the leaving one. */
  const runLeave = useCallback((id: string, finish: () => void) => {
    const root = rootRef.current;
    const hold = readMs(root, '--task-hold');
    const leave = readMs(root, '--task-leave');
    setPhase(id, 'tick');
    const t1 = window.setTimeout(() => setPhase(id, 'leave'), hold);
    const t2 = window.setTimeout(() => {
      const row = root?.querySelector<HTMLElement>(`[data-row-id="${id}"]`);
      const focusWasInside = row?.contains(document.activeElement) ?? false;
      let target: HTMLElement | null = null;
      if (focusWasInside && row) {
        const scope = row.closest('[data-keyscope]') ?? root!;
        const all = Array.from(scope.querySelectorAll<HTMLElement>('[data-row-id] .tt-check, [data-row-id] .tt-ask-focus'));
        const mine = all.findIndex((el) => row.contains(el));
        const usable = (el: HTMLElement) => !row.contains(el) && !el.closest('[data-phase]');
        target = all.slice(mine + 1).find(usable) ?? all.slice(0, Math.max(mine, 0)).reverse().find(usable) ?? null;
      }
      target?.focus();
      finish();
      setPhase(id, null);
      delete timers.current[id];
    }, hold + leave);
    timers.current[id] = [t1, t2];
  }, [rootRef]);

  const restore = useCallback((id: string, apply: () => void) => {
    clearTimers(id);
    setPhase(id, null);
    apply();
    markFresh(id);
  }, [markFresh]);

  const patch = (id: string, change: Partial<Item>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...change } : item)));

  /** The tick. */
  const complete = useCallback((item: Item) => {
    if (phases[item.id]) return;
    runLeave(item.id, () => patch(item.id, { done: true, doneNow: true }));
    pushToast({
      label: (t, lang) => t.doneLabel(str(item.title, item.origin, lang)),
      undo: () => restore(item.id, () => patch(item.id, { done: false, doneNow: false })),
    }, 'done');
  }, [phases, pushToast, restore, runLeave]);

  /** Unticking: during the hold it cancels; from a Done group it reopens. */
  const reopen = useCallback((item: Item) => {
    restore(item.id, () => patch(item.id, { done: false, doneNow: false }));
  }, [restore]);

  /** Projects keep the row and change its status instead. */
  const setProjectStatus = useCallback((item: Item, status: ProjectStatus) => {
    const before = item.projectStatus;
    patch(item.id, { projectStatus: status, done: status === 'Done' });
    if (status === 'Done') {
      pushToast({
        label: (t, lang) => t.doneLabel(str(item.title, item.origin, lang)),
        undo: () => patch(item.id, { projectStatus: before, done: false }),
      }, 'done');
    }
  }, [pushToast]);

  const setHorizon = useCallback((projectId: string, horizon: Horizon) => {
    setProjects((current) => current.map((p) => (p.id === projectId ? { ...p, horizon } : p)));
  }, []);

  /** Planner moves: a day offset, Today, or no date at all. */
  const plan = useCallback((item: Item, where: 'today' | 'tomorrow' | 'week' | 'later' | 'unplanned') => {
    const change: Partial<Item> = {
      today: where === 'today' ? true : undefined,
      due: where === 'tomorrow' ? 1 : where === 'week' ? 2 : where === 'later' ? 7 : undefined,
    };
    patch(item.id, change);
    markFresh(item.id);
  }, [markFresh]);

  const toggleSubItem = useCallback((itemId: string, subId: string) => {
    setItems((current) => current.map((item) => item.id !== itemId ? item : {
      ...item,
      subItems: item.subItems?.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)),
    }));
  }, []);

  /** Captured text is stored in the language it was typed in: the original. */
  const capture = useCallback((title: string, category: Category, owner: Owner, today: boolean, lang: Lang) => {
    const id = `new-${nextId++}`;
    setItems((current) => [{ id, title: { [lang]: title }, origin: lang, category, owner, done: false, today: today || undefined, created: { en: 'Just now', fr: 'À l\'instant' } }, ...current]);
    markFresh(id);
  }, [markFresh]);

  /**
   * An owner edits text in the language on screen. That language becomes the
   * original; the other language is dropped and shows as pending until a
   * translator fills it. The showcase has no translator.
   */
  const editText = useCallback((item: Item, changes: { title?: string; nextStep?: string }, lang: Lang) => {
    patch(item.id, {
      origin: lang,
      edited: true,
      title: changes.title !== undefined ? { [lang]: changes.title } : { [lang]: item.title[lang] ?? item.title[item.origin] },
      nextStep: changes.nextStep !== undefined ? (changes.nextStep ? { [lang]: changes.nextStep } : undefined) : item.nextStep ? { [lang]: item.nextStep[lang] ?? item.nextStep[item.origin] } : undefined,
    });
  }, []);

  // Questions. Each action takes the card away with the same sequence as a tick.
  const removeQuestion = useCallback((question: Question, label: ToastEntry['label'], noun: ToastState['noun']) => {
    if (phases[question.id]) return;
    runLeave(question.id, () => setQuestions((current) => current.filter((q) => q.id !== question.id)));
    pushToast({
      label,
      undo: () => restore(question.id, () => setQuestions((current) => (current.some((q) => q.id === question.id) ? current : [...current, question].sort((a, b) => QUESTIONS.indexOf(a) - QUESTIONS.indexOf(b))))),
    }, noun);
  }, [phases, pushToast, restore, runLeave]);

  const answer = useCallback((question: Question, option: Text) =>
    removeQuestion(question, (t, lang) => t.answered(str(option, question.origin, lang)), 'answered'), [removeQuestion]);
  const reject = useCallback((question: Question) => removeQuestion(question, (t) => t.rejected, 'other'), [removeQuestion]);
  const snoozeQuestion = useCallback((question: Question) => removeQuestion(question, (t) => t.snoozed, 'other'), [removeQuestion]);
  const reply = useCallback((question: Question) => removeQuestion(question, (t) => t.replied(question.askedBy), 'answered'), [removeQuestion]);

  const triage = useCallback((item: Item, to: DevState) => {
    if (phases[item.id]) return;
    const apply = (state: DevState) => setItems((current) => current.map((i) => (i.id === item.id ? {
      ...i,
      devState: state,
      executor: state === 'flight' ? i.loggedBy : i.executor,
      stage: state === 'flight' ? 'accepted' : i.stage,
    } : i)));
    runLeave(item.id, () => apply(to));
    pushToast({
      label: (t, lang) => {
        const title = str(item.title, item.origin, lang);
        return to === 'flight' ? t.accepted(title) : to === 'declined' ? t.declined(title) : t.snoozedDev(title);
      },
      undo: () => restore(item.id, () => apply('triage')),
    }, 'other');
  }, [phases, pushToast, restore, runLeave]);

  useEffect(() => () => {
    Object.keys(timers.current).forEach(clearTimers);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  return {
    items, projects, questions, phases, fresh, toast, sent,
    complete, reopen, setProjectStatus, setHorizon, plan, toggleSubItem, capture, editText,
    answer, reject, snoozeQuestion, reply, triage,
    undoToast, pauseToast,
  };
}

export type TaskStore = ReturnType<typeof useTaskStore>;
