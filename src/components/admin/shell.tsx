import { Link, Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/use-session';
import { AdminNavigation } from './navigation';
import { PasswordChange } from './password-change';
import { DemoProvider } from './demo-store';

/** Cadre commun admin / praticien : vérifie le rôle côté base, puis sidebar sans navigation du site. */
export function WorkspaceShell({ mode }: { mode: 'admin' | 'praticien' }) {
  const { user, isAdmin, ready } = useSession();
  const [required, setRequired] = useState<boolean | null>(null);
  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase.rpc('password_change_required').then(({ data, error }) => { if (active && !error) setRequired(data === true); });
    return () => { active = false; };
  }, [user]);
  if (!ready || required === null) return <main className="p-16" aria-busy="true" />;
  if (required) return <PasswordChange onChanged={() => window.location.reload()} />;
  if (!isAdmin) return <main className="container-site py-16"><h1 className="text-3xl">Accès réservé</h1><p className="mt-3 text-muted-foreground">Cet espace est réservé à l’équipe du cabinet.</p><Button asChild className="pill-button mt-6"><Link to="/espace">Retour à mon espace</Link></Button></main>;
  return <DemoProvider><SidebarProvider className="admin-shell"><AdminNavigation mode={mode}/><div className="flex min-w-0 flex-1 flex-col"><header className="admin-toolbar"><SidebarTrigger aria-label="Ouvrir ou replier la navigation" title="Ouvrir ou replier la navigation"/><span className="text-sm text-muted-foreground">{mode === 'admin' ? 'Cabinet · Administration' : 'Cabinet · Espace praticien'}</span></header><div className="min-h-0 flex-1 overflow-auto"><Outlet/></div></div></SidebarProvider></DemoProvider>;
}
