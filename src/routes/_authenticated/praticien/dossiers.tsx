import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/praticien/dossiers')({
  head: () => ({ meta: [
    { title: 'Dossiers — Espace praticien RD-Kiné' },
    { name: 'description', content: 'Dossiers, documents et notes des patients du praticien.' },
    { property: 'og:title', content: 'Dossiers — Espace praticien RD-Kiné' },
    { property: 'og:description', content: 'Dossiers, documents et notes des patients du praticien.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="dossiers" scope="praticien" />,
});
