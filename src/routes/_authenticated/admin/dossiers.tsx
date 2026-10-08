import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/admin/dossiers')({
  head: () => ({ meta: [
    { title: 'Dossiers patients — Administration RD-Kiné' },
    { name: 'description', content: 'Fiches et notes des patients du cabinet RD-Kiné.' },
    { property: 'og:title', content: 'Dossiers patients — Administration RD-Kiné' },
    { property: 'og:description', content: 'Fiches et notes des patients du cabinet RD-Kiné.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="dossiers" />,
});
