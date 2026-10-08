// Outils de planning, sans dépendance au navigateur ni au serveur.
export type NewSlot = { starts_at: string; ends_at: string };

/** Génère `count` séances consécutives de `durationMin` minutes à partir de `date` + `time` (heure locale). */
export function buildSlots(date: string, time: string, durationMin: number, count: number): NewSlot[] {
  if (!date || !time || durationMin <= 0 || count <= 0) return [];
  const start = new Date(`${date}T${time}:00`);
  if (Number.isNaN(start.getTime())) return [];
  return Array.from({ length: count }, (_, i) => {
    const s = new Date(start.getTime() + i * durationMin * 60000);
    const e = new Date(s.getTime() + durationMin * 60000);
    return { starts_at: s.toISOString(), ends_at: e.toISOString() };
  });
}

export function durationMinutes(startsAt: string, endsAt: string) {
  return Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);
}

export const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function groupByDay<T extends { starts_at: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const k = new Date(it.starts_at).toDateString();
    map.set(k, [...(map.get(k) ?? []), it]);
  }
  return [...map.values()];
}
