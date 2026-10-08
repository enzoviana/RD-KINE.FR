import { createFileRoute } from '@tanstack/react-router';
import { AdminWorkspace } from '@/components/admin/workspace';
export const Route = createFileRoute('/_authenticated/praticien/disponibilites')({
  head: () => ({ meta: [
    { title: 'Disponibilités — Espace praticien RD-Kiné' },
    { name: 'description', content: 'Jours, horaires, pauses et temps entre rendez-vous du praticien.' },
    { property: 'og:title', content: 'Disponibilités — Espace praticien RD-Kiné' },
    { property: 'og:description', content: 'Jours, horaires, pauses et temps entre rendez-vous du praticien.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AdminWorkspace view="disponibilites" scope="praticien" />,
});
