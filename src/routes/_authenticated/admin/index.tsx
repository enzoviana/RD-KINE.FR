import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/admin/')({
  head: () => ({ meta: [
    { title: 'Dashboard — Administration RD-Kiné' },
    { name: 'description', content: 'Vue d’ensemble de l’activité du cabinet RD-Kiné.' },
    { property: 'og:title', content: 'Dashboard — Administration RD-Kiné' },
    { property: 'og:description', content: 'Vue d’ensemble de l’activité du cabinet RD-Kiné.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="dashboard" />,
});
