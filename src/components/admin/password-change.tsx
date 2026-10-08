import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordChange({ onChanged }: { onChanged: () => void }) {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password === current) { setError('Choisissez un mot de passe différent du mot de passe provisoire.'); return; }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password, current_password: current });
      if (updateError) { setError('Modification impossible. Vérifiez le mot de passe provisoire et choisissez un nouveau mot de passe suffisamment fort.'); return; }
      onChanged();
    } catch { setError('Modification impossible. Veuillez réessayer.'); }
    finally { setBusy(false); }
  };
  return <main className="container-site py-16"><div className="mx-auto max-w-md">
    <p className="eyebrow">Administration · Première connexion</p><h1 className="mt-2 text-3xl">Votre nouveau mot de passe.</h1>
    <form className="mt-8 space-y-5" onSubmit={submit}>
      <div><Label htmlFor="temporary-password">Mot de passe provisoire</Label><Input id="temporary-password" type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} className="mt-1.5" /></div>
      <div><Label htmlFor="replacement-password">Nouveau mot de passe</Label><Input id="replacement-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5" /></div>
      <div><Label htmlFor="replacement-confirm">Confirmer le nouveau mot de passe</Label><Input id="replacement-confirm" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1.5" /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy} className="pill-button w-full">Enregistrer et accéder à l’administration</Button>
    </form>
  </div></main>;
}