import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NewAppointment } from './new-appointment';
import { addDays, monthGrid, sameDay, startOfDay, weekDays, fullName, DAY_START_HOUR, DAY_END_HOUR, type DemoAppointment, type DemoData } from '@/lib/demo-data';

type Mode = 'jour' | 'semaine' | 'mois';
const HOUR_PX = 64;
const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);
const t = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function Agenda({ data }: { data: DemoData }) {
  const [mode, setMode] = useState<Mode>('semaine');
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [filter, setFilter] = useState<string[]>([]);
  const [open, setOpen] = useState<DemoAppointment | null>(null);
  const pros = data.practitioners;
  const visible = useMemo(() => data.appointments.filter(a => a.status !== 'Annulé' && (!filter.length || filter.includes(a.practitionerId))), [data, filter]);
  const on = (d: Date) => visible.filter(a => sameDay(new Date(a.start), d)).sort((a, b) => a.start.localeCompare(b.start));
  const color = (id: string) => pros.find(p => p.id === id)?.color ?? 'var(--primary)';
  const patient = (id: string) => data.patients.find(p => p.id === id);
  const move = (dir: number) => setCursor(c => mode === 'jour' ? addDays(c, dir) : mode === 'semaine' ? addDays(c, 7 * dir) : new Date(c.getFullYear(), c.getMonth() + dir, 1));
  const days: Date[] = mode === 'jour' ? [cursor] : weekDays(cursor);
  const first = days[0]!, last = days[days.length - 1]!;
  const label = mode === 'mois' ? cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : mode === 'jour' ? cursor.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : `${first.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${last.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  const today = new Date();

  const Event = ({ a, compact }: { a: DemoAppointment; compact?: boolean }) => {
    const p = patient(a.patientId);
    const d = new Date(a.start), top = ((d.getHours() - DAY_START_HOUR) * 60 + d.getMinutes()) / 60 * HOUR_PX;
    return <button type="button" onClick={() => setOpen(a)} className="absolute inset-x-1 overflow-hidden rounded-lg border-l-4 bg-card px-2 py-1 text-left text-xs shadow-sm transition hover:shadow-md" style={{ top, height: a.minutes / 60 * HOUR_PX - 3, borderLeftColor: color(a.practitionerId), background: `color-mix(in oklab, ${color(a.practitionerId)} 12%, var(--card))` }}>
      <p className="truncate font-semibold">{p && fullName(p)}</p>{!compact && <p className="truncate text-muted-foreground">{t(a.start)} · {a.type}</p>}
    </button>;
  };

  return <div className="grid gap-4">
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1"><Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Période précédente"><ChevronLeft/></Button><Button variant="outline" onClick={() => setCursor(startOfDay(new Date()))}>Aujourd’hui</Button><Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Période suivante"><ChevronRight/></Button></div>
      <h2 className="text-lg font-semibold first-letter:uppercase">{label}</h2>
      <ToggleGroup type="single" value={mode} onValueChange={v => v && setMode(v as Mode)} variant="outline" className="ml-auto">{(['jour', 'semaine', 'mois'] as Mode[]).map(m => <ToggleGroupItem key={m} value={m} className="px-4 capitalize">{m}</ToggleGroupItem>)}</ToggleGroup>
      <NewAppointment data={data} defaultDate={cursor < startOfDay(new Date()) ? startOfDay(new Date()) : cursor} />
    </div>
    {pros.length > 1 && <div className="flex flex-wrap gap-2">{pros.map(p => { const active = !filter.length || filter.includes(p.id); return <button key={p.id} type="button" onClick={() => setFilter(f => f.includes(p.id) ? f.filter(x => x !== p.id) : [...f, p.id])} className={cn('flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition', active ? 'bg-card' : 'opacity-45')}><span className="size-2.5 rounded-full" style={{ background: p.color }}/>{fullName(p)}</button>; })}</div>}

    {mode === 'mois' ? <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} className="py-2">{d}</div>)}</div>
      <div className="grid grid-cols-7">{monthGrid(cursor).map(d => { const list = on(d); const out = d.getMonth() !== cursor.getMonth(); return <div key={d.toISOString()} className={cn('min-h-28 border-b border-r p-1.5 text-left', out && 'bg-muted/30 text-muted-foreground')}>
        <button type="button" onClick={() => { setCursor(d); setMode('jour'); }} className={cn('mb-1 grid size-7 place-items-center rounded-full text-xs font-medium hover:bg-accent', sameDay(d, today) && 'bg-primary text-primary-foreground')}>{d.getDate()}</button>
        <div className="grid gap-0.5">{list.slice(0, 3).map(a => <button key={a.id} type="button" onClick={() => setOpen(a)} className="flex items-center gap-1 truncate rounded px-1 text-left text-[11px] hover:bg-accent"><span className="size-1.5 shrink-0 rounded-full" style={{ background: color(a.practitionerId) }}/>{t(a.start)} {patient(a.patientId)?.lastName}</button>)}{list.length > 3 && <span className="px-1 text-[11px] text-muted-foreground">+{list.length - 3} autres</span>}</div>
      </div>; })}</div>
    </div> : <div className="overflow-auto rounded-2xl border bg-card">
      <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))` }}>
        <div className="sticky top-0 z-10 border-b bg-card"/>
        {days.map(d => <div key={d.toISOString()} className="sticky top-0 z-10 border-b border-l bg-card py-2 text-center"><p className="text-xs uppercase text-muted-foreground">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</p><p className={cn('mx-auto mt-0.5 grid size-8 place-items-center rounded-full text-sm font-semibold', sameDay(d, today) && 'bg-primary text-primary-foreground')}>{d.getDate()}</p></div>)}
        <div>{hours.map(h => <div key={h} className="relative text-right text-[11px] text-muted-foreground" style={{ height: HOUR_PX }}><span className="absolute top-0.5 right-2">{h}:00</span></div>)}</div>
        {days.map(d => <div key={d.toISOString()} className="relative border-l" style={{ height: hours.length * HOUR_PX }}>
          {hours.map(h => <div key={h} className="border-b border-dashed border-border/70" style={{ height: HOUR_PX }}/>)}
          {on(d).map(a => <Event key={a.id} a={a} compact={mode === 'semaine' && days.length > 1 && false}/>)}
          {sameDay(d, today) && today.getHours() >= DAY_START_HOUR && today.getHours() < DAY_END_HOUR && <div className="pointer-events-none absolute inset-x-0 z-[5] h-0.5 bg-destructive" style={{ top: ((today.getHours() - DAY_START_HOUR) * 60 + today.getMinutes()) / 60 * HOUR_PX }}/>}
        </div>)}
      </div>
    </div>}

    <Dialog open={!!open} onOpenChange={v => !v && setOpen(null)}><DialogContent>{open && (() => { const p = patient(open.patientId), pr = pros.find(x => x.id === open.practitionerId); return <>
      <DialogHeader><DialogTitle>{p && fullName(p)}</DialogTitle><DialogDescription>{new Date(open.start).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {t(open.start)} – {t(new Date(new Date(open.start).getTime() + open.minutes * 60000).toISOString())}</DialogDescription></DialogHeader>
      <dl className="grid gap-3 text-sm">{[['Type', open.type], ['Praticien', pr ? fullName(pr) : '—'], ['Motif', p?.reason ?? '—'], ['Téléphone', p?.phone ?? '—']].map(([k, v]) => <div key={k} className="grid grid-cols-[110px_1fr]"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}<div className="grid grid-cols-[110px_1fr]"><dt className="text-muted-foreground">Statut</dt><dd><Badge variant="secondary">{open.status}</Badge></dd></div></dl>
    </>; })()}</DialogContent></Dialog>
  </div>;
}
