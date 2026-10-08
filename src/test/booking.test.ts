import { describe, expect, it } from 'vitest';
import { defaultSchedule, earliestSlot, earlierAlternative, paginate, basePractitioners, type DemoData } from '@/lib/demo-data';

const from = new Date(2026, 9, 12, 7, 0); // lundi
const empty: DemoData = { practitioners: basePractitioners, patients: [], appointments: [], documents: [], notes: [] };

describe('prise de rendez-vous', () => {
  it('le premier créneau libre respecte les horaires', () => {
    expect(earliestSlot(from, defaultSchedule('x'), [], 45)?.getHours()).toBe(8);
  });
  it('propose un autre praticien disponible plus tôt pour la même prestation', () => {
    const later = new Date(2026, 9, 14, 10, 0);
    const alt = earlierAlternative(empty, 'Bilan initial', 'p-denis', later, from);
    expect(alt).not.toBeNull();
    expect(alt!.practitioner.id).not.toBe('p-denis');
    expect(alt!.start < later).toBe(true);
  });
  it('aucune alternative si personne d’autre ne propose la prestation', () => {
    expect(earlierAlternative(empty, 'Ostéopathie nourrisson', 'p-amelie', null, from)).toBeNull();
  });
  it('pagination : 10 lignes par page', () => {
    const p = paginate(Array.from({ length: 23 }, (_, i) => i), 3, 10);
    expect(p.pages).toBe(3);
    expect(p.rows).toEqual([20, 21, 22]);
  });
});
