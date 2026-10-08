import { Badge } from '@/components/ui/badge';
import { cabinet } from '@/lib/cabinet';
import { scopeData, fullName } from '@/lib/demo-data';
import { useMemo } from 'react';
import { useDemo } from './demo-store';
import { Dashboard } from './views/dashboard';
import { Agenda } from './views/agenda';
import { PatientsTable } from './views/patients';
import { Team } from './views/team';
import { Services, Availability, ProfileSettings } from './views/practice';

export type View = 'dashboard' | 'agenda' | 'patients' | 'praticiens' | 'dossiers' | 'parametres' | 'services' | 'disponibilites';
const titles: Record<View, string> = { dashboard: 'Dashboard', agenda: 'Agenda', patients: 'Patients', praticiens: 'Praticiens', dossiers: 'Dossiers patients', parametres: 'Paramètres', services: 'Mes prestations', disponibilites: 'Disponibilités' };

export function AdminWorkspace({ view, scope = 'admin' }: { view: View; scope?: 'admin' | 'praticien' }) {
  const { data, viewAs } = useDemo();
  const pid = scope === 'praticien' ? viewAs : null;
  const d = useMemo(() => scopeData(data, pid), [data, pid]);
  const me = pid ? data.practitioners.find(p => p.id === pid) : null;
  return <main className="admin-workspace">
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0"><p className="text-sm text-muted-foreground">{me ? `${fullName(me)} · ${me.job}` : 'Cabinet RD-Kiné'}</p><h1 className="truncate text-2xl sm:text-3xl">{titles[view]}</h1></div>
      <Badge variant="secondary" className="shrink-0">Démo</Badge>
    </div>
    <div className="mt-7">
      {view === 'dashboard' && <Dashboard data={d} all={data} scoped={!!pid} />}
      {view === 'agenda' && <Agenda data={d} />}
      {view === 'patients' && <PatientsTable data={d} mode="patients" />}
      {view === 'dossiers' && <PatientsTable data={d} mode="dossiers" />}
      {view === 'praticiens' && <Team />}
      {view === 'services' && pid && <Services pid={pid} />}
      {view === 'disponibilites' && pid && <Availability pid={pid} />}
      {view === 'parametres' && pid && <ProfileSettings pid={pid} />}
      {view === 'parametres' && !pid && <section className="max-w-2xl rounded-2xl border bg-card p-6"><h2 className="text-lg">Informations du cabinet</h2><dl className="mt-4 divide-y divide-border">{[{ label: 'Cabinet', value: 'RD-Kiné' }, { label: 'Adresse', value: `${cabinet.address}, ${cabinet.postal}` }, { label: 'Téléphone', value: cabinet.phone }, { label: 'Horaires', value: cabinet.hours }, { label: 'Durée de séance', value: '45 minutes' }].map(item => <div key={item.label} className="grid gap-2 py-4 sm:grid-cols-[160px_1fr]"><dt className="text-sm text-muted-foreground">{item.label}</dt><dd className="text-sm">{item.value}</dd></div>)}</dl></section>}
    </div>
  </main>;
}
