import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { basePractitioners, buildDemo, defaultSchedule, defaultServices, type DemoAppointment, type DemoData, type DemoNote, type DemoPractitioner, type DemoProfile, type DemoSchedule, type DemoService } from '@/lib/demo-data';

type Extras = { practitioners: DemoPractitioner[]; notes: DemoNote[]; hidden: string[]; appointments: DemoAppointment[]; services: Record<string, DemoService[]>; schedules: Record<string, DemoSchedule>; profiles: Record<string, DemoProfile> };
type Store = {
  data: DemoData; viewAs: string; setViewAs: (id: string) => void;
  addPractitioner: (p: DemoPractitioner) => void; toggleActive: (id: string) => void; addNote: (n: Omit<DemoNote, 'id' | 'date'>) => void;
  addAppointment: (a: Omit<DemoAppointment, 'id' | 'status'>) => void;
  services: (pid: string) => DemoService[]; saveServices: (pid: string, list: DemoService[]) => void;
  schedule: (pid: string) => DemoSchedule; saveSchedule: (s: DemoSchedule) => void;
  profile: (pid: string) => DemoProfile; saveProfile: (p: DemoProfile) => void;
};
const Ctx = createContext<Store | null>(null);
const KEY = 'rdk-demo-v1';
const emptyExtras: Extras = { practitioners: [], notes: [], hidden: [], appointments: [], services: {}, schedules: {}, profiles: {} };

export function DemoProvider({ children }: { children: ReactNode }) {
  const [extras, setExtras] = useState<Extras>(emptyExtras);
  const [viewAs, setViewAsState] = useState(basePractitioners[0]!.id);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const v = JSON.parse(raw); setExtras({ ...emptyExtras, ...(v.extras ?? {}) }); if (v.viewAs) setViewAsState(v.viewAs); } } catch { /* démo */ }
  }, []);
  const persist = (e: Extras, v: string) => { try { localStorage.setItem(KEY, JSON.stringify({ extras: e, viewAs: v })); } catch { /* photo trop lourde, démo */ } };
  const data = useMemo(() => {
    const pros = [...basePractitioners, ...extras.practitioners].map(p => ({ ...p, active: !extras.hidden.includes(p.id) }));
    const d = buildDemo(new Date(), pros);
    return { ...d, notes: [...d.notes, ...extras.notes], appointments: [...d.appointments, ...extras.appointments] };
  }, [extras]);
  const update = (fn: (e: Extras) => Extras) => setExtras(prev => { const next = fn(prev); persist(next, viewAs); return next; });
  const proById = (pid: string) => data.practitioners.find(p => p.id === pid);
  const store: Store = {
    data, viewAs,
    setViewAs: id => { setViewAsState(id); persist(extras, id); },
    addPractitioner: p => update(e => ({ ...e, practitioners: [...e.practitioners, p] })),
    toggleActive: id => update(e => ({ ...e, hidden: e.hidden.includes(id) ? e.hidden.filter(x => x !== id) : [...e.hidden, id] })),
    addNote: n => update(e => ({ ...e, notes: [...e.notes, { ...n, id: `note-x-${Date.now()}`, date: new Date().toISOString() }] })),
    addAppointment: a => update(e => ({ ...e, appointments: [...e.appointments, { ...a, id: `rdv-x-${Date.now()}`, status: 'Confirmé' }] })),
    services: pid => extras.services[pid] ?? (proById(pid) ? defaultServices(proById(pid)!) : []),
    saveServices: (pid, list) => update(e => ({ ...e, services: { ...e.services, [pid]: list } })),
    schedule: pid => extras.schedules[pid] ?? defaultSchedule(pid),
    saveSchedule: s => update(e => ({ ...e, schedules: { ...e.schedules, [s.practitionerId]: s } })),
    profile: pid => extras.profiles[pid] ?? { practitionerId: pid, photo: '', title: proById(pid)?.job ?? '', bio: '' },
    saveProfile: p => update(e => ({ ...e, profiles: { ...e.profiles, [p.practitionerId]: p } })),
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useDemo() { const v = useContext(Ctx); if (!v) throw new Error('DemoProvider manquant'); return v; }
