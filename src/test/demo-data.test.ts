import { describe, expect, it } from 'vitest';
import { buildDemo, scopeData, monthGrid, weekDays, createPractitionerAccount, basePractitioners, upcoming } from '@/lib/demo-data';

const today = new Date(2026, 9, 8, 10, 0);
const data = buildDemo(today);

describe('données de démonstration', () => {
  it('un praticien ne voit que ses propres patients, rendez-vous et dossiers', () => {
    const s = scopeData(data, 'p-caroline');
    expect(s.patients.length).toBeGreaterThan(0);
    expect(s.patients.every(p => p.practitionerId === 'p-caroline')).toBe(true);
    expect(s.appointments.every(a => a.practitionerId === 'p-caroline')).toBe(true);
    const ids = new Set(s.patients.map(p => p.id));
    expect(s.documents.every(d => ids.has(d.patientId))).toBe(true);
  });
  it('aucun praticien n’a deux rendez-vous au même moment', () => {
    const keys = data.appointments.map(a => `${a.practitionerId}|${a.start}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('les séances durent 45 minutes', () => {
    expect(data.appointments.every(a => a.minutes === 45)).toBe(true);
  });
  it('les prochains rendez-vous sont futurs et confirmés', () => {
    expect(upcoming(data, today).every(a => new Date(a.start) >= today && a.status === 'Confirmé')).toBe(true);
  });
  it('le calendrier commence le lundi', () => {
    expect(monthGrid(today)).toHaveLength(42);
    expect(monthGrid(today)[0]!.getDay()).toBe(1);
    expect(weekDays(today)[0]!.getDay()).toBe(1);
  });
  it('refuse un compte praticien avec un e-mail déjà utilisé', () => {
    const r = createPractitionerAccount({ firstName: 'A', lastName: 'B', email: 'denis@rd-kine.fr', phone: '', job: '' }, basePractitioners);
    expect(r.ok).toBe(false);
  });
  it('crée un compte praticien avec mot de passe provisoire', () => {
    const r = createPractitionerAccount({ firstName: 'Marie', lastName: 'Noël', email: 'marie@rd-kine.fr', phone: '', job: 'Orthophoniste' }, basePractitioners);
    expect(r.ok && r.practitioner.hasAccount && r.tempPassword.length > 6).toBe(true);
  });
});
