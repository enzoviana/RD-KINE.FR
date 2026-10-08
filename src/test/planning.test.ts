import { describe, expect, it } from 'vitest';
import { buildSlots, durationMinutes } from '../lib/planning';

describe('Séances créées par le praticien', () => {
  it('respecte la durée choisie par le praticien (45 min)', () => {
    const [s] = buildSlots('2026-11-02', '09:00', 45, 1);
    expect(durationMinutes(s!.starts_at, s!.ends_at)).toBe(45);
  });
  it('enchaîne plusieurs séances sans chevauchement', () => {
    const slots = buildSlots('2026-11-02', '09:00', 30, 3);
    expect(slots).toHaveLength(3);
    expect(slots[1]!.starts_at).toBe(slots[0]!.ends_at);
    expect(slots[2]!.starts_at).toBe(slots[1]!.ends_at);
  });
  it('ne crée rien avec une durée nulle', () => {
    expect(buildSlots('2026-11-02', '09:00', 0, 2)).toEqual([]);
  });
});
