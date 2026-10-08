import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceShell } from '@/components/admin/shell';

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({
    meta: [
      { title: 'Administration — RD-Kiné' },
      { name: 'description', content: 'Planning des praticiens, séances et fiches patients du cabinet RD-Kiné.' },
      { property: 'og:title', content: 'Administration — RD-Kiné' },
      { property: 'og:description', content: 'Gestion du planning du cabinet RD-Kiné.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: () => <WorkspaceShell mode="admin" />,
});
