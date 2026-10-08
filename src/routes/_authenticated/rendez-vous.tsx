import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Check, Clock, Zap, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addDays, buildDemo, defaultSchedule, defaultServices, earliestSlot, earlierAlternative, freeStarts, fullName, sameDay, startOfDay, type DemoPractitioner, type DemoProfile, type DemoService } from '@/lib/demo-data';

export const Route = createFileRoute('/_authenticated/rendez-vous')({
  head: () => ({ meta: [
    { title: 'Prendre rendez-vous — RD-Kiné' },
    { name: 'description', content: 'Réservez votre séance en trois étapes : praticien, prestation puis date.' },
    { property: 'og:title', content: 'Prendre rendez-vous — RD-Kiné' },
    { property: 'og:description', content: 'Réservez votre séance au cabinet RD-Kiné en trois étapes.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Booking,
});

const BIOS: Record<string, string> = {
  'p-denis': 'Rééducation du sport et post-opératoire.',
  'p-caroline': 'Rééducation du dos et kinésithérapie respiratoire.',
  'p-amelie': 'Ostéopathie adulte et nourrisson.',
  'p-lucas': 'Psychomotricité de l’enfant.',
};
const steps = ['Praticien', 'Prestation', 'Date', 'Confirmation'];
const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const hm = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

function Booking() {
  const now = useMemo(() => new Date(), []);
  const demo = useMemo(() => buildDemo(now), [now]);
  const [profiles, setProfiles] = useState<Record<string, DemoProfile>>({});
  useEffect(() => { try { setProfiles(JSON.parse(localStorage.getItem('rdk-demo-v1') ?? '{}').extras?.profiles ?? {}); } catch { /* démo */ } }, []);
  const [step, setStep] = useState(0);
  const [pro, setPro] = useState<DemoPractitioner | null>(null);
  const [svc, setSvc] = useState<DemoService | null>(null);
  const [day, setDay] = useState(startOfDay(now));
  const [slot, setSlot] = useState<Date | null>(null);
  const pros = demo.practitioners.filter(p => p.active);
  const booked = (pid: string) => demo.appointments.filter(a => a.practitionerId === pid && a.status !== 'Annulé');
  const days = Array.from({ length: 21 }, (_, i) => addDays(startOfDay(now), i));
  const first = pro && svc ? earliestSlot(now, defaultSchedule(pro.id), booked(pro.id), svc.minutes) : null;
  const alt = pro && svc ? earlierAlternative(demo, svc.name, pro.id, first, now) : null;
  const times = pro && svc ? freeStarts(day, defaultSchedule(pro.id), booked(pro.id), svc.minutes).map(t => { const [h, m] = t.split(':').map(Number); const d = new Date(day); d.setHours(h!, m!, 0, 0); return d; }).filter(d => d > now) : [];
  const Avatar = ({ p, size = 'size-16' }: { p: DemoPractitioner; size?: string }) => profiles[p.id]?.photo
    ? <img src={profiles[p.id]!.photo} alt={`Photo de ${fullName(p)}`} className={cn(size, 'shrink-0 rounded-full object-cover')}/>
    : <span className={cn(size, 'grid shrink-0 place-items-center rounded-full text-lg font-semibold text-primary-foreground')} style={{ background: p.color }}>{p.firstName[0]}{p.lastName[0]}</span>;
  const chooseAlt = () => { if (!alt) return; setPro(alt.practitioner); setSvc(alt.service); setDay(startOfDay(alt.start)); setSlot(alt.start); setStep(3); };
  const pickFirst = () => { if (!first) return; setDay(startOfDay(first)); setSlot(first); setStep(3); };

  return <main className="container-site max-w-4xl py-8 md:py-14">
    <Link to="/espace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/>Mon espace</Link>
    <h1 className="mt-3 text-3xl md:text-4xl">Prendre rendez-vous</h1>
    <ol className="mt-6 grid grid-cols-4 gap-2">{steps.map((s, i) => <li key={s}><button type="button" disabled={i > step} onClick={() => setStep(i)} className="w-full text-left disabled:cursor-default"><span className={cn('block h-1.5 rounded-full', i <= step ? 'bg-primary' : 'bg-muted')}/><span className={cn('mt-2 block truncate text-xs sm:text-sm', i === step ? 'font-semibold' : 'text-muted-foreground')}>{i + 1}. {s}</span></button></li>)}</ol>

    {step === 0 && <section className="mt-8 grid gap-3 sm:grid-cols-2">{pros.map(p => <button key={p.id} type="button" onClick={() => { setPro(p); setSvc(null); setSlot(null); setStep(1); }} className={cn('flex items-center gap-4 rounded-2xl border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm', pro?.id === p.id && 'border-primary')}>
      <Avatar p={p}/><div className="min-w-0"><p className="font-semibold">{fullName(p)}</p><p className="text-sm text-primary">{profiles[p.id]?.title || p.job}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{profiles[p.id]?.bio || BIOS[p.id] || 'Praticien du cabinet RD-Kiné.'}</p></div>
    </button>)}</section>}

    {step === 1 && pro && <section className="mt-8"><div className="flex items-center gap-3"><Avatar p={pro} size="size-10"/><p className="text-sm">avec <span className="font-semibold">{fullName(pro)}</span></p></div>
      <div className="mt-5 grid gap-3">{defaultServices(pro).map(s => <button key={s.id} type="button" onClick={() => { setSvc(s); setSlot(null); setStep(2); }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card p-4 text-left transition hover:border-primary">
        <div className="min-w-0"><p className="font-semibold">{s.name}</p><p className="text-sm text-muted-foreground">{s.description}</p></div><span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary"><Clock size={14}/>{s.minutes} min</span>
      </button>)}</div></section>}

    {step === 2 && pro && svc && <section className="mt-8 grid gap-5">
      {first && <button type="button" onClick={pickFirst} className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left hover:border-primary"><CalendarCheck className="shrink-0 text-primary"/><span className="min-w-0 text-sm">Premier créneau avec {pro.firstName} : <span className="font-semibold first-letter:uppercase">{fmt(first)} à {hm(first)}</span></span></button>}
      {alt && <div className="grid gap-3 rounded-2xl border border-primary/30 bg-accent p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <Zap className="text-primary"/><p className="text-sm"><span className="font-semibold">{fullName(alt.practitioner)}</span> est disponible plus tôt pour « {svc.name} » : <span className="font-semibold">{fmt(alt.start)} à {hm(alt.start)}</span></p>
        <Button onClick={chooseAlt}>Choisir ce créneau</Button>
      </div>}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">{days.map(d => { const closed = !defaultSchedule(pro.id).days.find(x => x.day === d.getDay())?.enabled; return <button key={d.toISOString()} type="button" disabled={closed} onClick={() => { setDay(d); setSlot(null); }} className={cn('flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 text-sm transition disabled:opacity-35', sameDay(d, day) ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary')}><span className="text-xs capitalize">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</span><span className="text-lg font-semibold">{d.getDate()}</span><span className="text-[11px]">{d.toLocaleDateString('fr-FR', { month: 'short' })}</span></button>; })}</div>
      <div><h2 className="text-base font-semibold first-letter:uppercase">{fmt(day)}</h2>
        {times.length ? <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">{times.map(t => <Button key={t.toISOString()} variant={slot?.getTime() === t.getTime() ? 'default' : 'outline'} onClick={() => { setSlot(t); setStep(3); }}>{hm(t)}</Button>)}</div> : <p className="mt-2 text-sm text-muted-foreground">Aucun horaire disponible ce jour-là.</p>}
      </div>
    </section>}

    {step === 3 && pro && svc && slot && <section className="mt-8 max-w-lg rounded-3xl border bg-card p-6">
      <div className="flex items-center gap-4"><Avatar p={pro} size="size-14"/><div><p className="font-semibold">{fullName(pro)}</p><p className="text-sm text-muted-foreground">{pro.job}</p></div></div>
      <dl className="mt-5 grid gap-3 text-sm">{[['Prestation', `${svc.name} · ${svc.minutes} min`], ['Date', fmt(slot)], ['Heure', hm(slot)]].map(([k, v]) => <div key={k} className="grid grid-cols-[100px_1fr]"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium first-letter:uppercase">{v}</dd></div>)}</dl>
      <Button className="pill-button mt-6 w-full" onClick={() => { toast.success('Rendez-vous confirmé (démonstration).'); setStep(0); setPro(null); setSvc(null); setSlot(null); }}><Check/>Confirmer le rendez-vous</Button>
    </section>}
  </main>;
}
