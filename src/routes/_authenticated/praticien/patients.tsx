import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/praticien/patients')({
  head: () => ({ meta: [
    { title: 'Mes patients — Espace praticien RD-Kiné' },
    { name: 'description', content: 'Patients suivis par le praticien.' },
    { property: 'og:title', content: 'Mes patients — Espace praticien RD-Kiné' },
    { property: 'og:description', content: 'Patients suivis par le praticien.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="patients" scope="praticien" />,
});
