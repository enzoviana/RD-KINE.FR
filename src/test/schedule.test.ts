import { describe, expect, it } from 'vitest';
import { freeStarts, defaultSchedule, type DemoSchedule } from '@/lib/demo-data';

const monday = new Date(2026, 9, 12);
const base: DemoSchedule = { practitionerId: 'x', bufferMinutes: 0, days: defaultSchedule('x').days.map(d => ({ ...d, start: '09:00', end: '12:00', breakStart: '', breakEnd: '' })) };

describe('ouverture du calendrier', () => {
  it('aucun créneau un jour non travaillé', () => {
    expect(freeStarts(new Date(2026, 9, 11), base, [], 45)).toEqual([]);
  });
  it('la prestation doit finir avant la fin de journée', () => {
    const s = freeStarts(monday, base, [], 45);
    expect(s[0]).toBe('09:00');
    expect(s.at(-1)).toBe('11:15');
  });
  it('la pause bloque les créneaux', () => {
    const s = freeStarts(monday, { ...base, days: base.days.map(d => ({ ...d, breakStart: '10:00', breakEnd: '10:30' })) }, [], 30);
    expect(s).not.toContain('10:00');
    expect(s).toContain('10:30');
    expect(s).not.toContain('09:45');
  });
  it('le temps entre rendez-vous est respecté', () => {
    const booked = [{ start: new Date(2026, 9, 12, 10, 0).toISOString(), minutes: 45 }];
    const s = freeStarts(monday, { ...base, bufferMinutes: 15 }, booked, 30);
    expect(s).not.toContain('09:30');
    expect(s).toContain('09:15');
    expect(s).not.toContain('10:45');
    expect(s).toContain('11:00');
  });
});
