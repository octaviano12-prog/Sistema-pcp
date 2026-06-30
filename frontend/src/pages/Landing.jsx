import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUp,
  Award,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gauge,
  HardHat,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  PlayCircle,
  Send,
  Settings,
  ShieldCheck,
  UserCircle,
  Wrench,
  X,
  Youtube,
} from 'lucide-react';
import heroImage from '../assets/imec/hero-welder.jpg';
import footerImage from '../assets/imec/footer-industrial.jpg';
import portfolioVasos from '../assets/imec/portfolio-vasos.jpg';
import portfolioTubulacoes from '../assets/imec/portfolio-tubulacoes.jpg';
import portfolioEstruturas from '../assets/imec/portfolio-estruturas.jpg';
import portfolioTanques from '../assets/imec/portfolio-tanques.jpg';
import portfolioCaldeiraria from '../assets/imec/portfolio-caldeiraria.jpg';
import portfolioCargas from '../assets/imec/portfolio-cargas.jpg';

const phoneDisplay = '(47) 99942-3000';
const phoneNumber = '5547999423000';
const email = 'contato@imecmetalurgica.com.br';

const navItems = [
  ['#home', 'Home'],
  ['#quem-somos', 'Quem Somos'],
  ['#servicos', 'Serviços'],
  ['#galeria', 'Galeria'],
  ['#videos', 'Vídeos'],
  ['#portfolio', 'Portfólio'],
  ['#contato', 'Contato'],
];

const services = [
  {
    icon: Building2,
    title: 'Caldeiraria',
    desc: 'Fabricação e montagem de equipamentos, bases, tanques e tubulações industriais.',
  },
  {
    icon: Wrench,
    title: 'Soldagem Industrial',
    desc: 'Processos qualificados, soldadores experientes e acabamento técnico para cada aplicação.',
  },
  {
    icon: Settings,
    title: 'Manutenção Industrial',
    desc: 'Atendimento preventivo, preditivo e corretivo com foco em disponibilidade operacional.',
  },
  {
    icon: Building2,
    title: 'Estruturas Metálicas',
    desc: 'Projetos, fabricação e montagem de estruturas sob medida para ambientes industriais.',
  },
  {
    icon: Gauge,
    title: 'NR-13',
    desc: 'Adequação, inspeção, laudos, documentação técnica e suporte para conformidade.',
  },
  {
    icon: HardHat,
    title: 'Rigging',
    desc: 'Içamento e movimentação de cargas com planejamento, segurança e responsabilidade.',
  },
];

const portfolio = [
  { title: 'Vasos de Pressão', category: 'Caldeiraria pesada', image: portfolioVasos },
  { title: 'Tubulações Industriais', category: 'Montagem e soldagem', image: portfolioTubulacoes },
  { title: 'Estruturas Metálicas', category: 'Projetos sob medida', image: portfolioEstruturas },
  { title: 'Manutenção Industrial', category: 'Plantas e utilidades', image: portfolioTanques },
  { title: 'Caldeiraria Pesada', category: 'Equipamentos especiais', image: portfolioCaldeiraria },
  { title: 'Movimentação de Cargas', category: 'Rigging técnico', image: portfolioCargas },
];

const qualityItems = [
  {
    icon: Award,
    title: 'Qualidade',
    desc: 'Padrões e processos de alta performance.',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança',
    desc: 'Compromisso com a vida e o meio ambiente.',
  },
  {
    icon: Settings,
    title: 'Responsabilidade Técnica',
    desc: 'ART e documentação em conformidade.',
  },
];

const stats = [
  ['24h', 'retorno técnico'],
  ['NR-13', 'suporte documental'],
  ['100%', 'foco em segurança'],
];

function whatsappUrl(message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

function Brand() {
  return (
    <a href="#home" className="flex items-center gap-3 text-white" aria-label="IMEC Metalúrgica">
      <span className="relative grid h-12 w-12 place-items-center bg-[linear-gradient(135deg,#f7fbff,#89a6c6_48%,#10243a)] shadow-[0_0_24px_rgba(59,130,246,0.24)] [clip-path:polygon(50%_0,94%_25%,94%_75%,50%_100%,6%_75%,6%_25%)]">
        <span className="absolute h-7 w-4 border-l-[6px] border-r-[6px] border-[#071522]" />
        <span className="h-7 w-4 bg-blue-200/80 [clip-path:polygon(50%_0,100%_26%,100%_74%,50%_100%,0_74%,0_26%)]" />
      </span>
      <span>
        <span className="block text-[32px] font-black leading-[0.82] tracking-normal">IMEC</span>
        <span className="block text-[11px] font-black uppercase tracking-[0.22em] text-blue-100">
          Metalúrgica
        </span>
      </span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-400/20 bg-[#020912]/95 text-white backdrop-blur-xl">
      <div className="mx-auto grid min-h-[68px] max-w-[1680px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 xl:grid-cols-[280px_1fr_auto] xl:px-16 2xl:px-24">
        <Brand />

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded border border-white/15 text-blue-100 xl:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav
          className={`${
            open ? 'flex' : 'hidden'
          } col-span-2 flex-col border-t border-white/10 py-3 xl:col-span-1 xl:flex xl:flex-row xl:items-center xl:justify-center xl:border-0 xl:py-0`}
        >
          {navItems.map(([href, label], index) => (
            <a
              key={href}
              href={href}
              className={`relative px-3 py-3 text-sm font-semibold text-blue-50/90 transition hover:text-white xl:grid xl:h-[68px] xl:place-items-center ${
                index === 0
                  ? 'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[3px] after:bg-blue-500 after:shadow-[0_0_18px_rgba(59,130,246,0.8)]'
                  : ''
              }`}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 2xl:flex">
          <a href={`tel:+${phoneNumber}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-50">
            <Phone className="h-4 w-4" />
            {phoneDisplay}
          </a>
          <a
            href={whatsappUrl('Olá! Gostaria de solicitar um orçamento com a IMEC Metalúrgica.')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded bg-blue-600 px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)] transition hover:bg-blue-500"
          >
            <MessageCircle className="h-4 w-4" />
            Solicitar Orçamento
          </a>
        </div>
      </div>
    </header>
  );
}

function SectionTitle({ eyebrow, title, link, href }) {
  return (
    <div>
      <span className="text-xs font-black uppercase tracking-wide text-blue-500">{eyebrow}</span>
      <h2 className="mt-2 max-w-[300px] text-2xl font-semibold leading-tight text-white">
        {title}
        <span className="mt-5 block h-[3px] w-12 bg-blue-500" />
      </h2>
      {link && (
        <a
          href={href}
          className="mt-6 inline-flex items-center gap-2 border border-blue-500 px-4 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500 hover:text-white"
        >
          {link}
          <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function ServiceCard({ item }) {
  const Icon = item.icon;
  return (
    <article className="min-h-[148px] rounded-md border border-slate-300/15 bg-[linear-gradient(145deg,rgba(24,44,64,.94),rgba(9,23,37,.94))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_18px_40px_rgba(0,0,0,.28)]">
      <Icon className="mb-3 h-11 w-11 text-blue-500" />
      <h3 className="text-[17px] font-bold leading-tight text-white">{item.title}</h3>
      <p className="mt-2 text-sm leading-5 text-slate-300">{item.desc}</p>
    </article>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    service: '',
    message: '',
  });

  const message = useMemo(() => {
    return [
      'Olá! Gostaria de solicitar um orçamento com a IMEC Metalúrgica.',
      form.name && `Nome: ${form.name}`,
      form.company && `Empresa: ${form.company}`,
      form.phone && `Telefone: ${form.phone}`,
      form.service && `Serviço: ${form.service}`,
      form.message && `Mensagem: ${form.message}`,
    ]
      .filter(Boolean)
      .join('\n');
  }, [form]);

  return (
    <form
      className="grid gap-3 rounded-md border border-slate-300/20 bg-[#0b1828]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,.25)]"
      onSubmit={(event) => {
        event.preventDefault();
        window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="min-h-[46px] rounded border border-slate-400/20 bg-[#06111d] px-4 text-sm text-white outline-none ring-blue-500 transition placeholder:text-slate-500 focus:ring-2"
          placeholder="Nome"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <input
          className="min-h-[46px] rounded border border-slate-400/20 bg-[#06111d] px-4 text-sm text-white outline-none ring-blue-500 transition placeholder:text-slate-500 focus:ring-2"
          placeholder="Empresa"
          value={form.company}
          onChange={(event) => setForm({ ...form, company: event.target.value })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="min-h-[46px] rounded border border-slate-400/20 bg-[#06111d] px-4 text-sm text-white outline-none ring-blue-500 transition placeholder:text-slate-500 focus:ring-2"
          placeholder="Telefone / WhatsApp"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          required
        />
        <select
          className="min-h-[46px] rounded border border-slate-400/20 bg-[#06111d] px-4 text-sm text-white outline-none ring-blue-500 transition focus:ring-2"
          value={form.service}
          onChange={(event) => setForm({ ...form, service: event.target.value })}
        >
          <option value="">Serviço de interesse</option>
          {services.map((service) => (
            <option key={service.title} value={service.title}>
              {service.title}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="min-h-[112px] resize-y rounded border border-slate-400/20 bg-[#06111d] px-4 py-3 text-sm text-white outline-none ring-blue-500 transition placeholder:text-slate-500 focus:ring-2"
        placeholder="Descreva sua necessidade"
        value={form.message}
        onChange={(event) => setForm({ ...form, message: event.target.value })}
        required
      />
      <button className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-500">
        Enviar pelo WhatsApp
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

export default function Landing() {
  return (
    <div id="home" className="min-h-screen bg-[#050d15] text-white">
      <Header />

      <main>
        <section
          className="relative grid min-h-[360px] items-center gap-10 overflow-hidden border-b border-slate-300/20 bg-cover bg-center px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-16 xl:px-24"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(3,10,18,.98), rgba(3,10,18,.72) 44%, rgba(3,10,18,.26) 70%, rgba(3,10,18,.86)), url(${heroImage})`,
          }}
        >
          <div className="max-w-4xl">
            <h1 className="max-w-[850px] text-[38px] font-black leading-[1.02] tracking-normal sm:text-5xl lg:text-[54px] 2xl:text-[58px]">
              Soluções Industriais com{' '}
              <span className="text-blue-500">Engenharia, Tecnologia</span> e Confiança
            </h1>
            <span className="mt-6 block h-[3px] w-12 bg-blue-500" />
            <p className="mt-5 max-w-2xl text-lg leading-7 text-slate-300">
              Excelência em caldeiraria, soldagem, manutenção industrial, estruturas metálicas e responsabilidade técnica.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href={whatsappUrl('Olá! Gostaria de solicitar um orçamento com a IMEC Metalúrgica.')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[46px] items-center justify-center gap-3 rounded bg-blue-600 px-7 text-sm font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)] transition hover:bg-blue-500"
              >
                Solicitar Orçamento
                <ChevronRight className="h-5 w-5" />
              </a>
              <a
                href="#servicos"
                className="inline-flex min-h-[46px] items-center justify-center gap-3 rounded border border-white/55 bg-black/20 px-7 text-sm font-black text-white transition hover:bg-white/10"
              >
                Ver Serviços
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          <aside className="hidden self-stretch content-center lg:grid">
            {qualityItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="grid grid-cols-[44px_1fr] gap-x-3 border-t border-slate-300/20 py-5 last:border-b">
                  <Icon className="row-span-2 h-10 w-10 text-blue-500" />
                  <b className="text-sm text-white">{item.title}</b>
                  <small className="text-[13px] leading-5 text-slate-300">{item.desc}</small>
                </article>
              );
            })}
          </aside>
        </section>

        <section id="servicos" className="grid gap-8 border-b border-slate-300/20 bg-[linear-gradient(180deg,#071624,#06111d)] px-4 py-5 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-16 xl:px-24">
          <SectionTitle eyebrow="Nossos Serviços" title="Soluções completas para a indústria" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {services.map((item) => (
              <ServiceCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section id="portfolio" className="grid gap-8 border-b border-slate-300/20 bg-[#06111d] px-4 py-5 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-16 xl:px-24">
          <SectionTitle eyebrow="Portfólio" title="Projetos que geram resultados" link="Ver Portfólio Completo" href="#galeria" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {portfolio.map((item) => (
              <article
                key={item.title}
                className="group flex min-h-[132px] overflow-hidden rounded-md border border-slate-300/20 bg-cover bg-center transition hover:-translate-y-1 hover:border-blue-500/60"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.04), rgba(0,0,0,.88)), url(${item.image})`,
                }}
              >
                <span className="mt-auto block w-full bg-black/60 px-3 py-2 text-center">
                  <strong className="block text-sm font-bold text-white">{item.title}</strong>
                  <small className="text-xs text-slate-300">{item.category}</small>
                </span>
              </article>
            ))}
          </div>
        </section>

        <section
          id="videos"
          className="grid gap-5 border-b border-slate-300/20 bg-cover bg-center px-4 py-4 sm:px-8 lg:grid-cols-3 lg:px-24"
          style={{
            backgroundImage: `linear-gradient(90deg,rgba(4,14,24,.94),rgba(8,31,52,.9)), url(${footerImage})`,
          }}
        >
          <a href="#videos" className="grid min-h-[106px] grid-cols-[72px_1fr] items-center gap-5 rounded-md border border-slate-300/20 bg-[linear-gradient(145deg,rgba(24,45,67,.92),rgba(12,27,43,.88))] px-6 py-5 transition hover:border-blue-500/60">
            <PlayCircle className="h-16 w-16 text-blue-500" />
            <span>
              <b className="block text-lg text-white">Vídeos</b>
              <small className="block text-sm leading-5 text-slate-300">Projetos, processos e bastidores das operações.</small>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-blue-400">
                Ver Vídeos <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </a>

          <a href="#contato" className="grid min-h-[106px] grid-cols-[72px_1fr] items-center gap-5 rounded-md border border-slate-300/20 bg-[linear-gradient(145deg,rgba(24,45,67,.92),rgba(12,27,43,.88))] px-6 py-5 transition hover:border-blue-500/60">
            <FileText className="h-16 w-16 text-blue-500" />
            <span>
              <b className="block text-lg text-white">Documentos</b>
              <small className="block text-sm leading-5 text-slate-300">Certificados, procedimentos, laudos e materiais técnicos.</small>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-blue-400">
                Solicitar Acesso <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </a>

          <Link to="/login" className="grid min-h-[106px] grid-cols-[72px_1fr] items-center gap-5 rounded-md border border-slate-300/20 bg-[linear-gradient(145deg,rgba(24,45,67,.92),rgba(12,27,43,.88))] px-6 py-5 transition hover:border-blue-500/60">
            <UserCircle className="h-16 w-16 text-blue-500" />
            <span>
              <b className="block text-lg text-white">Portal do Cliente</b>
              <small className="block text-sm leading-5 text-slate-300">Demandas, ordens de serviço, documentos e relatórios.</small>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-blue-400">
                Acessar Portal <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </Link>
        </section>

        <section id="quem-somos" className="border-b border-slate-300/20 bg-[#071523] px-4 py-16 sm:px-8 lg:px-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[360px_1fr]">
            <SectionTitle eyebrow="Quem Somos" title="Metalúrgica com rotina técnica e foco em segurança" />
            <div className="grid gap-5 md:grid-cols-3">
              {qualityItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-md border border-slate-300/20 bg-[#101f30] p-6">
                    <Icon className="mb-4 h-8 w-8 text-blue-500" />
                    <b className="block text-white">{item.title}</b>
                    <span className="mt-2 block text-sm leading-6 text-slate-300">{item.desc}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="galeria" className="border-b border-slate-300/20 bg-[#06111d] px-4 py-16 sm:px-8 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
              <SectionTitle eyebrow="Galeria" title="Imagens industriais recriadas para apresentar a operação" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.map((item) => (
                  <figure key={item.title} className="overflow-hidden rounded-md border border-slate-300/20 bg-[#101f30]">
                    <img src={item.image} alt={item.title} className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105" />
                    <figcaption className="px-4 py-3 text-sm font-bold text-white">{item.title}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contato" className="bg-[#071523] px-4 py-16 sm:px-8 lg:px-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[420px_1fr]">
            <div>
              <SectionTitle eyebrow="Contato" title="Conte sua demanda industrial para a IMEC" />
              <p className="mt-6 text-sm leading-6 text-slate-300">
                Envie sua necessidade para atendimento técnico em caldeiraria, soldagem, manutenção, estruturas metálicas, NR-13 e rigging.
              </p>
              <div className="mt-6 grid gap-3">
                <a href={`tel:+${phoneNumber}`} className="flex items-center gap-3 text-sm text-slate-200 hover:text-white">
                  <Phone className="h-5 w-5 text-blue-500" /> {phoneDisplay}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-slate-200 hover:text-white">
                  <Mail className="h-5 w-5 text-blue-500" /> {email}
                </a>
                <span className="flex items-center gap-3 text-sm text-slate-200">
                  <MapPin className="h-5 w-5 text-blue-500" /> Joinville - SC, Brasil
                </span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {stats.map(([value, label]) => (
                  <div key={label} className="rounded border border-slate-300/20 bg-[#101f30] p-4">
                    <strong className="block text-xl text-white">{value}</strong>
                    <span className="mt-1 block text-xs leading-4 text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="bg-[#030910] text-slate-300">
        <div className="grid gap-8 border-b border-slate-300/15 px-4 py-8 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1.4fr_1.2fr] lg:px-24">
          <div>
            <Brand />
            <p className="mt-5 max-w-sm text-sm leading-6">
              Soluções industriais com engenharia, tecnologia e confiança para entregar valor e segurança em cada projeto.
            </p>
            <div className="mt-4 flex gap-2 text-xs text-blue-200">
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Qualidade</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Segurança</span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-black uppercase text-white">Navegação</h4>
            {navItems.slice(0, 6).map(([href, label]) => (
              <a key={href} href={href} className="block py-1 text-sm hover:text-white">
                {label}
              </a>
            ))}
          </div>

          <div>
            <h4 className="mb-3 text-xs font-black uppercase text-white">Contato</h4>
            <a href={`tel:+${phoneNumber}`} className="flex items-center gap-2 py-1 text-sm hover:text-white">
              <Phone className="h-4 w-4" /> {phoneDisplay}
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-2 py-1 text-sm hover:text-white">
              <Mail className="h-4 w-4" /> {email}
            </a>
            <span className="flex items-center gap-2 py-1 text-sm">
              <MapPin className="h-4 w-4" /> Joinville - SC, Brasil
            </span>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-black uppercase text-white">Redes Sociais</h4>
            <div className="flex gap-3">
              {[Linkedin, Instagram, Youtube].map((Icon, index) => (
                <a key={index} href="#contato" className="grid h-10 w-10 place-items-center rounded-full border border-slate-300/30 text-white hover:border-blue-500 hover:text-blue-400">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 text-xs sm:px-8 md:flex-row md:items-center md:justify-between lg:px-24">
          <span>© 2026 IMEC Metalúrgica. Todos os direitos reservados.</span>
          <span>Desenvolvido com tecnologia e performance.</span>
        </div>

        <a href="#home" className="fixed bottom-6 right-6 grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-950/40 hover:bg-blue-500" aria-label="Voltar ao topo">
          <ArrowUp className="h-5 w-5" />
        </a>
      </footer>
    </div>
  );
}
