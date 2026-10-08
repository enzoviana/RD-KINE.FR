// Données fictives pour la présentation de l'espace cabinet. Aucune donnée réelle.
export type DemoPractitioner = { id: string; firstName: string; lastName: string; job: string; email: string; phone: string; color: string; active: boolean; hasAccount: boolean };
export type DemoPatient = { id: string; firstName: string; lastName: string; birthDate: string; phone: string; email: string; address: string; practitionerId: string; reason: string; status: 'Nouveau' | 'En cours' | 'Terminé'; sessionsPlanned: number; createdAt: string };
export type DemoAppointment = { id: string; patientId: string; practitionerId: string; start: string; minutes: number; type: string; status: 'Confirmé' | 'Effectué' | 'Annulé' };
export type DemoDocument = { id: string; patientId: string; name: string; kind: 'Ordonnance' | 'Bilan' | 'Imagerie' | 'Compte rendu'; date: string; size: string };
export type DemoNote = { id: string; patientId: string; practitionerId: string; date: string; text: string };
export type DemoData = { practitioners: DemoPractitioner[]; patients: DemoPatient[]; appointments: DemoAppointment[]; documents: DemoDocument[]; notes: DemoNote[] };

export const SESSION_MINUTES = 45;
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;

const COLORS: string[] = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
const colorAt = (i: number) => COLORS[i % COLORS.length]!;

export const basePractitioners: DemoPractitioner[] = [
  { id: 'p-denis', firstName: 'Denis', lastName: 'Roux', job: 'Masseur-kinésithérapeute', email: 'denis@rd-kine.fr', phone: '06 12 34 56 01', color: colorAt(0), active: true, hasAccount: true },
  { id: 'p-caroline', firstName: 'Caroline', lastName: 'Dumas', job: 'Masseur-kinésithérapeute', email: 'caroline@rd-kine.fr', phone: '06 12 34 56 02', color: colorAt(1), active: true, hasAccount: true },
  { id: 'p-amelie', firstName: 'Amélie', lastName: 'Laurent', job: 'Ostéopathe', email: 'amelie@rd-kine.fr', phone: '06 12 34 56 03', color: colorAt(2), active: true, hasAccount: true },
  { id: 'p-lucas', firstName: 'Lucas', lastName: 'Martin', job: 'Psychomotricien', email: 'lucas@rd-kine.fr', phone: '06 12 34 56 04', color: colorAt(3), active: true, hasAccount: false },
];

const FIRST = ['Julie', 'Marc', 'Sophie', 'Thomas', 'Nadia', 'Hugo', 'Camille', 'Paul', 'Léa', 'Karim', 'Emma', 'Louis', 'Inès', 'Antoine', 'Chloé', 'Mehdi', 'Manon', 'Jules', 'Sarah', 'Victor', 'Alice', 'Nathan', 'Zoé', 'Bruno'];
const LAST = ['Bernard', 'Petit', 'Moreau', 'Lefèvre', 'Garcia', 'Fontaine', 'Girard', 'Mercier', 'Blanc', 'Chevalier', 'Robin', 'Faure', 'Henry', 'Perrin', 'Morel', 'Leroy'];
const REASONS = ['Rééducation genou (LCA)', 'Lombalgie chronique', 'Entorse de cheville', 'Épaule — tendinopathie', 'Cervicalgie', 'Rééducation post-opératoire hanche', 'Kiné respiratoire', 'Rééducation périnéale', 'Troubles posturaux', 'Sciatique'];
const TYPES = ['Séance de rééducation', 'Bilan initial', 'Suivi', 'Séance d’ostéopathie', 'Bilan de fin de traitement'];
const NOTE_TEXTS = ['Bonne progression, amplitude articulaire en hausse.', 'Douleur 3/10 en fin de séance. Exercices à domicile revus.', 'Renforcement quadriceps débuté, tolérance correcte.', 'Patient motivé, objectifs à 4 semaines fixés.', 'Légère inflammation, adaptation du protocole.', 'Reprise de la course envisagée dans 3 semaines.'];

function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const pick = <T,>(r: () => number, list: T[]) => list[Math.floor(r() * list.length)]!;
const iso = (d: Date) => d.toISOString();
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
export function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
export function startOfWeek(d: Date) { const x = startOfDay(d); const shift = (x.getDay() + 6) % 7; return addDays(x, -shift); }
export function weekDays(d: Date) { const s = startOfWeek(d); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }
export function monthGrid(d: Date) { const first = new Date(d.getFullYear(), d.getMonth(), 1); const s = startOfWeek(first); return Array.from({ length: 42 }, (_, i) => addDays(s, i)); }
export function sameDay(a: Date, b: Date) { return dayKey(a) === dayKey(b); }
export { dayKey };

export function buildDemo(today: Date, practitioners: DemoPractitioner[] = basePractitioners): DemoData {
  const r = rng(2026);
  const t0 = startOfDay(today);
  const patients: DemoPatient[] = Array.from({ length: 36 }, (_, i) => {
    const pr = practitioners[i % practitioners.length]!;
    const firstName = FIRST[i % FIRST.length]!, lastName = LAST[(i * 7) % LAST.length]!;
    const year = 1950 + Math.floor(r() * 60);
    return {
      id: `pat-${i + 1}`, firstName, lastName,
      birthDate: `${year}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-${String(1 + Math.floor(r() * 28)).padStart(2, '0')}`,
      phone: `06 ${String(10 + i).padStart(2, '0')} ${String(Math.floor(r() * 90) + 10)} ${String(Math.floor(r() * 90) + 10)} ${String(Math.floor(r() * 90) + 10)}`,
      email: `${firstName}.${lastName}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '@exemple.fr',
      address: `${1 + Math.floor(r() * 80)} rue ${pick(r, ['de la Gare', 'des Lilas', 'Jean Jaurès', 'du Moulin', 'Pasteur'])}, 91580 Étréchy`,
      practitionerId: pr.id, reason: pick(r, REASONS),
      status: i % 9 === 0 ? 'Nouveau' : i % 5 === 0 ? 'Terminé' : 'En cours',
      sessionsPlanned: 10 + Math.floor(r() * 3) * 5,
      createdAt: iso(addDays(t0, -10 - Math.floor(r() * 80))),
    };
  });

  const appointments: DemoAppointment[] = [];
  const slotsPerDay = Math.floor(((DAY_END_HOUR - DAY_START_HOUR) * 60) / SESSION_MINUTES);
  for (let offset = -56; offset <= 35; offset++) {
    const day = addDays(t0, offset);
    if (day.getDay() === 0) continue;
    for (const pr of practitioners) {
      const mine = patients.filter(p => p.practitionerId === pr.id);
      if (!mine.length) continue;
      const count = day.getDay() === 6 ? 2 + Math.floor(r() * 2) : 4 + Math.floor(r() * 5);
      const taken = new Set<number>();
      const maxSlot = day.getDay() === 6 ? Math.floor((4 * 60) / SESSION_MINUTES) : slotsPerDay;
      while (taken.size < Math.min(count, maxSlot)) taken.add(Math.floor(r() * maxSlot));
      for (const s of [...taken].sort((a, b) => a - b)) {
        const start = new Date(day); start.setHours(DAY_START_HOUR, s * SESSION_MINUTES, 0, 0);
        const past = start < today;
        appointments.push({
          id: `rdv-${appointments.length + 1}`, patientId: pick(r, mine).id, practitionerId: pr.id,
          start: iso(start), minutes: SESSION_MINUTES, type: pick(r, TYPES),
          status: past ? (r() < 0.08 ? 'Annulé' : 'Effectué') : 'Confirmé',
        });
      }
    }
  }

  for (const p of patients) {
    const n = appointments.filter(a => a.patientId === p.id && a.status !== 'Annulé').length;
    p.sessionsPlanned = Math.max(p.sessionsPlanned, Math.ceil((n + 2) / 5) * 5);
  }

  const documents: DemoDocument[] = [];
  const notes: DemoNote[] = [];
  patients.forEach((p, i) => {
    const created = new Date(p.createdAt);
    documents.push({ id: `doc-${i}-1`, patientId: p.id, name: `Ordonnance — ${p.reason}.pdf`, kind: 'Ordonnance', date: iso(created), size: '182 Ko' });
    documents.push({ id: `doc-${i}-2`, patientId: p.id, name: 'Bilan diagnostic kinésithérapique.pdf', kind: 'Bilan', date: iso(addDays(created, 2)), size: '348 Ko' });
    if (i % 3 === 0) documents.push({ id: `doc-${i}-3`, patientId: p.id, name: 'IRM — compte rendu radiologue.pdf', kind: 'Imagerie', date: iso(addDays(created, -5)), size: '1,2 Mo' });
    if (p.status === 'Terminé') documents.push({ id: `doc-${i}-4`, patientId: p.id, name: 'Compte rendu de fin de traitement.pdf', kind: 'Compte rendu', date: iso(addDays(t0, -3)), size: '96 Ko' });
    for (let n = 0; n < 3; n++) notes.push({ id: `note-${i}-${n}`, patientId: p.id, practitionerId: p.practitionerId, date: iso(addDays(created, 3 + n * 9)), text: NOTE_TEXTS[(i + n) % NOTE_TEXTS.length]! });
  });

  return { practitioners, patients, appointments, documents, notes };
}

/** Restreint les données à un praticien (son espace) ; null = vue cabinet complète. */
export function scopeData(data: DemoData, practitionerId: string | null): DemoData {
  if (!practitionerId) return data;
  const patients = data.patients.filter(p => p.practitionerId === practitionerId);
  const ids = new Set(patients.map(p => p.id));
  return {
    practitioners: data.practitioners.filter(p => p.id === practitionerId),
    patients,
    appointments: data.appointments.filter(a => a.practitionerId === practitionerId),
    documents: data.documents.filter(d => ids.has(d.patientId)),
    notes: data.notes.filter(n => ids.has(n.patientId)),
  };
}

export function upcoming(data: DemoData, now: Date, limit = 6) {
  return data.appointments.filter(a => a.status === 'Confirmé' && new Date(a.start) >= now).sort((a, b) => a.start.localeCompare(b.start)).slice(0, limit);
}

export function weeklyActivity(data: DemoData, today: Date, weeks = 8) {
  const current = startOfWeek(today);
  return Array.from({ length: weeks }, (_, i) => {
    const from = addDays(current, (i - weeks + 1) * 7), to = addDays(from, 7);
    const list = data.appointments.filter(a => { const d = new Date(a.start); return d >= from && d < to; });
    return { week: `${from.getDate()}/${from.getMonth() + 1}`, seances: list.filter(a => a.status !== 'Annulé').length, annulations: list.filter(a => a.status === 'Annulé').length };
  });
}

export type NewAccountInput = { firstName: string; lastName: string; email: string; phone: string; job: string };
export function createPractitionerAccount(input: NewAccountInput, existing: DemoPractitioner[]): { ok: true; practitioner: DemoPractitioner; tempPassword: string } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!input.firstName.trim() || !input.lastName.trim()) return { ok: false, error: 'Prénom et nom obligatoires' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Adresse e-mail invalide' };
  if (existing.some(p => p.email.toLowerCase() === email)) return { ok: false, error: 'Un compte existe déjà avec cet e-mail' };
  const practitioner: DemoPractitioner = {
    id: `p-${Date.now().toString(36)}`, firstName: input.firstName.trim(), lastName: input.lastName.trim(), email, phone: input.phone.trim(),
    job: input.job.trim() || 'Masseur-kinésithérapeute', color: colorAt(existing.length), active: true, hasAccount: true,
  };
  const tempPassword = `RDK-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  return { ok: true, practitioner, tempPassword };
}

export const fullName = (p: { firstName: string; lastName: string }) => `${p.firstName} ${p.lastName}`;
export function age(birth: string, today: Date) { const b = new Date(birth); let a = today.getFullYear() - b.getFullYear(); if (today < new Date(today.getFullYear(), b.getMonth(), b.getDate())) a--; return a; }

// ——— Services, disponibilités et profil praticien (démo) ———
export type DemoService = { id: string; practitionerId: string; name: string; minutes: number; description: string };
export type DaySchedule = { day: number; enabled: boolean; start: string; end: string; breakStart: string; breakEnd: string };
export type DemoSchedule = { practitionerId: string; days: DaySchedule[]; bufferMinutes: number };
export type DemoProfile = { practitionerId: string; photo: string; title: string; bio: string };

export const WEEKDAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function defaultServices(p: DemoPractitioner): DemoService[] {
  const osteo = /ost[ée]o/i.test(p.job);
  const list = osteo
    ? [['Consultation d’ostéopathie', 45, 'Bilan et traitement manuel global.'], ['Ostéopathie nourrisson', 30, 'Séance douce adaptée aux tout-petits.']]
    : [['Bilan initial', 45, 'Évaluation complète et définition des objectifs.'], ['Séance de rééducation', 45, 'Rééducation personnalisée selon prescription.'], ['Suivi', 30, 'Point d’étape et ajustement des exercices.']];
  return list.map(([name, minutes, description], i) => ({ id: `svc-${p.id}-${i}`, practitionerId: p.id, name: name as string, minutes: minutes as number, description: description as string }));
}

export function defaultSchedule(practitionerId: string): DemoSchedule {
  return { practitionerId, bufferMinutes: 0, days: [0, 1, 2, 3, 4, 5, 6].map(day => ({ day, enabled: day >= 1 && day <= 5 || day === 6, start: '08:00', end: day === 6 ? '12:00' : '20:00', breakStart: day === 6 ? '' : '12:30', breakEnd: day === 6 ? '' : '13:30' })) };
}

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return (h ?? 0) * 60 + (m ?? 0); };
const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Heures de début possibles pour une prestation, selon les horaires, la pause et le temps entre rendez-vous. */
export function freeStarts(date: Date, schedule: DemoSchedule, booked: { start: string; minutes: number }[], minutes: number, step = 15): string[] {
  const day = schedule.days.find(d => d.day === date.getDay());
  if (!day || !day.enabled) return [];
  const buf = schedule.bufferMinutes;
  const busy = booked.filter(a => sameDay(new Date(a.start), date)).map(a => { const s = new Date(a.start); const m = s.getHours() * 60 + s.getMinutes(); return [m - buf, m + a.minutes + buf] as const; });
  if (day.breakStart && day.breakEnd) busy.push([toMin(day.breakStart), toMin(day.breakEnd)]);
  const out: string[] = [];
  for (let m = toMin(day.start); m + minutes <= toMin(day.end); m += step) {
    if (!busy.some(([a, b]) => m < b && m + minutes > a)) out.push(toHHMM(m));
  }
  return out;
}

/** Premier horaire libre d'un praticien pour une durée donnée, à partir de `from`. */
export function earliestSlot(from: Date, schedule: DemoSchedule, booked: { start: string; minutes: number }[], minutes: number, horizonDays = 30): Date | null {
  for (let i = 0; i < horizonDays; i++) {
    const day = addDays(startOfDay(from), i);
    for (const t of freeStarts(day, schedule, booked, minutes)) {
      const [h, m] = t.split(':').map(Number); const d = new Date(day); d.setHours(h!, m!, 0, 0);
      if (d > from) return d;
    }
  }
  return null;
}

/** Autre praticien proposant la même prestation (même nom) avec un créneau plus tôt que `than`. */
export function earlierAlternative(data: DemoData, serviceName: string, currentPid: string, than: Date | null, from: Date) {
  let best: { practitioner: DemoPractitioner; service: DemoService; start: Date } | null = null;
  for (const p of data.practitioners) {
    if (p.id === currentPid || !p.active) continue;
    const service = defaultServices(p).find(s => s.name === serviceName);
    if (!service) continue;
    const start = earliestSlot(from, defaultSchedule(p.id), data.appointments.filter(a => a.practitionerId === p.id && a.status !== 'Annulé'), service.minutes);
    if (start && (!than || start < than) && (!best || start < best.start)) best = { practitioner: p, service, start };
  }
  return best;
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), pages);
  return { pages, current, rows: items.slice((current - 1) * perPage, current * perPage) };
}
