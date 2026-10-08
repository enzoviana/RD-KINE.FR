import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/admin/agenda')({
  head: () => ({ meta: [
    { title: 'Agenda — Administration RD-Kiné' },
    { name: 'description', content: 'Agenda et créneaux de consultation du cabinet RD-Kiné.' },
    { property: 'og:title', content: 'Agenda — Administration RD-Kiné' },
    { property: 'og:description', content: 'Agenda et créneaux de consultation du cabinet RD-Kiné.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="agenda" />,
});
