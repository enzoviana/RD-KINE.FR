import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Pager({ page, pages, total, perPage, onChange }: { page: number; pages: number; total: number; perPage: number; onChange: (p: number) => void }) {
  if (total === 0) return null;
  const from = (page - 1) * perPage + 1, to = Math.min(total, page * perPage);
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
    <span className="text-muted-foreground">{from}–{to} sur {total}</span>
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Page précédente"><ChevronLeft/></Button>
      {Array.from({ length: pages }, (_, i) => i + 1).filter(n => n === 1 || n === pages || Math.abs(n - page) <= 1).map((n, i, arr) => <span key={n} className="flex items-center gap-1">{i > 0 && n - arr[i - 1]! > 1 && <span className="px-1 text-muted-foreground">…</span>}<Button variant={n === page ? 'default' : 'ghost'} size="icon" className="size-8" onClick={() => onChange(n)} aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined}>{n}</Button></span>)}
      <Button variant="outline" size="icon" className="size-8" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Page suivante"><ChevronRight/></Button>
    </div>
  </div>;
}
