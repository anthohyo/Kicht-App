// Calcul des rappels d'échéances et échéances pré-remplies de l'agenda.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { prochaineOccurrence, planifierRappels, HORIZON_JOURS, MAX_RAPPELS } = require('../.test-build/src/utils/rappels.js');
const { STUDENT_DEADLINES } = require('../.test-build/src/data/agendaDefaults.js');

const jour = (a, m, j, h = 12) => new Date(a, m - 1, j, h);
const ymd = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

test('un événement « le 31 » tombe le dernier jour d\'un mois plus court', () => {
  assert.deepEqual(ymd(prochaineOccurrence(31, jour(2026, 9, 17))), [2026, 9, 30]);
  assert.deepEqual(ymd(prochaineOccurrence(31, jour(2027, 2, 10))), [2027, 2, 28]);
});

test('la prochaine occurrence passe au mois suivant une fois le jour dépassé', () => {
  assert.deepEqual(ymd(prochaineOccurrence(5, jour(2026, 9, 17))), [2026, 10, 5]);
  assert.deepEqual(ymd(prochaineOccurrence(17, jour(2026, 9, 17))), [2026, 9, 17]);
  assert.deepEqual(ymd(prochaineOccurrence(1, jour(2026, 12, 20))), [2027, 1, 1]);
});

test('un prélèvement est rappelé la veille à 18 h', () => {
  const loyer = { id: 'loyer', title: 'Loyer', emoji: '🏠', dayOfMonth: 5, amount: 520, category: 'loyer',
    isRecurring: true, isCustom: true, isPayment: true, paymentType: 'prelevement' };
  const [premier] = planifierRappels([loyer], jour(2026, 9, 17));
  assert.deepEqual(ymd(premier.quand), [2026, 10, 4]);
  assert.equal(premier.quand.getHours(), 18);
  assert.match(premier.corps, /520 €/);
});

test('une enveloppe budgétaire ne déclenche aucun rappel', () => {
  const courses = { id: 'courses', title: 'Budget courses', emoji: '🛒', dayOfMonth: 1, category: 'autre',
    isRecurring: true, isCustom: true, isPayment: true, paymentType: 'budget' };
  assert.equal(planifierRappels([courses], jour(2026, 9, 17)).length, 0);
});

test('une échéance datée est rappelée deux jours avant puis le jour même à 9 h', () => {
  const dossier = { id: 'visale', title: 'Dossier Visale', emoji: '🛡️', isoDate: '2026-10-10',
    category: 'deadline', isRecurring: false, isCustom: true };
  const rappels = planifierRappels([dossier], jour(2026, 9, 17));
  assert.deepEqual(rappels.map((r) => [...ymd(r.quand), r.quand.getHours()]), [[2026, 10, 8, 9], [2026, 10, 10, 9]]);
});

test('aucun rappel dans le passé ni au-delà de l\'horizon', () => {
  const maintenant = jour(2026, 9, 17);
  const evenements = [
    { id: 'passe', title: 'Passé', emoji: '📌', isoDate: '2026-09-01', category: 'autre', isRecurring: false, isCustom: true },
    { id: 'loin', title: 'Loin', emoji: '📌', isoDate: '2027-06-01', category: 'autre', isRecurring: false, isCustom: true },
  ];
  assert.equal(planifierRappels(evenements, maintenant).length, 0);
  const limite = maintenant.getTime() + HORIZON_JOURS * 24 * 3600 * 1000;
  const loyer = { id: 'l', title: 'Loyer', emoji: '🏠', dayOfMonth: 1, category: 'loyer', isRecurring: true, isCustom: true, isPayment: true, paymentType: 'prelevement' };
  for (const r of planifierRappels([loyer], maintenant)) {
    assert.ok(r.quand > maintenant && r.quand.getTime() <= limite);
  }
});

test('le nombre de rappels reste sous la limite du système', () => {
  const evenements = Array.from({ length: 120 }, (_, i) => ({
    id: `e${i}`, title: `Échéance ${i}`, emoji: '📌', isoDate: '2026-10-01', category: 'autre', isRecurring: false, isCustom: true,
  }));
  assert.ok(planifierRappels(evenements, jour(2026, 9, 17)).length <= MAX_RAPPELS);
});

test("l'agenda ne pré-remplit aucune échéance officielle sans source", () => {
  // Les dates officielles changent chaque année : une échéance pré-remplie doit être
  // future et citer sa source. Une date inventée ou passée est pire que pas de date.
  const aujourdHui = new Date();
  for (const e of STUDENT_DEADLINES) {
    assert.ok(e.source, `${e.id} : échéance pré-remplie sans source`);
    assert.ok(!e.isoDate || new Date(e.isoDate) >= aujourdHui, `${e.id} : échéance déjà passée`);
  }
});
