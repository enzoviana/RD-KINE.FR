import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/praticien/agenda')({
  head: () => ({ meta: [
    { title: 'Mon agenda — Espace praticien RD-Kiné' },
    { name: 'description', content: 'Agenda jour, semaine et mois du praticien.' },
    { property: 'og:title', content: 'Mon agenda — Espace praticien RD-Kiné' },
    { property: 'og:description', content: 'Agenda jour, semaine et mois du praticien.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="agenda" scope="praticien" />,
});
