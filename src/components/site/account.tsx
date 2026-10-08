import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { UserRound, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/use-session';

export function AccountButton() {
  const { user, isAdmin } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  if (!user) return <Button asChild variant="ghost" className="account-button"><Link to="/auth"><UserRound />Espace patient</Link></Button>;
  const out = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: '/auth', replace: true }); };
  return <div className="flex items-center gap-1">
    <Button asChild variant="ghost" className="account-button"><Link to={isAdmin ? '/admin' : '/espace'}><UserRound />{isAdmin ? 'Administration' : 'Mon espace'}</Link></Button>
    <Button variant="ghost" size="icon" className="account-button hidden md:inline-flex" aria-label="Se déconnecter" onClick={out}><LogOut /></Button>
  </div>;
}
