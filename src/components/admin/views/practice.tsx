import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Clock, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WEEKDAY_LABELS, fullName, type DemoService, type DemoSchedule, type DemoProfile } from '@/lib/demo-data';
import { useDemo } from '../demo-store';

export function Services({ pid }: { pid: string }) {
  const { services, saveServices } = useDemo();
  const list = services(pid);
  const [edit, setEdit] = useState<DemoService | null>(null);
  const save = (s: DemoService) => {
    if (!s.name.trim() || s.minutes < 5) { toast.error('Nom et durée obligatoires'); return; }
    saveServices(pid, list.some(x => x.id === s.id) ? list.map(x => x.id === s.id ? s : x) : [...list, s]); setEdit(null); toast.success('Prestation enregistrée');
  };
  return <div className="grid gap-4">
    <div className="flex justify-end"><Button onClick={() => setEdit({ id: `svc-${Date.now()}`, practitionerId: pid, name: '', minutes: 45, description: '' })}><Plus/>Ajouter une prestation</Button></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{list.map(s => <article key={s.id} className="flex flex-col rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3"><h2 className="text-base font-semibold">{s.name}</h2><span className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary"><Clock size={12}/>{s.minutes} min</span></div>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.description || 'Sans description.'}</p>
      <div className="mt-4 flex gap-1"><Button variant="ghost" size="sm" onClick={() => setEdit(s)}><Pencil/>Modifier</Button><Button variant="ghost" size="sm" onClick={() => saveServices(pid, list.filter(x => x.id !== s.id))}><Trash2/>Supprimer</Button></div>
    </article>)}</div>
    <Dialog open={!!edit} onOpenChange={v => !v && setEdit(null)}><DialogContent>{edit && <>
      <DialogHeader><DialogTitle>Prestation</DialogTitle><DialogDescription>Elle sera proposée lors de la prise de rendez-vous.</DialogDescription></DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-1.5"><Label htmlFor="svc-name">Nom</Label><Input id="svc-name" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })}/></div>
        <div className="grid gap-1.5"><Label>Durée</Label><Select value={String(edit.minutes)} onValueChange={v => setEdit({ ...edit, minutes: Number(v) })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{[15, 20, 30, 45, 60, 75, 90].map(m => <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-1.5"><Label htmlFor="svc-desc">Description</Label><Textarea id="svc-desc" rows={3} value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })}/></div>
      </div>
      <DialogFooter><Button onClick={() => save(edit)}>Enregistrer</Button></DialogFooter>
    </>}</DialogContent></Dialog>
  </div>;
}

export function Availability({ pid }: { pid: string }) {
  const { schedule, saveSchedule } = useDemo();
  const [s, setS] = useState<DemoSchedule>(schedule(pid));
  useEffect(() => setS(schedule(pid)), [pid]); // eslint-disable-line react-hooks/exhaustive-deps
  const setDay = (day: number, patch: Partial<DemoSchedule['days'][number]>) => setS({ ...s, days: s.days.map(d => d.day === day ? { ...d, ...patch } : d) });
  const order = [1, 2, 3, 4, 5, 6, 0];
  return <div className="grid max-w-4xl gap-5">
    <section className="rounded-2xl border bg-card p-5"><h2 className="text-base font-semibold">Jours et horaires de travail</h2>
      <div className="mt-4 divide-y">{order.map(n => { const d = s.days.find(x => x.day === n)!; return <div key={n} className="grid items-center gap-3 py-3 md:grid-cols-[150px_1fr]">
        <label className="flex items-center gap-3 text-sm font-medium"><Switch checked={d.enabled} onCheckedChange={v => setDay(n, { enabled: v })} aria-label={`Travailler le ${WEEKDAY_LABELS[n]}`}/>{WEEKDAY_LABELS[n]}</label>
        {d.enabled ? <div className="flex flex-wrap items-center gap-2 text-sm"><Input type="time" className="w-28" value={d.start} onChange={e => setDay(n, { start: e.target.value })} aria-label="Début"/>à<Input type="time" className="w-28" value={d.end} onChange={e => setDay(n, { end: e.target.value })} aria-label="Fin"/><span className="ml-3 text-muted-foreground">Pause</span><Input type="time" className="w-28" value={d.breakStart} onChange={e => setDay(n, { breakStart: e.target.value })} aria-label="Début de pause"/>à<Input type="time" className="w-28" value={d.breakEnd} onChange={e => setDay(n, { breakEnd: e.target.value })} aria-label="Fin de pause"/></div> : <span className="text-sm text-muted-foreground">Fermé</span>}
      </div>; })}</div>
    </section>
    <section className="rounded-2xl border bg-card p-5"><h2 className="text-base font-semibold">Temps entre deux rendez-vous</h2><p className="mt-1 text-sm text-muted-foreground">Battement réservé automatiquement avant et après chaque séance.</p>
      <Select value={String(s.bufferMinutes)} onValueChange={v => setS({ ...s, bufferMinutes: Number(v) })}><SelectTrigger className="mt-3 w-48"><SelectValue/></SelectTrigger><SelectContent>{[0, 5, 10, 15, 20, 30].map(m => <SelectItem key={m} value={String(m)}>{m === 0 ? 'Aucun' : `${m} minutes`}</SelectItem>)}</SelectContent></Select>
    </section>
    <Button className="justify-self-start" onClick={() => { saveSchedule(s); toast.success('Disponibilités enregistrées'); }}>Enregistrer mes disponibilités</Button>
  </div>;
}

export function ProfileSettings({ pid }: { pid: string }) {
  const { profile, saveProfile, data } = useDemo();
  const pro = data.practitioners.find(p => p.id === pid);
  const [p, setP] = useState<DemoProfile>(profile(pid));
  useEffect(() => setP(profile(pid)), [pid]); // eslint-disable-line react-hooks/exhaustive-deps
  const onFile = (f?: File) => {
    if (!f) return;
    const img = new Image(); const url = URL.createObjectURL(f);
    img.onload = () => { const c = document.createElement('canvas'); const size = 320; c.width = c.height = size; const k = Math.max(size / img.width, size / img.height); const ctx = c.getContext('2d')!; ctx.drawImage(img, (size - img.width * k) / 2, (size - img.height * k) / 2, img.width * k, img.height * k); setP(prev => ({ ...prev, photo: c.toDataURL('image/jpeg', 0.85) })); URL.revokeObjectURL(url); };
    img.src = url;
  };
  return <div className="grid max-w-3xl gap-5"><section className="rounded-2xl border bg-card p-6">
    <h2 className="text-base font-semibold">Profil public</h2>
    <div className="mt-5 flex flex-wrap items-center gap-5">
      <div className="grid size-28 place-items-center overflow-hidden rounded-full bg-accent text-3xl font-semibold text-primary">{p.photo ? <img src={p.photo} alt="Photo de profil" className="size-full object-cover"/> : pro && `${pro.firstName[0]}${pro.lastName[0]}`}</div>
      <div className="grid gap-2"><p className="text-lg font-semibold">{pro && fullName(pro)}</p><label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"><Camera size={16}/>Changer la photo<input type="file" accept="image/*" className="sr-only" onChange={e => onFile(e.target.files?.[0])}/></label>{p.photo && <Button variant="ghost" size="sm" className="w-fit" onClick={() => setP({ ...p, photo: '' })}>Retirer la photo</Button>}</div>
    </div>
    <div className="mt-6 grid gap-4">
      <div className="grid gap-1.5"><Label htmlFor="pf-title">Titre / spécialité</Label><Input id="pf-title" value={p.title} onChange={e => setP({ ...p, title: e.target.value })}/></div>
      <div className="grid gap-1.5"><Label htmlFor="pf-bio">Présentation</Label><Textarea id="pf-bio" rows={5} placeholder="Votre parcours, vos spécialités, votre approche…" value={p.bio} onChange={e => setP({ ...p, bio: e.target.value })}/></div>
      <div className="grid gap-3 sm:grid-cols-2 text-sm"><p><span className="text-muted-foreground">E-mail :</span> {pro?.email}</p><p><span className="text-muted-foreground">Téléphone :</span> {pro?.phone}</p></div>
    </div>
    <Button className="mt-6" onClick={() => { saveProfile(p); toast.success('Profil enregistré'); }}>Enregistrer le profil</Button>
  </section></div>;
}
