import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Plus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hero from '@/assets/physio-hero.jpg';
import care from '@/assets/cabinet-care.jpg';
import knee from '@/assets/knee-care.jpg';
import { articles, services, cabinet } from '@/lib/cabinet';
export const photos: Record<string, string> & { hero: string; care: string; knee: string } = { hero, care, knee };
export function Eyebrow({children}: {children: React.ReactNode}) { return <p className="eyebrow"><Plus size={15}/><span className="eyebrow-line"/>{children}</p>; }
export function Appointment({label = 'Prendre rendez-vous'}: {label?: string}) {return <Button asChild className="pill-button"><Link to="/contact">{label}<ArrowUpRight/></Link></Button>;}
export function Services({full = false}: {full?: boolean}) {return <div className="services-grid">{services.map((service, i) => <Link to="/solutions" className="service-item" key={service.title}><div className="image-clip"><img src={photos[service.image]} width={1024} height={768} loading="lazy" alt="Illustration d’un accompagnement au cabinet" className={`service-photo service-photo-${i}`}/><span className="image-arrow"><ArrowUpRight size={21}/></span></div><p className="item-category">{service.category}</p><h3>{service.title}</h3><p className="item-description">{service.description}</p>{full && <span className="text-primary text-sm mt-4 block">Contacter le cabinet →</span>}</Link>)}</div>;}
export function Articles({all = false}: {all?: boolean}) {return <div className="articles-grid">{articles.slice(0, all ? 4 : 3).map(article => <article className="article-item" key={article.title}><img src={photos[article.image]} width={1024} height={768} loading="lazy" alt="Illustration de kinésithérapie"/><div className="article-meta"><span>{article.category}</span><span>{article.time}</span></div><h3>{article.title}</h3><p className="article-date">{article.date}</p></article>)}</div>;}
export function ContactBand() {return <section className="contact-band"><div className="container-site"><p className="text-sm mb-4">Faisons le premier pas, ensemble.</p><h2>Votre santé mérite<br/>toute notre attention.</h2><Appointment/><a className="band-phone" href={cabinet.phoneHref}><Phone size={14}/>{cabinet.phone}</a></div></section>;}
export function PageHeading({eyebrow, title, description}: {eyebrow: string; title: string; description: string}) {return <section className="page-heading container-site"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></section>;}
export function pageMeta(title: string, description: string) {return {meta: [{title: `${title} — RD-Kiné Étréchy`}, {name: 'description', content: description}, {property: 'og:title', content: `${title} — RD-Kiné Étréchy`}, {property: 'og:description', content: description}, {property: 'og:type', content: 'website'}, {name: 'twitter:card', content: 'summary_large_image'}]};}
