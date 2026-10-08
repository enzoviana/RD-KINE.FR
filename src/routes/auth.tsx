import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/auth')({
  head: () => ({
    meta: [
      { title: 'Connexion — Espace patient RD-Kiné' },
      { name: 'description', content: 'Connectez-vous pour prendre et retrouver vos rendez-vous au cabinet RD-Kiné à Étréchy.' },
      { property: 'og:title', content: 'Connexion — Espace patient RD-Kiné' },
      { property: 'og:description', content: 'Prenez et retrouvez vos rendez-vous au cabinet RD-Kiné.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ email: '', password: '', first_name: '', last_name: '', phone: '' });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: '/espace' }); });
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === 'SIGNED_IN') navigate({ to: '/espace' }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (error) toast.error('Email ou mot de passe incorrect.');
    } else {
      const { error } = await supabase.auth.signUp({
        email: f.email, password: f.password,
        options: { emailRedirectTo: window.location.origin + '/espace', data: { first_name: f.first_name, last_name: f.last_name, phone: f.phone } },
      });
      if (error) toast.error(error.message); else setSent(true);
    }
    setBusy(false);
  };

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <main className="container-site py-16 md:py-24">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 md:p-10">
        <p className="eyebrow">Espace patient</p>
        <h1 className="mt-2 text-3xl">{mode === 'login' ? 'Bon retour parmi nous.' : 'Créer votre compte.'}</h1>
        {sent ? (
          <p className="mt-6 text-muted-foreground">Un email de confirmation vous a été envoyé. Cliquez sur le lien pour activer votre compte.</p>
        ) : (
          <>
            <form onSubmit={submit} className="mt-7 space-y-4">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label htmlFor="fn">Prénom</Label><Input id="fn" required value={f.first_name} onChange={set('first_name')} className="mt-1.5" /></div>
                  <div><Label htmlFor="ln">Nom</Label><Input id="ln" required value={f.last_name} onChange={set('last_name')} className="mt-1.5" /></div>
                  <div className="col-span-2"><Label htmlFor="ph">Téléphone</Label><Input id="ph" type="tel" required value={f.phone} onChange={set('phone')} className="mt-1.5" /></div>
                </div>
              )}
              <div><Label htmlFor="em">Email</Label><Input id="em" type="email" required value={f.email} onChange={set('email')} className="mt-1.5" /></div>
              <div><Label htmlFor="pw">Mot de passe</Label><Input id="pw" type="password" required minLength={8} value={f.password} onChange={set('password')} className="mt-1.5" /></div>
              <Button type="submit" disabled={busy} className="pill-button w-full">{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</Button>
            </form>
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="mt-6 text-sm text-primary">
              {mode === 'login' ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'}
            </button>
          </>
        )}
        <div className="mt-6 border-t border-border pt-4"><Button asChild variant="link" className="px-0"><Link to="/connexion-admin">Connexion administrateur</Link></Button></div>
      </div>
    </main>
  );
}
