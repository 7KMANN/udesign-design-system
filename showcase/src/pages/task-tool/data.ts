// Fake data for the task tool scenario. Generic wording only: no real client,
// supplier, price or surname. "Today" in this mock is Monday 16 November.
//
// Content is written once, in the language of the session that wrote it
// (`origin`), then translated once and stored. A field with only its origin
// language is a translation still pending.

export type Lang = 'en' | 'fr';
export type Text = Partial<Record<Lang, string>>;
export type Category = 'day' | 'business' | 'ideas' | 'dev';
export type Owner = 'Kaleb' | 'Jules' | 'Both';
export type Executor = 'KASPER' | 'AETHER' | 'Koda';
export type ProjectStatus = 'Not started' | 'Working' | 'Stuck' | 'Done';
export type Horizon = 'Now' | 'Next' | 'Later';
export type DevState = 'flight' | 'triage' | 'shipped' | 'declined' | 'snoozed';
export type Stage = 'building' | 'review' | 'waitingKaleb' | 'backup' | 'drafting' | 'accepted';

const L = (en?: string, fr?: string): Text => ({ ...(en ? { en } : {}), ...(fr ? { fr } : {}) });

export interface SubItem {
  id: string;
  title: Text;
  done: boolean;
}

export interface Item {
  id: string;
  title: Text;
  origin: Lang;
  category: Category;
  owner: Owner;
  done: boolean;
  /** Completed in this session, so it shows under "Done today". */
  doneNow?: boolean;
  /** Days from today. Negative is overdue. Absent: no date. */
  due?: number;
  /** Scheduled into Today by an owner. */
  today?: boolean;
  priority?: 'high';
  nextStep?: Text;
  notes?: Text;
  subItems?: SubItem[];
  code?: string;
  executor?: Executor;
  devState?: DevState;
  stage?: Stage;
  loggedBy?: Executor;
  projectId?: string;
  projectStatus?: ProjectStatus;
  when?: Text;
  created?: Text;
  /** The owner edited it here; the note says so. */
  edited?: boolean;
}

export interface Project {
  id: string;
  title: Text;
  origin: Lang;
  category: Category;
  owner: Owner;
  horizon: Horizon;
  summary?: Text;
}

export interface Question {
  id: string;
  askedBy: Executor;
  category: Category;
  origin: Lang;
  about?: Text;
  question: Text;
  options: { label: Text; recommended?: boolean }[];
  owner: Owner;
}

export interface ShippedEntry {
  id: string;
  day: 'today' | 'yesterday' | 'earlier';
  origin: Lang;
  sentence: Text;
  code: string;
  executor: Executor;
  time: Text;
}

const FILM_EN = 'We are down to the last roll of the matte film and two gang sheet orders land Wednesday. Order four rolls of the same matte film we used in October, not the glossy one: the glossy batch curled on the press. Ask for delivery by Tuesday at the latest. If the usual supplier is out, the second supplier carries the same film under another name; check the thickness on the spec sheet before ordering.';
const FILM_FR = 'Il nous reste le dernier rouleau de film mat et deux commandes de gang sheets rentrent mercredi. Commande quatre rouleaux du même film mat qu\'en octobre, pas le lustré : le lot lustré a gondolé sur la presse. Demande une livraison mardi au plus tard. Si le fournisseur habituel est en rupture, le deuxième fournisseur a le même film sous un autre nom; vérifie l\'épaisseur sur la fiche technique avant de commander.';
const LEASE_FR = 'Le bail actuel finit à la fin février et le propriétaire veut une réponse d\'ici vendredi. L\'offre de renouvellement est sur trois ans, avec une hausse chaque année. Avant de répondre, compare avec un renouvellement court d\'un an, le temps de trouver un local plus grand pour la deuxième brodeuse. Jules a les mesures du plancher; il faut qu\'on soit tous les deux dans la même pièce une demi-heure pour trancher.';
const LEASE_EN = 'The current lease ends at the end of February and the landlord wants an answer by Friday. The renewal offer is for three years, with an increase every year. Before answering, compare it with a short one-year renewal while we find a bigger space for the second embroidery machine. Jules has the floor measurements; we need both of us in the same room for half an hour to decide.';

export const ITEMS: Item[] = [
  // Everyday tasks, open
  { id: 't1', origin: 'en', title: L('Order DTF film', 'Commander du film DTF'), category: 'day', owner: 'Kaleb', done: false, today: true, priority: 'high', nextStep: L(FILM_EN, FILM_FR), created: L('Nov 12', '12 nov.'), subItems: [
    { id: 't1a', title: L('Check the thickness on the spec sheet', 'Vérifier l\'épaisseur sur la fiche technique'), done: true },
    { id: 't1b', title: L('Order the four rolls', 'Commander les quatre rouleaux'), done: false },
    { id: 't1c', title: L('Forward the confirmation to Jules', 'Transférer la confirmation à Jules'), done: false },
  ] },
  { id: 't2', origin: 'fr', title: L('Call the embroidery partner about cap pricing', 'Appeler le brodeur partenaire pour le prix des casquettes'), category: 'business', owner: 'Kaleb', done: false, due: -3, nextStep: L('Last time they quoted per piece without the setup fee. Ask for the full price at 24, 48 and 96 caps, setup included, and whether they can hold a slot for the team order in December.', 'La dernière fois, ils ont donné un prix à l\'unité sans les frais de montage. Demande le prix complet pour 24, 48 et 96 casquettes, montage inclus, et s\'ils peuvent nous garder une place en décembre pour la commande d\'équipe.'), created: L('Nov 9', '9 nov.') },
  { id: 't3', origin: 'en', title: L('Restock black and white thread', 'Remettre du fil noir et blanc en stock'), category: 'day', owner: 'Kaleb', done: false, today: true, created: L('Nov 14', '14 nov.') },
  { id: 't4', origin: 'en', title: L('Clean the heat press platen', 'Nettoyer le plateau de la presse à chaud'), category: 'day', owner: 'Kaleb', done: false, today: true },
  { id: 't5', origin: 'fr', title: L('Decide on the lease renewal', 'Décider pour le renouvellement du bail'), category: 'business', owner: 'Both', done: false, due: -1, priority: 'high', nextStep: L(LEASE_EN, LEASE_FR), created: L('Nov 2', '2 nov.'), subItems: [
    { id: 't5a', title: L('Read the renewal offer', 'Lire l\'offre de renouvellement'), done: true },
    { id: 't5b', title: L('Compare with a one-year renewal', 'Comparer avec un renouvellement d\'un an'), done: false },
    { id: 't5c', title: L('Answer the landlord', 'Répondre au propriétaire'), done: false },
  ] },
  { id: 't6', origin: 'fr', title: L('Reply to the school about hoodie sizes', 'Répondre à l\'école pour les grandeurs de kangourous'), category: 'day', owner: 'Jules', done: false, today: true, nextStep: L('They asked whether the youth sizes run small. Send the size chart and offer to drop off a sample kit on Thursday.', 'Ils veulent savoir si les grandeurs jeunesse taillent petit. Envoie le tableau des grandeurs et offre d\'aller porter une trousse d\'échantillons jeudi.') },
  { id: 't7', origin: 'en', title: L('Book the courier pickup for Tuesday', 'Réserver la cueillette du transporteur pour mardi'), category: 'day', owner: 'Jules', done: false, today: true },
  { id: 't8', origin: 'fr', title: L('Count the blank tees on the back shelf', 'Compter les t-shirts vierges sur l\'étagère du fond'), category: 'day', owner: 'Jules', done: false, due: -4 },
  { id: 't9', origin: 'en', title: L('Replace the needles on head 3', 'Changer les aiguilles de la tête 3'), category: 'day', owner: 'Kaleb', done: false, due: 1 },
  { id: 't10', origin: 'en', title: L('Renew the business insurance', 'Renouveler l\'assurance de l\'entreprise'), category: 'business', owner: 'Jules', done: false, due: 4 },
  { id: 't11', origin: 'en', title: L('Review the quarterly taxes with the accountant', 'Revoir les taxes du trimestre avec notre comptable'), category: 'business', owner: 'Kaleb', done: false, due: 8, notes: L('Bring the expense list from the shared folder and the two missing receipts.', 'Apporter la liste des dépenses du dossier partagé et les deux reçus manquants.') },
  { id: 't12', origin: 'fr', title: L('Ask two suppliers for headwear catalogs', 'Demander des catalogues de casquettes à deux fournisseurs'), category: 'business', owner: 'Jules', done: false, today: true },
  // Translation pending: written in French a minute ago, no English yet.
  { id: 't13', origin: 'fr', title: L(undefined, 'Faire un échantillon de casquette en broderie 3D'), category: 'ideas', owner: 'Kaleb', done: false, notes: L(undefined, 'Essayer la mousse de 3 mm en premier. Si ça tire dans la courbe, essayer un devant plus plat.') },
  { id: 't14', origin: 'en', title: L('Try glow ink transfers on a hoodie', 'Essayer les transferts à encre phosphorescente sur un kangourou'), category: 'ideas', owner: 'Jules', done: false },
  { id: 't15', origin: 'fr', title: L('Loyalty card for returning teams', 'Carte fidélité pour les équipes qui reviennent'), category: 'ideas', owner: 'Both', done: false, priority: 'high' },
  { id: 't16', origin: 'en', title: L('Photo shoot for the blanks catalog', 'Séance photo pour le catalogue de vêtements vierges'), category: 'ideas', owner: 'Jules', done: false, due: 10 },
  { id: 't17', origin: 'en', title: L('Update the patch price sheet', 'Mettre à jour la grille de prix des écussons'), category: 'business', owner: 'Kaleb', done: false, today: true },
  { id: 't18', origin: 'en', title: L('Print a gang sheet test on the new film', 'Imprimer une gang sheet test sur le nouveau film'), category: 'day', owner: 'Kaleb', done: false, due: 1 },
  { id: 't19', origin: 'en', title: L('Empty the lint trap on the dryer', 'Vider le filtre à charpie de la sécheuse'), category: 'day', owner: 'Kaleb', done: false, due: -1 },

  // Done already, for the Done groups
  { id: 'd1', origin: 'en', title: L('Wipe down the embroidery hoops', 'Essuyer les cerceaux de broderie'), category: 'day', owner: 'Kaleb', done: true },
  { id: 'd2', origin: 'fr', title: L('Send the invoice reminders', 'Envoyer les rappels de factures'), category: 'business', owner: 'Jules', done: true },
  { id: 'd3', origin: 'en', title: L('Sketch a new hang tag layout', 'Esquisser une nouvelle étiquette volante'), category: 'ideas', owner: 'Kaleb', done: true },
  { id: 'd4', origin: 'en', title: L('Order shipping boxes', 'Commander des boîtes d\'expédition'), category: 'day', owner: 'Jules', done: true },

  // Project tasks
  { id: 'p1a', origin: 'fr', projectId: 'p1', title: L('Shortlist hoodie blanks for teams', 'Présélectionner des kangourous vierges pour les équipes'), category: 'business', owner: 'Jules', done: false, projectStatus: 'Working', when: L('Nov 20', '20 nov.') },
  { id: 'p1b', origin: 'fr', projectId: 'p1', title: L('Sizing kit for coaches', 'Trousse de grandeurs pour les entraîneurs'), category: 'business', owner: 'Kaleb', done: false, projectStatus: 'Not started', when: L('Nov 24', '24 nov.') },
  { id: 'p1c', origin: 'fr', projectId: 'p1', title: L('Order the sample run', 'Commander la série d\'échantillons'), category: 'business', owner: 'Kaleb', done: false, projectStatus: 'Stuck', when: L('Now', 'Maintenant'), nextStep: L('Waiting for the hoodie shortlist. Nothing to order until Jules picks the two blanks.', 'On attend la présélection de kangourous. Rien à commander tant que Jules n\'a pas choisi les deux modèles.') },
  { id: 'p1d', origin: 'fr', projectId: 'p1', title: L('Photograph the samples', 'Photographier les échantillons'), category: 'business', owner: 'Jules', done: false, projectStatus: 'Not started', when: L('Next', 'Ensuite') },
  { id: 'p1e', origin: 'fr', projectId: 'p1', title: L('Write the team order guide', 'Rédiger le guide de commande pour les équipes'), category: 'business', owner: 'Jules', done: true, projectStatus: 'Done', when: L('Nov 10', '10 nov.') },
  { id: 'p2a', origin: 'en', projectId: 'p2', title: L('Pick three cap styles', 'Choisir trois modèles de casquettes'), category: 'business', owner: 'Jules', done: true, projectStatus: 'Done', when: L('Nov 6', '6 nov.') },
  { id: 'p2b', origin: 'en', projectId: 'p2', title: L('Test patch placement on curved fronts', 'Tester le placement des écussons sur les devants courbés'), category: 'business', owner: 'Kaleb', done: false, projectStatus: 'Working', when: L('Nov 19', '19 nov.') },
  { id: 'p2c', origin: 'en', projectId: 'p2', title: L('Set the embroidered cap tiers', 'Fixer les paliers des casquettes brodées'), category: 'business', owner: 'Both', done: false, projectStatus: 'Not started', when: L('Dec 1', '1er déc.') },
  { id: 'p2d', origin: 'en', projectId: 'p2', title: L('Order six sample caps', 'Commander six casquettes d\'échantillon'), category: 'business', owner: 'Jules', done: false, projectStatus: 'Not started', when: L('Next', 'Ensuite') },
  { id: 'p3a', origin: 'en', projectId: 'p3', title: L('Rewrite the embroidery page', 'Réécrire la page broderie'), category: 'business', owner: 'Kaleb', done: false, projectStatus: 'Not started', when: L('Later', 'Plus tard') },
  { id: 'p3b', origin: 'en', projectId: 'p3', title: L('New photos for the DTF page', 'Nouvelles photos pour la page DTF'), category: 'business', owner: 'Jules', done: false, projectStatus: 'Not started', when: L('Later', 'Plus tard') },
  { id: 'p3c', origin: 'en', projectId: 'p3', title: L('Add the quote request form', 'Ajouter le formulaire de demande de soumission'), category: 'business', owner: 'Kaleb', done: false, projectStatus: 'Working', when: L('Jan', 'janv.') },
  { id: 'p4a', origin: 'en', projectId: 'p4', title: L('Today view and one-line capture', 'Vue Aujourd\'hui et saisie en une ligne'), category: 'dev', owner: 'Kaleb', done: false, projectStatus: 'Working', when: L('Nov 21', '21 nov.') },
  { id: 'p4b', origin: 'en', projectId: 'p4', title: L('Dev triage lane', 'Voie de triage dev'), category: 'dev', owner: 'Kaleb', done: false, projectStatus: 'Working', when: L('Nov 21', '21 nov.') },
  { id: 'p4c', origin: 'en', projectId: 'p4', title: L('Category colors in the design system', 'Couleurs de catégories dans le système de design'), category: 'dev', owner: 'Kaleb', done: false, projectStatus: 'Stuck', when: L('Now', 'Maintenant'), nextStep: L('Waiting for the owner to approve the task tool scenario in the showcase.', 'On attend que le propriétaire approuve le scénario de l\'outil de tâches dans la vitrine.') },
  { id: 'p4d', origin: 'en', projectId: 'p4', title: L('Weekly review on mobile', 'Revue hebdomadaire sur mobile'), category: 'dev', owner: 'Both', done: false, projectStatus: 'Not started', when: L('Later', 'Plus tard') },

  // Dev work, in flight
  { id: 'e1', origin: 'en', code: 'ECH-311', title: L('Fix the calculator rounding so gang sheet totals match the invoice line', 'Corriger l\'arrondi du calculateur pour que le total des gang sheets égale la ligne de facture'), category: 'dev', owner: 'Kaleb', executor: 'KASPER', devState: 'flight', stage: 'building', done: false, nextStep: L('The calculator rounds each line to the cent and then adds them, so a 40-line gang sheet can drift by a few cents from the invoice. KASPER is switching to rounding the final total only, and is waiting on your answer in Today before merging.', 'Le calculateur arrondit chaque ligne au cent, puis les additionne : une gang sheet de 40 lignes peut donc s\'écarter de quelques cents de la facture. KASPER passe à un seul arrondi sur le total final et attend ta réponse dans Aujourd\'hui avant de fusionner.'), created: L('Nov 13', '13 nov.') },
  { id: 'e2', origin: 'en', code: 'ECH-305', title: L('Move notification sending onto the queue worker so a slow send never blocks a page', 'Passer l\'envoi des notifications par la file d\'attente pour qu\'un envoi lent ne bloque jamais une page'), category: 'dev', owner: 'Kaleb', executor: 'KASPER', devState: 'flight', stage: 'review', done: false },
  { id: 'e3', origin: 'en', code: 'ECH-318', title: L('Add one-line capture to Today with list and owner shortcuts', 'Ajouter la saisie en une ligne dans Aujourd\'hui, avec raccourcis de liste et de responsable'), category: 'dev', owner: 'Kaleb', executor: 'KASPER', devState: 'flight', stage: 'building', done: false },
  { id: 'e4', origin: 'en', code: 'ECH-299', title: L('Rebuild the nightly stats rollup so yesterday shows on the morning dashboard', 'Refaire le cumul des statistiques de nuit pour que la veille paraisse au tableau de bord du matin'), category: 'dev', owner: 'Kaleb', executor: 'AETHER', devState: 'flight', stage: 'waitingKaleb', done: false, nextStep: L('AETHER has the new rollup running on the test copy. It needs a yes before it replaces the live job tonight.', 'AETHER fait rouler le nouveau cumul sur la copie de test. Il lui faut un oui avant de remplacer la tâche en production ce soir.') },
  // Translation pending: logged in English, French not ready yet.
  { id: 'e5', origin: 'en', code: 'ECH-320', title: L('Back up the database volumes to the second drive every night'), category: 'dev', owner: 'Jules', executor: 'AETHER', devState: 'flight', stage: 'backup', done: false },
  { id: 'e6', origin: 'fr', code: 'ECH-322', title: L('Draft the supplier follow-up emails for the headwear catalogs', 'Rédiger les courriels de relance aux fournisseurs pour les catalogues de casquettes'), category: 'dev', owner: 'Jules', executor: 'Koda', devState: 'flight', stage: 'drafting', done: false },

  // Dev work, logged by agents, waiting for triage
  { id: 'r1', origin: 'en', code: 'ECH-324', title: L('Closing the peek sheet reloads the whole list even when nothing changed', 'Fermer l\'aperçu recharge toute la liste même quand rien n\'a changé'), category: 'dev', owner: 'Kaleb', loggedBy: 'AETHER', devState: 'triage', done: false, nextStep: L('Seen during the visual audit: every close triggers two full scans. Suggests skipping the reload when the item was not edited.', 'Vu pendant l\'audit visuel : chaque fermeture lance deux balayages complets. Suggestion : sauter le rechargement quand l\'élément n\'a pas été modifié.') },
  { id: 'r2', origin: 'en', code: 'ECH-325', title: L('Supplier scraper misses colors listed in a second table', 'Le moissonneur fournisseur rate les couleurs listées dans un deuxième tableau'), category: 'dev', owner: 'Kaleb', loggedBy: 'KASPER', devState: 'triage', done: false },
  { id: 'r3', origin: 'fr', code: 'ECH-326', title: L('French labels on the production calculator', 'Libellés en français dans le calculateur de production'), category: 'dev', owner: 'Jules', loggedBy: 'Koda', devState: 'triage', done: false },
  { id: 'r4', origin: 'en', code: 'ECH-327', title: L('Login page shows the wrong theme for one frame', 'La page de connexion affiche le mauvais thème pendant une image'), category: 'dev', owner: 'Kaleb', loggedBy: 'KASPER', devState: 'triage', done: false },
];

export const PROJECTS: Project[] = [
  { id: 'p1', origin: 'fr', title: L('Spring team-wear season', 'Saison des vêtements d\'équipe du printemps'), category: 'business', owner: 'Kaleb', horizon: 'Now', summary: L('Have samples, sizing kits and the order guide ready before coaches plan their spring uniforms.', 'Avoir les échantillons, les trousses de grandeurs et le guide de commande prêts avant que les entraîneurs planifient leurs uniformes du printemps.') },
  { id: 'p4', origin: 'en', title: L('ECHELON v2', 'ECHELON v2'), category: 'dev', owner: 'Kaleb', horizon: 'Now', summary: L('The task tool the owners actually want to open every morning.', 'L\'outil de tâches que les propriétaires ont vraiment envie d\'ouvrir chaque matin.') },
  { id: 'p2', origin: 'en', title: L('Headwear line', 'Gamme de casquettes'), category: 'business', owner: 'Jules', horizon: 'Next', summary: L('Three cap styles with embroidered and patch options.', 'Trois modèles de casquettes, en broderie ou avec écusson.') },
  { id: 'p3', origin: 'en', title: L('Website refresh', 'Refonte du site web'), category: 'business', owner: 'Both', horizon: 'Later' },
];

export const QUESTIONS: Question[] = [
  { id: 'q1', askedBy: 'KASPER', category: 'dev', origin: 'en', about: L('calculator rounding', 'l\'arrondi du calculateur'), question: L('Round only the final total, or keep rounding each line?', 'On arrondit seulement le total final, ou on garde l\'arrondi sur chaque ligne?'), options: [{ label: L('Round the total only', 'Arrondir le total seulement'), recommended: true }, { label: L('Keep rounding each line', 'Garder l\'arrondi par ligne') }], owner: 'Kaleb' },
  { id: 'q2', askedBy: 'Koda', category: 'business', origin: 'fr', about: L('the lease renewal', 'le renouvellement du bail'), question: L('The landlord wants an answer by Friday. Draft the reply letter now?', 'Le propriétaire veut une réponse d\'ici vendredi. Je prépare la lettre de réponse tout de suite?'), options: [{ label: L('Draft it now', 'Oui, prépare-la'), recommended: true }, { label: L('Wait until we decide', 'Attends qu\'on décide') }], owner: 'Both' },
  { id: 'q3', askedBy: 'AETHER', category: 'day', origin: 'en', about: L('film orders', 'les commandes de film'), question: L('Two film orders look like duplicates. Cancel the second one?', 'Deux commandes de film ont l\'air en double. J\'annule la deuxième?'), options: [{ label: L('Cancel the second', 'Annuler la deuxième'), recommended: true }, { label: L('Keep both', 'Garder les deux') }], owner: 'Jules' },
];

export const SHIPPED: ShippedEntry[] = [
  { id: 's1', day: 'today', origin: 'en', sentence: L('The Needs you count loads without waiting on linked records.', 'Le compteur « À répondre » se charge sans attendre les fiches liées.'), code: 'ECH-308', executor: 'KASPER', time: L('9:40', '9 h 40') },
  { id: 's2', day: 'today', origin: 'en', sentence: L('Maven restarted after the memory fix and reports healthy.', 'Maven a redémarré après le correctif de mémoire et se déclare en santé.'), code: 'ECH-301', executor: 'AETHER', time: L('7:15', '7 h 15') },
  { id: 's3', day: 'yesterday', origin: 'fr', sentence: L('November supplier receipts are filed and matched to expenses.', 'Les reçus fournisseurs de novembre sont classés et jumelés aux dépenses.'), code: 'ECH-297', executor: 'Koda', time: L('16:05', '16 h 05') },
  { id: 's4', day: 'yesterday', origin: 'en', sentence: L('Work rows no longer show the Stale badge twice.', 'Les lignes de travail n\'affichent plus deux fois le badge « Inactif ».'), code: 'ECH-140', executor: 'KASPER', time: L('11:30', '11 h 30') },
  { id: 's5', day: 'earlier', origin: 'en', sentence: L('The status page runs on the new worker.', 'La page d\'état roule sur le nouveau worker.'), code: 'ECH-288', executor: 'AETHER', time: L('Wed', 'mer.') },
];

export function ownedBy(scope: 'mine' | 'jules' | 'everyone', owner: Owner): boolean {
  if (scope === 'everyone') return true;
  if (owner === 'Both') return true;
  return scope === 'mine' ? owner === 'Kaleb' : owner === 'Jules';
}

/** Where an open everyday task sits in time. */
export type Bucket = 'overdue' | 'today' | 'tomorrow' | 'week' | 'later' | 'unplanned';
export function bucketOf(item: Item): Bucket {
  if (item.due !== undefined && item.due < 0) return 'overdue';
  if (item.today || item.due === 0) return 'today';
  if (item.due === 1) return 'tomorrow';
  if (item.due !== undefined && item.due <= 6) return 'week';
  if (item.due !== undefined) return 'later';
  return 'unplanned';
}
