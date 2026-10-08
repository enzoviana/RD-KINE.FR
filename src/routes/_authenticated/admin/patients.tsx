import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/admin/patients')({
  head: () => ({ meta: [
    { title: 'Patients — Administration RD-Kiné' },
    { name: 'description', content: 'Gestion des patients du cabinet RD-Kiné.' },
    { property: 'og:title', content: 'Patients — Administration RD-Kiné' },
    { property: 'og:description', content: 'Gestion des patients du cabinet RD-Kiné.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="patients" />,
});
