import { Link } from 'react-router-dom';
import { Factory, BarChart3, Package, ClipboardList, Warehouse, Calendar, Users, ShoppingCart, TrendingUp, CheckCircle, AlertTriangle, Clock, DollarSign, Eye, Target, Zap, Shield, ChevronRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center"><Factory className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-lg text-gray-900">PCP Pro</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm text-gray-600 hover:text-primary-600">Recursos</a>
            <a href="#segmentos" className="text-sm text-gray-600 hover:text-primary-600">Segmentos</a>
            <a href="#planos" className="text-sm text-gray-600 hover:text-primary-600">Planos</a>
            <a href="#contato" className="text-sm text-gray-600 hover:text-primary-600">Contato</a>
            <Link to="/login" className="btn-primary text-sm">Acessar Sistema</Link>
          </div>
          <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <a href="#recursos" className="block text-sm text-gray-600">Recursos</a>
            <a href="#segmentos" className="block text-sm text-gray-600">Segmentos</a>
            <a href="#planos" className="block text-sm text-gray-600">Planos</a>
            <Link to="/login" className="btn-primary w-full justify-center">Acessar Sistema</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #f97316 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-600/20 text-primary-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" /> Sistema de Gestão PCP para Empresas Industriais
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Planeje, acompanhe e <span className="text-primary-400">controle sua produção</span> em tempo real.
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                Controle pedidos, produção, estoque, ordens de produção, custos e indicadores em uma única plataforma online.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contato" className="btn-accent justify-center text-base px-6 py-3">Solicitar Demonstração</a>
                <Link to="/login" className="btn-secondary justify-center text-base px-6 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20">Acessar Sistema</Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> Teste grátis 14 dias</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> Sem cartão de crédito</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-gray-400 text-xs ml-2">Dashboard PCP Pro</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[{ l: 'OPs Abertas', v: '24', c: 'text-blue-400' }, { l: 'Em Produção', v: '12', c: 'text-green-400' }, { l: 'Atrasadas', v: '3', c: 'text-red-400' }, { l: 'Eficiência', v: '87%', c: 'text-orange-400' }].map((s, i) => (
                    <div key={i} className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">{s.l}</p>
                      <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-2">Produção Semanal</p>
                  <div className="flex items-end gap-1.5 h-20">
                    {[40, 65, 55, 80, 70, 90, 60].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary-500/60 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => <span key={i} className="text-[10px] text-gray-500 flex-1 text-center">{d}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Problemas que o PCP Pro resolve</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Se sua empresa enfrenta algum desses desafios, o PCP Pro foi feito para você.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Clock, title: 'Atrasos na produção', desc: 'Controle prazos e evite atrasos com planejamento inteligente' },
              { icon: AlertTriangle, title: 'Falta de matéria-prima', desc: 'Alertas automáticos de estoque mínimo e necessidade de compra' },
              { icon: Package, title: 'Sem controle de estoque', desc: 'Visão completa do estoque com movimentações em tempo real' },
              { icon: ClipboardList, title: 'OPs no papel', desc: 'Ordens de produção digitais com apontamento online' },
              { icon: DollarSign, title: 'Custo real desconhecido', desc: 'Cálculo automático de custo previsto e real por OP' },
              { icon: Eye, title: 'Sem visão do chão de fábrica', desc: 'Dashboard com indicadores de produção em tempo real' },
              { icon: TrendingUp, title: 'Perda de produtividade', desc: 'Identifique gargalos e otimize sua produção' },
              { icon: Target, title: 'Falta de indicadores', desc: 'Relatórios e KPIs para tomada de decisão baseada em dados' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3"><item.icon className="w-5 h-5 text-red-600" /></div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="recursos" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Recursos completos para sua indústria</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Tudo que você precisa para controlar sua produção em um único sistema.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: ShoppingCart, title: 'Gestão de Pedidos', desc: 'Controle pedidos de venda, prazos, prioridades e status.' },
              { icon: Package, title: 'Cadastro de Produtos', desc: 'Produtos acabados, matéria-prima, insumos e embalagens.' },
              { icon: ClipboardList, title: 'Ficha Técnica', desc: 'Composição completa de cada produto com custos.' },
              { icon: Warehouse, title: 'Controle de Estoque', desc: 'Entradas, saídas, reservas, inventário e alertas.' },
              { icon: Calendar, title: 'Planejamento PCP', desc: 'Planeje a produção com base em pedidos e capacidade.' },
              { icon: Factory, title: 'Ordem de Produção', desc: 'OPs digitais com materiais, operações e custos.' },
              { icon: BarChart3, title: 'Apontamento de Produção', desc: 'Operadores registram produção pelo celular ou PC.' },
              { icon: DollarSign, title: 'Custos Industriais', desc: 'Custo previsto vs real por OP e por produto.' },
              { icon: TrendingUp, title: 'Dashboard Gerencial', desc: 'KPIs, gráficos e alertas para decisão em tempo real.' },
              { icon: BarChart3, title: 'Relatórios', desc: 'Produção, custos, estoque, eficiência e muito mais.' },
              { icon: Users, title: 'Multiusuário', desc: 'Perfis de acesso: Admin, PCP, Produção, Estoque, etc.' },
              { icon: Shield, title: 'Seguro e Confiável', desc: 'Dados criptografados, backup e controle de acesso.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-600 transition-colors"><item.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" /></div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Benefícios para sua empresa</h2>
            <p className="text-primary-200 max-w-2xl mx-auto">Resultados reais desde o primeiro mês de uso.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Redução de atrasos', desc: 'Até 60% menos atrasos nas entregas' },
              { title: 'Menos perda de material', desc: 'Controle preciso de consumo e refugo' },
              { title: 'Mais organização', desc: 'Tudo digital, sem papel nem planilhas' },
              { title: 'Decisão baseada em dados', desc: 'Indicadores e relatórios em tempo real' },
              { title: 'Mais previsibilidade', desc: 'Saiba exatamente o que produzir e quando' },
              { title: 'Menos dependência de Excel', desc: 'Sistema centralizado e confiável' },
              { title: 'Melhor gestão de custos', desc: 'Saiba o custo real de cada produto' },
              { title: 'Mais produtividade', desc: 'Operação mais eficiente e organizada' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10">
                <CheckCircle className="w-6 h-6 text-green-400 mb-3" />
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-primary-200">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segments */}
      <section id="segmentos" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Segmentos atendidos</h2>
            <p className="text-gray-600">O PCP Pro é ideal para qualquer indústria que precisa controlar sua produção.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {['Metalúrgicas', 'Caldeirarias', 'Marcenarias', 'Ind. de Alimentos', 'Confecções', 'Fábricas sob Encomenda', 'Ind. de Bebidas', 'Cosméticos', 'Pequenas Fábricas', 'Ind. Química'].map((seg, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <Factory className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">{seg}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Planos e preços</h2>
            <p className="text-gray-600">Escolha o plano ideal para o tamanho da sua operação.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: '147', desc: 'Para pequenas empresas que estão começando.', features: ['Até 3 usuários', 'Cadastro de produtos', 'Estoque básico', 'Ordens de produção', 'Dashboard básico'], highlight: false },
              { name: 'Profissional', price: '297', desc: 'Para empresas em crescimento.', features: ['Até 10 usuários', 'Produtos ilimitados', 'Ficha técnica', 'Estoque completo', 'Apontamento de produção', 'Relatórios', 'Custos por OP'], highlight: true },
              { name: 'Industrial', price: '597', desc: 'Para operação completa.', features: ['Usuários ilimitados', 'MRP', 'Carga máquina', 'Controle de qualidade', 'Manutenção', 'API e Integrações', 'Suporte prioritário'], highlight: false },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 ${plan.highlight ? 'bg-primary-600 text-white ring-4 ring-primary-200 scale-105' : 'bg-white border border-gray-200'}`}>
                {plan.highlight && <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">Mais popular</span>}
                <h3 className={`text-xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <p className={`text-sm mt-1 ${plan.highlight ? 'text-primary-100' : 'text-gray-500'}`}>{plan.desc}</p>
                <div className="mt-4 mb-6">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>R${plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-primary-200' : 'text-gray-500'}`}>/mês</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-green-300' : 'text-green-500'}`} />
                      <span className={plan.highlight ? 'text-primary-50' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#contato" className={`w-full py-2.5 rounded-lg text-center text-sm font-medium block ${plan.highlight ? 'bg-white text-primary-600 hover:bg-gray-100' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>Começar agora</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contato" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Transforme o controle da sua produção</h2>
          <p className="text-primary-100 text-lg mb-8">Um sistema simples, moderno e completo para controlar sua produção do pedido à entrega.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/5511999990000?text=Olá! Gostaria de solicitar uma demonstração do PCP Pro Industrial." target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2 justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.32-2.237l-.455-.37-3.16 1.06 1.06-3.16-.37-.455A9.949 9.949 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" /></svg>
              Solicitar demonstração via WhatsApp
            </a>
            <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-8 rounded-lg transition-colors border border-white/20 inline-flex items-center justify-center gap-2">
              Acessar sistema <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><Factory className="w-4 h-4 text-white" /></div>
              <span className="font-bold text-white">PCP Pro Industrial</span>
            </div>
            <p className="text-sm">Controle sua produção do pedido à entrega.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#recursos" className="hover:text-white">Recursos</a></li>
              <li><a href="#planos" className="hover:text-white">Planos</a></li>
              <li><a href="#segmentos" className="hover:text-white">Segmentos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Sobre</a></li>
              <li><a href="#contato" className="hover:text-white">Contato</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Central de ajuda</a></li>
              <li><a href="#" className="hover:text-white">Documentação</a></li>
              <li><a href="#" className="hover:text-white">Status do sistema</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; 2024 PCP Pro Industrial. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
