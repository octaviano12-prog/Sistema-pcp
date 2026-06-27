import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Factory,
  FileSpreadsheet,
  Lock,
  Menu,
  Package,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  Target,
  Warehouse,
  X,
  Zap,
} from 'lucide-react';

const modules = [
  { icon: ShoppingCart, title: 'Pedidos de venda', desc: 'Prazos, clientes, prioridades e status em uma visão única.' },
  { icon: Package, title: 'Produtos e ficha técnica', desc: 'Composição, matéria-prima, unidades, custos e roteiros.' },
  { icon: Warehouse, title: 'Estoque industrial', desc: 'Entradas, saídas, reservas, inventário e alertas de mínimo.' },
  { icon: Calendar, title: 'Planejamento PCP', desc: 'Organize o que produzir, quando produzir e qual recurso usar.' },
  { icon: ClipboardList, title: 'Ordens de produção', desc: 'OPs digitais com materiais, operações, tempos e apontamentos.' },
  { icon: BarChart3, title: 'Indicadores e relatórios', desc: 'Dashboards de produção, custos, estoque, atrasos e eficiência.' },
];

const plans = [
  { name: 'Starter', price: '147', desc: 'Para pequenas fábricas saírem da planilha.', features: ['Até 3 usuários', 'Produtos e estoque', 'Ordens de produção', 'Dashboard básico'] },
  { name: 'Profissional', price: '297', desc: 'Para operação em crescimento com PCP ativo.', features: ['Até 10 usuários', 'Ficha técnica completa', 'Apontamento de produção', 'Relatórios e custos'], highlight: true },
  { name: 'Industrial', price: '597', desc: 'Para operação completa com vários setores.', features: ['Usuários ilimitados', 'MRP e carga máquina', 'Controle de qualidade', 'Suporte prioritário'] },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-sm font-bold leading-tight text-gray-950">PCP Pro</span>
              <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-500">Industrial</span>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a href="#recursos" className="text-sm font-medium text-gray-600 hover:text-primary-700">Recursos</a>
            <a href="#planos" className="text-sm font-medium text-gray-600 hover:text-primary-700">Planos</a>
            <a href="#contato" className="text-sm font-medium text-gray-600 hover:text-primary-700">Contato</a>
            <Link to="/login" className="btn-primary">Acessar sistema</Link>
          </div>

          <button className="rounded-lg p-2 text-gray-600 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="space-y-3 border-t border-gray-100 bg-white px-4 py-4 md:hidden">
            <a href="#recursos" className="block text-sm font-medium text-gray-600">Recursos</a>
            <a href="#planos" className="block text-sm font-medium text-gray-600">Planos</a>
            <a href="#contato" className="block text-sm font-medium text-gray-600">Contato</a>
            <Link to="/login" className="btn-primary justify-center">Acessar sistema</Link>
          </div>
        )}
      </nav>

      <section className="overflow-hidden bg-gray-950 pt-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8 lg:pb-20">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-blue-100">
              <Zap className="h-4 w-4 text-amber-300" />
              Sistema online para controle de produção industrial
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              PCP Pro Industrial
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
              Controle pedidos, estoque, fichas técnicas, ordens de produção, apontamentos e custos em uma plataforma pronta para pequenas e médias indústrias.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#contato" className="btn-accent justify-center px-6 py-3 text-base">
                Solicitar demonstração
                <ChevronRight className="h-5 w-5" />
              </a>
              <Link to="/login" className="btn-secondary justify-center border-white/20 bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20">
                <PlayCircle className="h-5 w-5" />
                Ver sistema
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-gray-300 sm:grid-cols-3">
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Demo pronta</span>
              <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-400" /> Acesso por perfil</span>
              <span className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Menos planilhas</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white p-4 text-gray-900 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dashboard</p>
                <p className="text-sm font-bold text-gray-950">Metalúrgica Modelo</p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Online</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['OPs abertas', '24', 'bg-blue-50 text-blue-700'],
                ['Em produção', '12', 'bg-emerald-50 text-emerald-700'],
                ['Atrasadas', '3', 'bg-red-50 text-red-700'],
                ['Eficiência', '87%', 'bg-amber-50 text-amber-700'],
              ].map(([label, value, tone]) => (
                <div key={label} className={`rounded-lg p-4 ${tone}`}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-xs font-medium text-gray-600">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-gray-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Produção semanal</p>
                <p className="text-xs font-medium text-emerald-700">+18%</p>
              </div>
              <div className="flex h-32 items-end gap-2">
                {[48, 62, 55, 76, 68, 90, 72].map((height, index) => (
                  <div key={index} className="flex-1 rounded-t bg-primary-600" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>3 itens abaixo do estoque mínimo precisam de atenção hoje.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Recursos</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950">Tudo que o PCP precisa para rodar a fábrica com mais controle</h2>
            <p className="mt-3 text-gray-600">Módulos conectados para que pedido, estoque e produção conversem entre si sem retrabalho.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-primary-200 hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[420px_1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Resultado</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950">Menos improviso. Mais previsibilidade.</h2>
            <p className="mt-4 text-gray-600">O sistema organiza o fluxo de produção para que o gestor enxergue gargalos antes que eles virem atraso.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Target, title: 'Prazos sob controle', desc: 'Acompanhe pedidos e OPs por prioridade e data de entrega.' },
              { icon: BarChart3, title: 'Decisão por indicador', desc: 'Veja produção, custos, refugos e estoque crítico em tempo real.' },
              { icon: ShieldCheck, title: 'Acesso seguro', desc: 'Perfis para administrativo, PCP, produção, estoque e financeiro.' },
              { icon: CheckCircle, title: 'Venda com demonstração', desc: 'Dados de exemplo prontos para apresentar o fluxo completo ao cliente.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <item.icon className="mb-4 h-6 w-6 text-primary-700" />
                <h3 className="font-semibold text-gray-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Planos</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950">Comece simples e evolua conforme a operação cresce</h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-xl border p-6 ${plan.highlight ? 'border-primary-600 bg-primary-600 text-white shadow-xl' : 'border-gray-200 bg-white'}`}>
                {plan.highlight && <span className="mb-4 inline-flex rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold">Mais escolhido</span>}
                <h3 className={`text-xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-950'}`}>{plan.name}</h3>
                <p className={`mt-2 text-sm leading-6 ${plan.highlight ? 'text-primary-50' : 'text-gray-600'}`}>{plan.desc}</p>
                <div className="my-6">
                  <span className="text-4xl font-bold">R${plan.price}</span>
                  <span className={plan.highlight ? 'text-primary-100' : 'text-gray-500'}>/mês</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${plan.highlight ? 'text-emerald-200' : 'text-emerald-600'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#contato" className={`mt-6 block rounded-lg px-4 py-3 text-center text-sm font-semibold ${plan.highlight ? 'bg-white text-primary-700 hover:bg-gray-100' : 'bg-gray-950 text-white hover:bg-gray-800'}`}>
                  Quero esse plano
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="bg-primary-700 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Pronto para apresentar o PCP Pro para uma indústria?</h2>
          <p className="mt-4 text-lg leading-8 text-primary-50">
            Entre pelo sistema, use os dados de demonstração e mostre um fluxo completo: pedido, estoque, produção, apontamento e dashboard.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3 font-semibold text-primary-700 hover:bg-gray-100">
              Acessar demonstração
              <ChevronRight className="h-5 w-5" />
            </Link>
            <a href="https://wa.me/5511999990000?text=Olá! Gostaria de solicitar uma demonstração do PCP Pro Industrial." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-7 py-3 font-semibold text-white hover:bg-white/20">
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-950 px-4 py-10 text-gray-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">PCP Pro Industrial</p>
              <p className="text-sm">Controle sua produção do pedido à entrega.</p>
            </div>
          </div>
          <p className="text-sm">© 2026 PCP Pro Industrial. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
