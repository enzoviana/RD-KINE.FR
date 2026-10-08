import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/praticien/')({
  head: () => ({ meta: [
    { title: 'Dashboard — Espace praticien RD-Kiné' },
    { name: 'description', content: 'Activité et prochains rendez-vous du praticien.' },
    { property: 'og:title', content: 'Dashboard — Espace praticien RD-Kiné' },
    { property: 'og:description', content: 'Activité et prochains rendez-vous du praticien.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="dashboard" scope="praticien" />,
});
