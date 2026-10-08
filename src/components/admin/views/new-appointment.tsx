import { useMemo, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { dayKey, freeStarts, fullName, type DemoData } from '@/lib/demo-data';
import { useDemo } from '../demo-store';

export function NewAppointment({ data, defaultDate }: { data: DemoData; defaultDate: Date }) {
  const store = useDemo();
  const [open, setOpen] = useState(false);
  const [pid, setPid] = useState(data.practitioners[0]?.id ?? '');
  const [patientId, setPatientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(dayKey(defaultDate));
  const [time, setTime] = useState('');
  const services = pid ? store.services(pid) : [];
  const service = services.find(s => s.id === serviceId);
  const patients = data.patients.filter(p => p.practitionerId === pid);
  const day = useMemo(() => { const [y, m, d] = date.split('-').map(Number); return new Date(y!, (m ?? 1) - 1, d ?? 1); }, [date]);
  const starts = service ? freeStarts(day, store.schedule(pid), data.appointments.filter(a => a.practitionerId === pid && a.status !== 'Annulé'), service.minutes).filter(t => { const [h, m] = t.split(':').map(Number); const d = new Date(day); d.setHours(h!, m!, 0, 0); return d > new Date(); }) : [];
  const reset = () => { setPatientId(''); setServiceId(''); setTime(''); };
  const submit = () => {
    if (!patientId || !service || !time) { toast.error('Choisissez un patient, une prestation et un horaire'); return; }
    const [h, m] = time.split(':').map(Number); const start = new Date(day); start.setHours(h!, m!, 0, 0);
    store.addAppointment({ patientId, practitionerId: pid, start: start.toISOString(), minutes: service.minutes, type: service.name });
    toast.success('Rendez-vous ajouté à l’agenda'); setOpen(false); reset();
  };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><CalendarPlus/>Nouveau rendez-vous</Button></DialogTrigger>
    <DialogContent><DialogHeader><DialogTitle>Nouveau rendez-vous</DialogTitle><DialogDescription>Seuls les horaires libres selon les disponibilités du praticien sont proposés.</DialogDescription></DialogHeader>
      <div className="grid gap-4">
        {data.practitioners.length > 1 && <div className="grid gap-1.5"><Label>Praticien</Label><Select value={pid} onValueChange={v => { setPid(v); reset(); }}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{data.practitioners.map(p => <SelectItem key={p.id} value={p.id}>{fullName(p)}</SelectItem>)}</SelectContent></Select></div>}
        <div className="grid gap-1.5"><Label>Patient</Label><Select value={patientId} onValueChange={setPatientId}><SelectTrigger><SelectValue placeholder="Choisir un patient"/></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{fullName(p)}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-1.5"><Label>Prestation</Label><Select value={serviceId} onValueChange={v => { setServiceId(v); setTime(''); }}><SelectTrigger><SelectValue placeholder="Choisir une prestation"/></SelectTrigger><SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} · {s.minutes} min</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-1.5"><Label htmlFor="rdv-date">Date</Label><Input id="rdv-date" type="date" value={date} onChange={e => { setDate(e.target.value); setTime(''); }}/></div>
        {service && <div className="grid gap-1.5"><Label>Horaire</Label>{starts.length ? <div className="flex max-h-40 flex-wrap gap-2 overflow-auto">{starts.map(s => <Button key={s} type="button" size="sm" variant={time === s ? 'default' : 'outline'} onClick={() => setTime(s)}>{s}</Button>)}</div> : <p className="text-sm text-muted-foreground">Aucun horaire libre ce jour-là.</p>}</div>}
      </div>
      <DialogFooter><Button onClick={submit}>Ajouter le rendez-vous</Button></DialogFooter>
    </DialogContent></Dialog>;
}
