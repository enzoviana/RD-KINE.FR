import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/praticien/services')({
  head: () => ({ meta: [
    { title: 'Mes prestations — Espace praticien RD-Kiné' },
    { name: 'description', content: 'Prestations, durées et descriptions proposées par le praticien.' },
    { property: 'og:title', content: 'Mes prestations — Espace praticien RD-Kiné' },
    { property: 'og:description', content: 'Prestations, durées et descriptions proposées par le praticien.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="services" scope="praticien" />,
});
