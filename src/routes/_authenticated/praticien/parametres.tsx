import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/praticien/parametres')({
  head: () => ({ meta: [
    { title: 'Paramètres — Espace praticien RD-Kiné' },
    { name: 'description', content: 'Photo de profil et présentation du praticien.' },
    { property: 'og:title', content: 'Paramètres — Espace praticien RD-Kiné' },
    { property: 'og:description', content: 'Photo de profil et présentation du praticien.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="parametres" scope="praticien" />,
});
