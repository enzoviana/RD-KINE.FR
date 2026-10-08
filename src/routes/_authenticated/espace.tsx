import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock, Activity, FileText, Download, Upload, CalendarPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { buildDemo, fullName, type DemoAppointment, type DemoDocument } from '@/lib/demo-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/hooks/use-session';

export const Route = createFileRoute('/_authenticated/espace')({
  head: () => ({
    meta: [
      { title: 'Mon espace — RD-Kiné' },
      { name: 'description', content: 'Vos rendez-vous et votre fiche patient au cabinet RD-Kiné.' },
      { property: 'og:title', content: 'Mon espace — RD-Kiné' },
      { property: 'og:description', content: 'Vos rendez-vous au cabinet RD-Kiné.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: Espace,
});

function Espace() {
  const { isAdmin } = useSession();
  const demo = useMemo(() => buildDemo(new Date()), []);
  const me = demo.patients[0]!;
  const pro = (id: string) => demo.practitioners.find(p => p.id === id);
  const [extra, setExtra] = useState<DemoAppointment[]>([]);
  const [cancelled, setCancelled] = useState<string[]>([]);
  const now = new Date();
  const mine = [...demo.appointments.filter(a => a.patientId === me.id), ...extra].map(a => cancelled.includes(a.id) ? { ...a, status: 'Annulé' as const } : a);
  const upcoming = mine.filter(a => a.status === 'Confirmé' && new Date(a.start) > now).sort((a, b) => a.start.localeCompare(b.start));
  const past = mine.filter(a => new Date(a.start) <= now).sort((a, b) => b.start.localeCompare(a.start));
  const doneAll = past.filter(a => a.status === 'Effectué').length;
  const done = Math.min(doneAll, 8);
  const [uploaded, setUploaded] = useState<DemoDocument[]>([]);
  const docs = [...uploaded, ...demo.documents.filter(d => d.patientId === me.id)];
  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files].map((f, i) => ({ id: `up-${Date.now()}-${i}`, patientId: me.id, name: f.name, kind: 'Ordonnance' as const, date: new Date().toISOString(), size: f.size > 1e6 ? `${(f.size / 1e6).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(f.size / 1000))} Ko` }));
    setUploaded(u => [...list, ...u]); toast.success(`${list.length > 1 ? `${list.length} documents envoyés` : 'Document envoyé'} au cabinet (démonstration).`);
  };
  const next = upcoming[0];

  const dLabel = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const tLabel = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="container-site py-8 md:py-14">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0"><p className="eyebrow">Espace patient</p><h1 className="mt-2 truncate text-3xl md:text-4xl">Bonjour {me.firstName}.</h1></div>
        <Badge variant="secondary" className="shrink-0">Démonstration</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><Button asChild className="pill-button"><Link to="/rendez-vous"><CalendarPlus/>Prendre rendez-vous</Link></Button>{isAdmin && <Button asChild variant="outline" className="rounded-full"><Link to="/admin">Espace administrateur</Link></Button>}</div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4"><p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarClock size={16}/>Prochain rendez-vous</p><p className="mt-2 font-semibold first-letter:uppercase">{next ? `${dLabel(next.start)} · ${tLabel(next.start)}` : 'Aucun'}</p>{next && <p className="text-sm text-muted-foreground">avec {pro(next.practitionerId)?.firstName}</p>}</div>
        <div className="rounded-2xl border bg-card p-4"><p className="flex items-center gap-2 text-sm text-muted-foreground"><Activity size={16}/>Traitement</p><p className="mt-2 font-semibold">{done} / 15 séances</p><Progress className="mt-2" value={Math.min(100, done / 15 * 100)}/></div>
        <div className="rounded-2xl border bg-card p-4"><p className="flex items-center gap-2 text-sm text-muted-foreground"><FileText size={16}/>Documents</p><p className="mt-2 font-semibold">{docs.length} disponibles</p><p className="truncate text-sm text-muted-foreground">{me.reason}</p></div>
      </div>

      <Tabs defaultValue="rdv" className="mt-8">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"><TabsList className="rounded-full"><TabsTrigger value="rdv" className="rounded-full">Mes rendez-vous</TabsTrigger><TabsTrigger value="docs" className="rounded-full">Documents</TabsTrigger><TabsTrigger value="profil" className="rounded-full">Ma fiche</TabsTrigger></TabsList></div>

        <TabsContent value="rdv" className="mt-6 space-y-8">
          <section><h2 className="text-xl">À venir</h2>
            {upcoming.length === 0 ? <p className="mt-3 text-muted-foreground">Aucun rendez-vous prévu.</p> :
              <div className="mt-4 grid gap-3">{upcoming.slice(0, 4).map(a => (
                <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card p-4 sm:p-5">
                  <div className="min-w-0"><p className="font-medium first-letter:uppercase">{dLabel(a.start)} · {tLabel(a.start)}</p><p className="truncate text-sm text-muted-foreground">{a.type} ({a.minutes} min) avec {pro(a.practitionerId) && fullName(pro(a.practitionerId)!)}</p></div>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setCancelled(c => [...c, a.id]); toast.success('Rendez-vous annulé (démonstration).'); }}>Annuler</Button>
                </div>))}</div>}
          </section>
          <section><h2 className="text-xl">Historique</h2><ul className="mt-3 divide-y rounded-2xl border bg-card">{past.slice(0, 8).map(a => <li key={a.id} className="flex items-center justify-between gap-3 p-4 text-sm"><div className="min-w-0"><p className="font-medium first-letter:uppercase">{dLabel(a.start)}</p><p className="truncate text-muted-foreground">{a.type} · {pro(a.practitionerId)?.firstName}</p></div><Badge variant={a.status === 'Annulé' ? 'destructive' : 'secondary'} className="shrink-0">{a.status}</Badge></li>)}</ul></section>
        </TabsContent>

        <TabsContent value="docs" className="mt-6"><label className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed bg-card p-6 text-center transition hover:border-primary" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files); }}><Upload className="text-primary"/><span className="font-medium">Téléverser un document</span><span className="text-sm text-muted-foreground">Ordonnance, compte rendu, imagerie… PDF ou image</span><input type="file" multiple accept=".pdf,image/*" className="sr-only" onChange={e => { upload(e.target.files); e.target.value = ""; }}/></label><ul className="grid gap-2 sm:grid-cols-2">{docs.map(x => <li key={x.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary"><FileText size={18}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{x.name}</p><p className="text-xs text-muted-foreground">{x.id.startsWith('up-') ? 'Envoyé par vous' : x.kind} · {new Date(x.date).toLocaleDateString('fr-FR')} · {x.size}</p></div><Button variant="ghost" size="icon" aria-label="Télécharger" onClick={() => toast.info('Document de démonstration')}><Download/></Button></li>)}</ul></TabsContent>

        <TabsContent value="profil" className="mt-6">
          <div className="grid max-w-xl gap-4 rounded-3xl border bg-card p-5 sm:grid-cols-2 sm:p-6">
            {([['Prénom', me.firstName], ['Nom', me.lastName], ['Téléphone', me.phone], ['Date de naissance', me.birthDate]] as const).map(([l, v]) => <div key={l}><Label>{l}</Label><Input className="mt-1.5" defaultValue={v} type={l === 'Date de naissance' ? 'date' : 'text'}/></div>)}
            <div className="sm:col-span-2"><Label>E-mail</Label><Input className="mt-1.5" defaultValue={me.email}/></div>
            <div className="sm:col-span-2"><Label>Adresse</Label><Input className="mt-1.5" defaultValue={me.address}/></div>
            <Button onClick={() => toast.success('Fiche enregistrée (démonstration).')} className="pill-button sm:col-span-2">Enregistrer</Button>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
