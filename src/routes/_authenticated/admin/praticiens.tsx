import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/admin/praticiens')({
  head: () => ({ meta: [
    { title: 'Praticiens — Administration RD-Kiné' },
    { name: 'description', content: 'Équipe et praticiens du cabinet RD-Kiné.' },
    { property: 'og:title', content: 'Praticiens — Administration RD-Kiné' },
    { property: 'og:description', content: 'Équipe et praticiens du cabinet RD-Kiné.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="praticiens" />,
});
