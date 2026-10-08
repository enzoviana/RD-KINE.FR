import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { ShieldCheck, ArrowLeft, LoaderCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/connexion-admin')({
  head: () => ({ meta: [
    { title: 'Connexion administrateur — RD-Kiné' },
    { name: 'description', content: 'Connexion réservée à l’administration du cabinet RD-Kiné.' },
    { property: 'og:title', content: 'Connexion administrateur — RD-Kiné' },
    { property: 'og:description', content: 'Accès à l’espace administrateur du cabinet RD-Kiné.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, ready } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && user && isAdmin) navigate({ to: '/admin', replace: true });
    else if (ready && user) supabase.rpc('password_change_required').then(({ data }) => {
      if (data) navigate({ to: '/admin', replace: true });
    });
  }, [ready, user, isAdmin, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError('Email ou mot de passe incorrect.');
    } catch {
      setError('Connexion impossible pour le moment. Veuillez réessayer.');
    } finally {
      setBusy(false);
    }
  };

  const denied = ready && user && !isAdmin;
  return <main className="container-site py-16 md:py-24">
    <div className="mx-auto max-w-md">
      <ShieldCheck className="mb-5 size-9 text-primary" aria-hidden="true" />
      <p className="eyebrow">Administration · RD-Kiné</p>
      <h1 className="mt-2 text-3xl">Connexion administrateur.</h1>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div><Label htmlFor="admin-email">Email professionnel</Label><Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="mt-1.5" /></div>
        <div><Label htmlFor="admin-password">Mot de passe</Label><Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="mt-1.5" /></div>
        {(error || denied) && <p role="alert" className="text-sm text-destructive">{error || 'Ce compte ne dispose pas d’un accès administrateur.'}</p>}
        <Button type="submit" disabled={busy || !ready} className="pill-button w-full">{busy && <LoaderCircle className="animate-spin motion-reduce:animate-none" />}Se connecter à l’administration</Button>
      </form>
      <Button asChild variant="link" className="mt-5 px-0"><Link to="/auth"><ArrowLeft />Connexion à l’espace patient</Link></Button>
    </div>
  </main>;
}