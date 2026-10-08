import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { UserPlus, Copy, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createPractitionerAccount, fullName, type NewAccountInput } from '@/lib/demo-data';
import { useDemo } from '../demo-store';
import { Pager } from '../pager';
import { paginate } from '@/lib/demo-data';

const empty: NewAccountInput = { firstName: '', lastName: '', email: '', phone: '', job: '' };

export function Team() {
  const { data, addPractitioner, toggleActive, setViewAs } = useDemo();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const now = new Date();
  const [page, setPage] = useState(1);
  const pg = paginate(data.practitioners, page, 8);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = createPractitionerAccount(form, data.practitioners);
    if (!r.ok) { toast.error(r.error); return; }
    addPractitioner(r.practitioner); setCreated({ email: r.practitioner.email, password: r.tempPassword }); setForm(empty);
  };
  const field = (k: keyof NewAccountInput, label: string, type = 'text', placeholder = '') => <div className="grid gap-1.5"><Label htmlFor={k}>{label}</Label><Input id={k} type={type} placeholder={placeholder} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}/></div>;

  return <div className="grid gap-4">
    <div className="flex justify-end"><Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setCreated(null); }}><DialogTrigger asChild><Button><UserPlus/>Créer un compte praticien</Button></DialogTrigger>
      <DialogContent>{created ? <>
        <DialogHeader><DialogTitle>Compte créé</DialogTitle><DialogDescription>Transmettez ces accès au praticien. Il devra changer son mot de passe à la première connexion.</DialogDescription></DialogHeader>
        <div className="grid gap-2 rounded-xl bg-muted p-4 text-sm"><p><span className="text-muted-foreground">Identifiant :</span> {created.email}</p><p><span className="text-muted-foreground">Mot de passe provisoire :</span> <code className="font-semibold">{created.password}</code></p></div>
        <DialogFooter><Button variant="outline" onClick={() => { navigator.clipboard?.writeText(`${created.email} / ${created.password}`); toast.success('Accès copiés'); }}><Copy/>Copier</Button><Button onClick={() => { setOpen(false); setCreated(null); }}>Terminer</Button></DialogFooter>
      </> : <form onSubmit={submit} className="grid gap-4">
        <DialogHeader><DialogTitle>Nouveau compte praticien</DialogTitle><DialogDescription>Le praticien accédera à son propre espace : dashboard, patients, agenda et dossiers.</DialogDescription></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">{field('firstName', 'Prénom')}{field('lastName', 'Nom')}</div>
        {field('email', 'E-mail professionnel', 'email', 'prenom@rd-kine.fr')}
        <div className="grid gap-3 sm:grid-cols-2">{field('phone', 'Téléphone', 'tel')}{field('job', 'Spécialité', 'text', 'Masseur-kinésithérapeute')}</div>
        <DialogFooter><Button type="submit">Créer le compte</Button></DialogFooter>
      </form>}</DialogContent></Dialog></div>
    <div className="overflow-hidden rounded-2xl border bg-card"><Table>
      <TableHeader><TableRow><TableHead>Praticien</TableHead><TableHead>Contact</TableHead><TableHead>Patients</TableHead><TableHead>RDV à venir</TableHead><TableHead>Compte</TableHead><TableHead>Actif</TableHead><TableHead/></TableRow></TableHeader>
      <TableBody>{pg.rows.map(p => <TableRow key={p.id}>
        <TableCell><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full text-sm font-semibold text-primary-foreground" style={{ background: p.color }}>{p.firstName[0]}{p.lastName[0]}</span><div><p className="font-medium">{fullName(p)}</p><p className="text-xs text-muted-foreground">{p.job}</p></div></div></TableCell>
        <TableCell><p className="text-sm">{p.email}</p><p className="text-xs text-muted-foreground">{p.phone}</p></TableCell>
        <TableCell>{data.patients.filter(x => x.practitionerId === p.id).length}</TableCell>
        <TableCell>{data.appointments.filter(a => a.practitionerId === p.id && a.status === 'Confirmé' && new Date(a.start) >= now).length}</TableCell>
        <TableCell>{p.hasAccount ? <Badge variant="secondary">Actif</Badge> : <Badge variant="outline">Sans compte</Badge>}</TableCell>
        <TableCell><Switch checked={p.active} onCheckedChange={() => toggleActive(p.id)} aria-label={`Activer ${fullName(p)}`}/></TableCell>
        <TableCell>{p.hasAccount && <Button asChild variant="ghost" size="sm" onClick={() => setViewAs(p.id)}><Link to="/praticien">Son espace <ArrowUpRight/></Link></Button>}</TableCell>
      </TableRow>)}</TableBody>
    </Table><Pager page={pg.current} pages={pg.pages} total={data.practitioners.length} perPage={8} onChange={setPage}/></div>
  </div>;
}
