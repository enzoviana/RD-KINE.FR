import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceShell } from '@/components/admin/shell';

export const Route = createFileRoute('/_authenticated/praticien')({
  head: () => ({ meta: [
    { title: 'Espace praticien — RD-Kiné' },
    { name: 'description', content: 'Espace personnel des praticiens du cabinet RD-Kiné.' },
    { property: 'og:title', content: 'Espace praticien — RD-Kiné' },
    { property: 'og:description', content: 'Espace personnel des praticiens du cabinet RD-Kiné.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <WorkspaceShell mode="praticien" />,
});
