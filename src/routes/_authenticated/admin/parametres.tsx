import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/admin/parametres')({
  head: () => ({ meta: [
    { title: 'Paramètres — Administration RD-Kiné' },
    { name: 'description', content: 'Informations et paramètres du cabinet RD-Kiné.' },
    { property: 'og:title', content: 'Paramètres — Administration RD-Kiné' },
    { property: 'og:description', content: 'Informations et paramètres du cabinet RD-Kiné.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="parametres" />,
});
