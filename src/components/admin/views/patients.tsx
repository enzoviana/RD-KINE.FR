import { useMemo, useState } from 'react';
import { Search, FileText, Download, Phone, Mail, MapPin, Cake } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { age, fullName, type DemoData, type DemoPatient } from '@/lib/demo-data';
import { useDemo } from '../demo-store';
import { Pager } from '../pager';
import { paginate } from '@/lib/demo-data';

const d = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const dt = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const statusVariant = (s: DemoPatient['status']) => s === 'Nouveau' ? 'default' : s === 'Terminé' ? 'outline' : 'secondary';

export function PatientsTable({ data, mode }: { data: DemoData; mode: 'patients' | 'dossiers' }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<DemoPatient | null>(null);
  const [page, setPage] = useState(1);
  const now = new Date();
  const rows = useMemo(() => data.patients.filter(p => `${p.firstName} ${p.lastName} ${p.reason} ${p.phone}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.lastName.localeCompare(b.lastName)), [data, q]);
  const pg = paginate(rows, page, 10);
  const pro = (id: string) => data.practitioners.find(p => p.id === id);
  const appts = (id: string) => data.appointments.filter(a => a.patientId === id);
  const next = (id: string) => appts(id).filter(a => a.status === 'Confirmé' && new Date(a.start) >= now).sort((a, b) => a.start.localeCompare(b.start))[0];
  const done = (id: string) => appts(id).filter(a => a.status === 'Effectué').length;

  return <div className="grid gap-4">
    <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Rechercher un patient, un motif…" className="pl-9" aria-label="Rechercher"/></div>
    <div className="overflow-hidden rounded-2xl border bg-card"><Table>
      <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Motif</TableHead>{mode === 'patients' ? <><TableHead>Téléphone</TableHead><TableHead>Prochain RDV</TableHead></> : <><TableHead>Documents</TableHead><TableHead>Notes</TableHead><TableHead>Séances</TableHead></>}{data.practitioners.length > 1 && <TableHead>Praticien</TableHead>}<TableHead>Statut</TableHead></TableRow></TableHeader>
      <TableBody>{pg.rows.map(p => { const n = next(p.id), pr = pro(p.practitionerId); return <TableRow key={p.id} className="cursor-pointer" onClick={() => setSel(p)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSel(p)}>
        <TableCell><p className="font-medium">{fullName(p)}</p><p className="text-xs text-muted-foreground">{age(p.birthDate, now)} ans</p></TableCell>
        <TableCell className="max-w-56 truncate">{p.reason}</TableCell>
        {mode === 'patients' ? <><TableCell className="whitespace-nowrap">{p.phone}</TableCell><TableCell className="whitespace-nowrap">{n ? dt(n.start) : <span className="text-muted-foreground">—</span>}</TableCell></>
          : <><TableCell>{data.documents.filter(x => x.patientId === p.id).length}</TableCell><TableCell>{data.notes.filter(x => x.patientId === p.id).length}</TableCell><TableCell>{done(p.id)} / {p.sessionsPlanned}</TableCell></>}
        {data.practitioners.length > 1 && <TableCell><span className="flex items-center gap-2 whitespace-nowrap"><span className="size-2 rounded-full" style={{ background: pr?.color }}/>{pr?.firstName}</span></TableCell>}
        <TableCell><Badge variant={statusVariant(p.status)}>{p.status}</Badge></TableCell>
      </TableRow>; })}</TableBody>
    </Table>{!rows.length && <p className="p-6 text-sm text-muted-foreground">Aucun patient trouvé.</p>}<Pager page={pg.current} pages={pg.pages} total={rows.length} perPage={10} onChange={setPage}/></div>
    <PatientSheet data={data} patient={sel} mode={mode} onClose={() => setSel(null)} />
  </div>;
}

function PatientSheet({ data, patient: p, mode, onClose }: { data: DemoData; patient: DemoPatient | null; mode: 'patients' | 'dossiers'; onClose: () => void }) {
  const { addNote } = useDemo();
  const [note, setNote] = useState('');
  const now = new Date();
  if (!p) return <Sheet open={false} onOpenChange={() => onClose()}><SheetContent/></Sheet>;
  const pr = data.practitioners.find(x => x.id === p.practitionerId);
  const appts = data.appointments.filter(a => a.patientId === p.id).sort((a, b) => b.start.localeCompare(a.start));
  const done = appts.filter(a => a.status === 'Effectué').length;
  const docs = data.documents.filter(x => x.patientId === p.id);
  const notes = data.notes.filter(x => x.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date));
  const save = () => { if (!note.trim()) return; addNote({ patientId: p.id, practitionerId: p.practitionerId, text: note.trim() }); setNote(''); toast.success('Note ajoutée au dossier'); };

  return <Sheet open onOpenChange={v => !v && onClose()}><SheetContent className="w-full overflow-y-auto sm:max-w-xl">
    <SheetHeader><SheetTitle className="text-2xl">{fullName(p)}</SheetTitle><SheetDescription>{p.reason} · suivi par {pr ? fullName(pr) : '—'}</SheetDescription></SheetHeader>
    <div className="mt-5 grid gap-2 text-sm">{[[Cake, `${d(p.birthDate)} · ${age(p.birthDate, now)} ans`], [Phone, p.phone], [Mail, p.email], [MapPin, p.address]].map(([Icon, v], i) => { const I = Icon as typeof Phone; return <p key={i} className="flex items-center gap-2.5"><I className="size-4 text-muted-foreground"/>{v as string}</p>; })}</div>
    <div className="mt-5 rounded-xl bg-muted/50 p-4"><div className="flex justify-between text-sm"><span>Progression du traitement</span><span className="font-medium">{done} / {p.sessionsPlanned} séances</span></div><Progress value={Math.min(100, done / p.sessionsPlanned * 100)} className="mt-2"/></div>
    <Tabs defaultValue={mode === 'dossiers' ? 'documents' : 'seances'} className="mt-6">
      <TabsList className="w-full"><TabsTrigger value="seances" className="flex-1">Séances</TabsTrigger><TabsTrigger value="documents" className="flex-1">Documents ({docs.length})</TabsTrigger><TabsTrigger value="notes" className="flex-1">Notes ({notes.length})</TabsTrigger></TabsList>
      <TabsContent value="seances"><ul className="divide-y">{appts.slice(0, 20).map(a => <li key={a.id} className="flex items-center justify-between py-2.5 text-sm"><div><p className="font-medium">{a.type}</p><p className="text-xs text-muted-foreground">{dt(a.start)}</p></div><Badge variant={a.status === 'Confirmé' ? 'default' : a.status === 'Annulé' ? 'destructive' : 'secondary'}>{a.status}</Badge></li>)}{!appts.length && <li className="py-4 text-sm text-muted-foreground">Aucune séance.</li>}</ul></TabsContent>
      <TabsContent value="documents"><ul className="grid gap-2">{docs.map(x => <li key={x.id} className="flex items-center gap-3 rounded-xl border p-3"><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><FileText size={18}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{x.name}</p><p className="text-xs text-muted-foreground">{x.kind} · {d(x.date)} · {x.size}</p></div><Button variant="ghost" size="icon" aria-label="Télécharger" onClick={() => toast.info('Document de démonstration')}><Download/></Button></li>)}</ul></TabsContent>
      <TabsContent value="notes"><div className="grid gap-2"><Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ajouter une note de séance…" rows={3}/><Button onClick={save} className="justify-self-end" disabled={!note.trim()}>Ajouter la note</Button></div>
        <ul className="mt-4 grid gap-3">{notes.map(n => <li key={n.id} className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{d(n.date)} · {data.practitioners.find(x => x.id === n.practitionerId)?.firstName}</p><p className="mt-1 text-sm">{n.text}</p></li>)}</ul></TabsContent>
    </Tabs>
  </SheetContent></Sheet>;
}
