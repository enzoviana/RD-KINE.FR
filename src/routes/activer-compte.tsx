import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/activer-compte')({
  head: () => ({ meta: [
    { title: 'Activer votre compte — RD-Kiné' },
    { name: 'description', content: 'Choisissez votre mot de passe pour activer votre compte RD-Kiné.' },
    { property: 'og:title', content: 'Activer votre compte — RD-Kiné' },
    { property: 'og:description', content: 'Activation sécurisée de votre compte RD-Kiné.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: ActivateAccount,
});

function ActivateAccount() {
  const navigate = useNavigate();
  const [valid, setValid] = useState(false);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const invitation = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'invite';
    supabase.auth.getUser().then(({ data }) => {
      if (active) { setValid(invitation && !!data.user); setReady(true); }
    });
    return () => { active = false; };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    if (password !== confirmation) { setError('Les mots de passe ne correspondent pas.'); return; }
    setBusy(true); setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError('Impossible d’enregistrer ce mot de passe. Choisissez un mot de passe plus fort ou réessayez.'); return; }
      await navigate({ to: '/connexion-admin', replace: true });
    } catch { setError('Enregistrement impossible. Veuillez réessayer.'); }
    finally { setBusy(false); }
  };

  return <main className="container-site py-16 md:py-24"><div className="mx-auto max-w-md">
    <p className="eyebrow">RD-Kiné · Activation</p><h1 className="mt-2 text-3xl">Choisissez votre mot de passe.</h1>
    {!ready ? <p className="mt-6 text-muted-foreground" role="status">Vérification du lien…</p> : !valid ? <><p className="mt-6 text-muted-foreground">Ce lien d’invitation est absent ou expiré. Ouvrez le lien reçu par email.</p><Button asChild variant="link" className="mt-4 px-0"><Link to="/connexion-admin">Retour à la connexion</Link></Button></> :
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div><Label htmlFor="new-password">Nouveau mot de passe</Label><Input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5" /></div>
        <div><Label htmlFor="confirm-password">Confirmer le mot de passe</Label><Input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={e => setConfirmation(e.target.value)} className="mt-1.5" /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className="pill-button w-full">Activer mon compte</Button>
      </form>}
  </div></main>;
}