import * as React from 'react';
import type { Category, Horizon, Lang, ProjectStatus, Stage, Text } from './data';

// Interface labels in both languages. Content (titles, next steps) is not
// here: it lives on each item with its origin language.

const en = {
  today: 'Today',
  lists: 'Lists',
  planning: 'Planning',
  projects: 'Projects',
  dev: 'Dev',
  cat: { day: 'Day-to-day', business: 'Business', ideas: 'Ideas', dev: 'Dev' } as Record<Category, string>,
  toSort: (n: number) => `${n} to sort`,
  scope: { mine: 'Mine', jules: 'Jules', everyone: 'Everyone' },
  whose: 'Whose tasks',
  addToday: 'Add a task for today',
  addTo: (list: string) => `Add to ${list}`,
  addTask: 'Add a task',
  waiting: 'Waiting on you',
  devQuestions: 'Dev questions',
  asks: (who: string) => `Question from ${who}`,
  /** Text around the bold asker name: [before, after]. */
  askParts: (about?: string): [string, string] => ['', about ? ` asks about ${about}` : ' asks'],
  recommended: 'Recommended',
  more: 'More',
  moreFor: (who: string) => `More answers for ${who}`,
  otherAnswers: 'Other answers',
  replyWords: 'Reply in words',
  reject: 'Reject the question',
  snoozeTomorrow: 'Snooze until tomorrow',
  send: 'Send',
  cancel: 'Cancel',
  replyTo: (who: string) => `Your answer for ${who}`,
  fromEarlier: 'From earlier',
  overdueN: (n: number) => `${n} overdue`,
  overdueOn: (d: string) => `Overdue, ${d}`,
  overdueSr: 'Overdue, was due ',
  devLine: (a: number, b: number) => `Dev: ${a} in flight, ${b} shipped today`,
  questionsWaiting: (n: number) => `${n} ${n === 1 ? 'question' : 'questions'} waiting on you`,
  clearToday: 'Today is clear.',
  clearTasks: "Today's tasks are done.",
  tomorrowHas: (n: number) => `Tomorrow has ${n} ${n === 1 ? 'task' : 'tasks'}. New tasks you add land here.`,
  nothingElse: 'Nothing else is scheduled. New tasks you add land here.',
  listClear: (l: string) => `${l} is clear.`,
  listClearDetail: 'Everything here is done. Add a task above when the next one comes up.',
  openN: (n: number) => `${n} open`,
  done: 'Done',
  doneLabel: (x: string) => `Done: ${x}`,
  tasksDone: (n: number) => `${n} tasks done`,
  answered: (x: string) => `Answered: ${x}`,
  questionsAnswered: (n: number) => `${n} questions answered`,
  rejected: 'Question rejected',
  snoozed: 'Snoozed until tomorrow',
  replied: (who: string) => `Reply sent to ${who}`,
  changes: (n: number) => `${n} changes`,
  undo: 'Undo',
  undoAll: (n: number) => `Undo all ${n}`,
  savedNote: 'Sent when this closes',
  accepted: (x: string) => `Accepted: ${x}`,
  declined: (x: string) => `Declined: ${x}`,
  snoozedDev: (x: string) => `Snoozed: ${x}`,
  projectsSub: 'Bigger work, broken into tasks',
  byProject: 'By project',
  byHorizon: 'Now, next, later',
  groupBy: 'Group by',
  horizon: { Now: 'Now', Next: 'Next', Later: 'Later' } as Record<Horizon, string>,
  status: { 'Not started': 'Not started', Working: 'Working', Stuck: 'Stuck', Done: 'Done' } as Record<ProjectStatus, string>,
  col: { task: 'Task', status: 'Status', owner: 'Owner', when: 'When', project: 'Project', progress: 'Progress' },
  progress: (d: number, n: number, s: number) => `${d} of ${n} done${s ? `, ${s} stuck` : ''}`,
  details: 'Details',
  detailsFor: (x: string) => `Details for ${x}`,
  horizonFor: (x: string) => `Horizon for ${x}`,
  devIntro: 'Work done by KASPER, AETHER and Koda. Only their questions for you reach Today.',
  devViews: 'Dev views',
  devTabs: { flight: 'In flight', triage: 'Triage', shipped: 'Shipped' },
  from: (who: string) => `from ${who}`,
  accept: 'Accept',
  decline: 'Decline',
  snooze: 'Snooze',
  triageClear: 'Triage is clear.',
  triageClearDetail: 'Agents log new work here. Nothing reaches your lists until you accept it.',
  shippedDays: { today: 'Today', yesterday: 'Yesterday', earlier: 'Earlier this week' },
  stage: { building: 'Building', review: 'In review', waitingKaleb: 'Waiting on Kaleb', backup: 'Running first backup', drafting: 'Drafting', accepted: 'Accepted, not started' } as Record<Stage, string>,
  nextStep: 'Next step',
  goal: 'Goal',
  notes: 'Notes',
  steps: (d: number, n: number) => `Steps, ${d} of ${n} done`,
  tasksOf: (d: number, n: number) => `Tasks, ${d} of ${n} done`,
  close: 'Close details',
  completed: 'Completed',
  highPriority: 'High priority',
  both: 'Kaleb and Jules',
  project: 'Project',
  field: { code: 'Code', owner: 'Owner', doneBy: 'Done by', loggedBy: 'Logged by', when: 'When', added: 'Added' },
  // Origin and translation
  langName: { en: 'English', fr: 'French' } as Record<Lang, string>,
  original: (l: Lang) => `Original, written in ${l === 'en' ? 'English' : 'French'}`,
  translatedFrom: (l: Lang) => `Translated from ${l === 'en' ? 'English' : 'French'}`,
  showingOriginal: (l: Lang) => `Showing the ${l === 'en' ? 'English' : 'French'} original`,
  showOriginal: 'Show original',
  showTranslation: 'Show translation',
  pending: (l: Lang) => `Written in ${l === 'en' ? 'English' : 'French'}. Translation pending.`,
  editedPending: (l: Lang) => `You edited this in ${l === 'en' ? 'English' : 'French'}, so it is now the original. Translation pending.`,
  editedDone: (l: Lang) => `Edited in ${l === 'en' ? 'English' : 'French'}, now the original`,
  edit: 'Edit',
  save: 'Save',
  editTitle: 'Title',
  // Planner route
  views: 'Views',
  view: { week: 'Week', roadmap: 'Roadmap', dev: 'Dev' },
  col4: { today: 'Today', tomorrow: 'Tomorrow', week: 'Later this week', later: 'Later', unplanned: 'Unplanned' },
  unplannedN: (n: number) => `Unplanned, ${n}`,
  showLists: 'Lists shown',
  moveTo: 'Move to',
  moveFor: (x: string) => `Move ${x}`,
  doneToday: 'Done today',
  nOfM: (d: number, n: number) => `${d} of ${n}`,
  nextUp: 'Next up',
  allDone: 'All tasks done',
  emptyDay: 'Nothing planned.',
  dropHere: 'Drop a task here',
  openChecklist: (x: string) => `Show tasks for ${x}`,
  questionN: (i: number, n: number) => `${i} of ${n}`,
  prevQ: 'Previous question',
  nextQ: 'Next question',
};

type Dict = typeof en;

const fr: Dict = {
  today: 'Aujourd\'hui',
  lists: 'Listes',
  planning: 'Planification',
  projects: 'Projets',
  dev: 'Dev',
  cat: { day: 'Quotidien', business: 'Affaires', ideas: 'Idées', dev: 'Dev' },
  toSort: (n) => `${n} à trier`,
  scope: { mine: 'Moi', jules: 'Jules', everyone: 'Tout le monde' },
  whose: 'Tâches de qui',
  addToday: 'Ajouter une tâche pour aujourd\'hui',
  addTo: (list) => `Ajouter à ${list}`,
  addTask: 'Ajouter une tâche',
  waiting: 'À répondre',
  devQuestions: 'Questions Dev',
  asks: (who) => `Question de ${who}`,
  askParts: (about) => ['Question de ', about ? ` sur ${about}` : ''],
  recommended: 'Recommandé',
  more: 'Plus',
  moreFor: (who) => `Autres réponses pour ${who}`,
  otherAnswers: 'Autres réponses',
  replyWords: 'Répondre par écrit',
  reject: 'Rejeter la question',
  snoozeTomorrow: 'Reporter à demain',
  send: 'Envoyer',
  cancel: 'Annuler',
  replyTo: (who) => `Ta réponse pour ${who}`,
  fromEarlier: 'En retard',
  overdueN: (n) => `${n} ${n === 1 ? 'tâche' : 'tâches'}`,
  overdueOn: (d) => `En retard, ${d}`,
  overdueSr: 'En retard, prévue ',
  devLine: (a, b) => `Dev : ${a} en cours, ${b} ${b === 1 ? 'livraison' : 'livraisons'} aujourd'hui`,
  questionsWaiting: (n) => `${n} ${n === 1 ? 'question attend' : 'questions attendent'} ta réponse`,
  clearToday: 'Rien d\'autre pour aujourd\'hui.',
  clearTasks: 'Les tâches du jour sont faites.',
  tomorrowHas: (n) => `Demain : ${n} ${n === 1 ? 'tâche' : 'tâches'}. Ce que tu ajoutes arrive ici.`,
  nothingElse: 'Rien d\'autre de prévu. Ce que tu ajoutes arrive ici.',
  listClear: (l) => `${l} : tout est fait.`,
  listClearDetail: 'Tout est fait ici. Ajoute la prochaine tâche au-dessus quand elle se présentera.',
  openN: (n) => `${n} à faire`,
  done: 'Faites',
  doneLabel: (x) => `Fait : ${x}`,
  tasksDone: (n) => `${n} tâches faites`,
  answered: (x) => `Répondu : ${x}`,
  questionsAnswered: (n) => `${n} questions répondues`,
  rejected: 'Question rejetée',
  snoozed: 'Reportée à demain',
  replied: (who) => `Réponse envoyée à ${who}`,
  changes: (n) => `${n} changements`,
  undo: 'Annuler',
  undoAll: (n) => `Tout annuler (${n})`,
  savedNote: 'Envoyé à la fermeture',
  accepted: (x) => `Accepté : ${x}`,
  declined: (x) => `Refusé : ${x}`,
  snoozedDev: (x) => `Reporté : ${x}`,
  projectsSub: 'Les gros dossiers, découpés en tâches',
  byProject: 'Par projet',
  byHorizon: 'Maintenant, ensuite, plus tard',
  groupBy: 'Regrouper par',
  horizon: { Now: 'Maintenant', Next: 'Ensuite', Later: 'Plus tard' },
  status: { 'Not started': 'Pas commencé', Working: 'En cours', Stuck: 'Bloqué', Done: 'Terminé' },
  col: { task: 'Tâche', status: 'Statut', owner: 'Responsable', when: 'Quand', project: 'Projet', progress: 'Avancement' },
  progress: (d, n, s) => `${d} ${d > 1 ? 'faites' : 'faite'} sur ${n}${s ? `, ${s} ${s > 1 ? 'bloquées' : 'bloquée'}` : ''}`,
  details: 'Détails',
  detailsFor: (x) => `Détails de ${x}`,
  horizonFor: (x) => `Horizon de ${x}`,
  devIntro: 'Le travail de KASPER, AETHER et Koda. Seules leurs questions pour toi se rendent dans Aujourd\'hui.',
  devViews: 'Vues dev',
  devTabs: { flight: 'En cours', triage: 'À trier', shipped: 'Livré' },
  from: (who) => `de ${who}`,
  accept: 'Accepter',
  decline: 'Refuser',
  snooze: 'Reporter',
  triageClear: 'Rien à trier.',
  triageClearDetail: 'Les agents déposent le nouveau travail ici. Rien n\'arrive dans tes listes avant que tu l\'acceptes.',
  shippedDays: { today: 'Aujourd\'hui', yesterday: 'Hier', earlier: 'Plus tôt cette semaine' },
  stage: { building: 'En développement', review: 'En révision', waitingKaleb: 'Attend Kaleb', backup: 'Première sauvegarde en cours', drafting: 'En rédaction', accepted: 'Accepté, pas commencé' },
  nextStep: 'Prochaine étape',
  goal: 'Objectif',
  notes: 'Notes',
  steps: (d, n) => `Étapes : ${d} ${d > 1 ? 'faites' : 'faite'} sur ${n}`,
  tasksOf: (d, n) => `Tâches : ${d} ${d > 1 ? 'faites' : 'faite'} sur ${n}`,
  close: 'Fermer les détails',
  completed: 'Terminée',
  highPriority: 'Priorité haute',
  both: 'Kaleb et Jules',
  project: 'Projet',
  field: { code: 'Code', owner: 'Responsable', doneBy: 'Fait par', loggedBy: 'Signalé par', when: 'Quand', added: 'Ajouté le' },
  langName: { en: 'anglais', fr: 'français' },
  original: (l) => `Original, rédigé en ${l === 'en' ? 'anglais' : 'français'}`,
  translatedFrom: (l) => `Traduit de l'${l === 'en' ? 'anglais' : 'français'}`,
  showingOriginal: (l) => `Original en ${l === 'en' ? 'anglais' : 'français'}`,
  showOriginal: 'Voir l\'original',
  showTranslation: 'Voir la traduction',
  pending: (l) => `Rédigé en ${l === 'en' ? 'anglais' : 'français'}. Traduction à venir.`,
  editedPending: (l) => `Tu l'as modifié en ${l === 'en' ? 'anglais' : 'français'} : c'est maintenant l'original. Traduction à venir.`,
  editedDone: (l) => `Modifié en ${l === 'en' ? 'anglais' : 'français'}, c'est maintenant l'original`,
  edit: 'Modifier',
  save: 'Enregistrer',
  editTitle: 'Titre',
  views: 'Vues',
  view: { week: 'Semaine', roadmap: 'Feuille de route', dev: 'Dev' },
  col4: { today: 'Aujourd\'hui', tomorrow: 'Demain', week: 'Plus tard cette semaine', later: 'Plus tard', unplanned: 'Non planifié' },
  unplannedN: (n) => `Non planifié, ${n}`,
  showLists: 'Listes affichées',
  moveTo: 'Déplacer vers',
  moveFor: (x) => `Déplacer ${x}`,
  doneToday: 'Fait aujourd\'hui',
  nOfM: (d, n) => `${d} sur ${n}`,
  nextUp: 'Prochaine',
  allDone: 'Toutes les tâches sont faites',
  emptyDay: 'Rien de prévu.',
  dropHere: 'Dépose une tâche ici',
  openChecklist: (x) => `Voir les tâches de ${x}`,
  questionN: (i, n) => `${i} sur ${n}`,
  prevQ: 'Question précédente',
  nextQ: 'Question suivante',
};

export const DICT: Record<Lang, Dict> = { en, fr };

export const LangContext = React.createContext<Lang>('en');
export const useLang = () => React.useContext(LangContext);
export const useT = () => DICT[useLang()];

/** Monday 16 November 2026. */
const TODAY = new Date(2026, 10, 16);

export function todayLabel(lang: Lang): string {
  const s = TODAY.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function dueLabel(offset: number, lang: Lang): string {
  const words = lang === 'fr'
    ? { 0: 'Aujourd\'hui', [-1]: 'Hier', 1: 'Demain' } as Record<number, string>
    : { 0: 'Today', [-1]: 'Yesterday', 1: 'Tomorrow' } as Record<number, string>;
  if (words[offset]) return words[offset];
  const date = new Date(TODAY);
  date.setDate(TODAY.getDate() + offset);
  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA';
  if (Math.abs(offset) < 7) return date.toLocaleDateString(locale, { weekday: 'short' });
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export interface Shown {
  text: string;
  /** Language of the text on screen, for the lang attribute. */
  lang: Lang;
  /** True when the text on screen is a translation. */
  translated: boolean;
  /** True when the reader's language is missing and the original is shown. */
  pending: boolean;
}

/** Picks the reader's language when it exists, else the original. */
export function pick(text: Text | undefined, origin: Lang, lang: Lang, forceOriginal = false): Shown | null {
  if (!text) return null;
  if (!forceOriginal && text[lang]) return { text: text[lang]!, lang, translated: lang !== origin, pending: false };
  const fallback = text[origin] ?? text[lang] ?? Object.values(text)[0];
  if (!fallback) return null;
  return { text: fallback, lang: text[origin] ? origin : lang, translated: false, pending: !forceOriginal && !text[lang] };
}

/** Plain string in the reader's language, falling back to the original. */
export function str(text: Text | undefined, origin: Lang, lang: Lang): string {
  return pick(text, origin, lang)?.text ?? '';
}

/** Content rendered with its language marked, so a screen reader pronounces it right. */
export function Content({ text, origin, className }: { text: Text | undefined; origin: Lang; className?: string }) {
  const lang = useLang();
  const shown = pick(text, origin, lang);
  if (!shown) return null;
  return React.createElement('span', { className, lang: shown.lang === lang ? undefined : shown.lang }, shown.text);
}
