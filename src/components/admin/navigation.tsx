import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, LayoutDashboard, Users, Stethoscope, FolderOpen, Settings, Globe, LogOut, UserRoundCog, ClipboardList, Clock } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from './demo-store';
import { fullName } from '@/lib/demo-data';

const adminItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/praticiens', label: 'Praticiens', icon: Stethoscope },
  { to: '/admin/patients', label: 'Patients', icon: Users },
  { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/admin/dossiers', label: 'Dossiers', icon: FolderOpen },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
] as const;
const proItems = [
  { to: '/praticien', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/praticien/patients', label: 'Mes patients', icon: Users },
  { to: '/praticien/agenda', label: 'Mon agenda', icon: CalendarDays },
  { to: '/praticien/dossiers', label: 'Dossiers', icon: FolderOpen },
  { to: '/praticien/services', label: 'Mes prestations', icon: ClipboardList },
  { to: '/praticien/disponibilites', label: 'Disponibilités', icon: Clock },
  { to: '/praticien/parametres', label: 'Paramètres', icon: Settings },
] as const;

export function Logo() {
  return <Link to="/" className="flex items-center gap-2.5" aria-label="RD-Kiné — retour au site">
    <img src="/favicon.svg" alt="" className="size-9 shrink-0 rounded-xl" />
    <span className="text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">RD<span className="text-primary">—</span>Kiné<span className="text-secondary-foreground">.</span></span>
  </Link>;
}

export function AdminNavigation({ mode }: { mode: 'admin' | 'praticien' }) {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, viewAs, setViewAs } = useDemo();
  const items = mode === 'admin' ? adminItems : proItems;
  const out = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: '/connexion-admin', replace: true }); };
  return <Sidebar collapsible="icon" className="admin-sidebar">
    <SidebarHeader className="gap-3 p-4"><Logo/><p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">{mode === 'admin' ? 'Administration du cabinet' : 'Espace praticien'}</p></SidebarHeader>
    {mode === 'praticien' && <div className="px-4 pb-2 group-data-[collapsible=icon]:hidden"><Select value={viewAs} onValueChange={setViewAs}><SelectTrigger aria-label="Praticien connecté (démonstration)"><SelectValue/></SelectTrigger><SelectContent>{data.practitioners.filter(p => p.hasAccount).map(p => <SelectItem key={p.id} value={p.id}>{fullName(p)}</SelectItem>)}</SelectContent></Select></div>}
    <SidebarContent><SidebarGroup><SidebarGroupLabel>{mode === 'admin' ? 'Cabinet' : 'Mon activité'}</SidebarGroupLabel><SidebarMenu>{items.map(item => <SidebarMenuItem key={item.to}><SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.label} className="h-11"><Link to={item.to} onClick={() => setOpenMobile(false)}><item.icon/><span>{item.label}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroup></SidebarContent>
    <SidebarFooter><SidebarMenu>
      <SidebarMenuItem><SidebarMenuButton asChild tooltip={mode === 'admin' ? 'Espace praticien' : 'Administration'}><Link to={mode === 'admin' ? '/praticien' : '/admin'} onClick={() => setOpenMobile(false)}><UserRoundCog/><span>{mode === 'admin' ? 'Espace praticien' : 'Administration'}</span></Link></SidebarMenuButton></SidebarMenuItem>
      <SidebarMenuItem><SidebarMenuButton asChild tooltip="Voir le site"><Link to="/"><Globe/><span>Voir le site</span></Link></SidebarMenuButton></SidebarMenuItem>
      <SidebarMenuItem><SidebarMenuButton tooltip="Se déconnecter" onClick={out}><LogOut/><span>Se déconnecter</span></SidebarMenuButton></SidebarMenuItem>
    </SidebarMenu></SidebarFooter>
  </Sidebar>;
}
