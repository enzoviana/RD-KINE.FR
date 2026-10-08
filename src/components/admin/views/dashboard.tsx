import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { CalendarCheck, Users, Clock, TrendingDown } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { fmtTime, fmtDay } from '@/lib/planning';
import { fullName, startOfDay, addDays, upcoming, weeklyActivity, type DemoData } from '@/lib/demo-data';

const activityConfig = { seances: { label: 'Séances', color: 'var(--chart-1)' }, annulations: { label: 'Annulations', color: 'var(--chart-4)' } } satisfies ChartConfig;

export function Dashboard({ data, all, scoped }: { data: DemoData; all: DemoData; scoped: boolean }) {
  const now = new Date(), today = startOfDay(now), tomorrow = addDays(today, 1);
  const todays = data.appointments.filter(a => { const d = new Date(a.start); return d >= today && d < tomorrow && a.status !== 'Annulé'; });
  const week = data.appointments.filter(a => { const d = new Date(a.start); return d >= today && d < addDays(today, 7) && a.status === 'Confirmé'; });
  const past30 = data.appointments.filter(a => { const d = new Date(a.start); return d < now && d >= addDays(today, -30); });
  const cancelRate = past30.length ? Math.round((past30.filter(a => a.status === 'Annulé').length / past30.length) * 100) : 0;
  const activity = weeklyActivity(data, now);
  const next = upcoming(data, now, 7);
  const patient = (id: string) => all.patients.find(p => p.id === id);
  const pro = (id: string) => all.practitioners.find(p => p.id === id);

  const byPro = data.practitioners.map(p => ({ name: p.firstName, seances: data.appointments.filter(a => a.practitionerId === p.id && a.status === 'Effectué' && new Date(a.start) >= addDays(today, -30)).length, fill: p.color }));
  const proConfig = Object.fromEntries(data.practitioners.map(p => [p.firstName, { label: p.firstName, color: p.color }])) as ChartConfig;
  const reasons = Object.entries(data.patients.reduce<Record<string, number>>((acc, p) => { const k = p.reason.split(' ')[0] ?? p.reason; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, fill: `var(--chart-${i + 1})` }));
  const reasonConfig = Object.fromEntries(reasons.map(r => [r.name, { label: r.name, color: r.fill }])) as ChartConfig;

  const kpis = [
    { label: 'Rendez-vous aujourd’hui', value: todays.length, icon: Clock },
    { label: 'Cette semaine', value: week.length, icon: CalendarCheck },
    { label: scoped ? 'Mes patients' : 'Patients suivis', value: data.patients.filter(p => p.status !== 'Terminé').length, icon: Users },
    { label: 'Annulations (30 j)', value: `${cancelRate} %`, icon: TrendingDown },
  ];

  return <div className="grid min-w-0 grid-cols-1 gap-5 [&_section]:min-w-0 [&_section]:overflow-hidden">
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{kpis.map(k => <div key={k.label} className="min-w-0 rounded-2xl border bg-card p-4 sm:p-5"><div className="flex items-center justify-between text-muted-foreground"><span className="text-xs sm:text-sm">{k.label}</span><k.icon size={18} className="shrink-0"/></div><p className="mt-3 text-3xl font-semibold tracking-tight">{k.value}</p></div>)}</div>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <section className="rounded-2xl border bg-card p-5"><h2 className="text-base font-semibold">Activité des 8 dernières semaines</h2>
        <ChartContainer config={activityConfig} className="mt-4 h-56 w-full sm:h-[22rem]"><AreaChart data={activity} margin={{ left: -20, right: 8 }}><CartesianGrid vertical={false}/><XAxis dataKey="week" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><ChartTooltip content={<ChartTooltipContent/>}/><Area dataKey="seances" type="monotone" stroke="var(--color-seances)" fill="var(--color-seances)" fillOpacity={0.18} strokeWidth={2}/><Area dataKey="annulations" type="monotone" stroke="var(--color-annulations)" fill="var(--color-annulations)" fillOpacity={0.12} strokeWidth={2}/></AreaChart></ChartContainer>
      </section>
      <section className="rounded-2xl border bg-card p-5"><h2 className="text-base font-semibold">Prochains rendez-vous</h2>
        <ul className="mt-3 divide-y">{next.map(a => { const p = patient(a.patientId), pr = pro(a.practitionerId); return <li key={a.id} className="flex items-center gap-3 py-2.5"><span className="h-9 w-1 rounded-full" style={{ background: pr?.color }}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p && fullName(p)}</p><p className="truncate text-xs text-muted-foreground">{a.type}{!scoped && pr ? ` · ${pr.firstName}` : ''}</p></div><div className="text-right text-xs"><p className="font-medium">{fmtTime(a.start)}</p><p className="text-muted-foreground">{fmtDay(a.start)}</p></div></li>; })}</ul>
      </section>
    </div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {!scoped && <section className="rounded-2xl border bg-card p-5"><h2 className="text-base font-semibold">Séances réalisées par praticien (30 j)</h2>
        <ChartContainer config={proConfig} className="mt-4 h-60 w-full"><BarChart data={byPro} margin={{ left: -20 }}><CartesianGrid vertical={false}/><XAxis dataKey="name" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><ChartTooltip content={<ChartTooltipContent hideLabel/>}/><Bar dataKey="seances" radius={8}>{byPro.map(b => <Cell key={b.name} fill={b.fill}/>)}</Bar></BarChart></ChartContainer>
      </section>}
      <section className="rounded-2xl border bg-card p-5"><h2 className="text-base font-semibold">Motifs de consultation</h2>
        <div className="mt-4 flex flex-wrap items-center gap-6"><ChartContainer config={reasonConfig} className="mx-auto h-52 w-52 sm:mx-0"><PieChart><ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name"/>}/><Pie data={reasons} dataKey="value" nameKey="name" innerRadius={55} strokeWidth={3}/></PieChart></ChartContainer>
          <ul className="grid gap-2 text-sm">{reasons.map(r => <li key={r.name} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: r.fill }}/>{r.name}<span className="text-muted-foreground">· {r.value}</span></li>)}</ul></div>
      </section>
    </div>
  </div>;
}
