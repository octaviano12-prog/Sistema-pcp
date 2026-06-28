import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { CheckCircle, Circle, ClipboardCheck, Database, FileText, Package, ShieldCheck, Users } from 'lucide-react';

const steps = [
  { key: 'company', title: 'Dados da empresa', desc: 'Razão social, CNPJ, endereço e contatos preenchidos.', icon: ClipboardCheck },
  { key: 'users', title: 'Usuários e permissões', desc: 'Equipe cadastrada com perfis de acesso.', icon: Users },
  { key: 'products', title: 'Produtos importados', desc: 'Produtos acabados, matérias-primas e insumos cadastrados.', icon: Package },
  { key: 'stock', title: 'Estoque inicial', desc: 'Saldos iniciais lançados por importação ou entrada manual.', icon: Database },
  { key: 'fiscal', title: 'Fiscal e NF-e', desc: 'Ambiente fiscal, provedor e certificado configurados.', icon: FileText },
  { key: 'security', title: 'Backup e segurança', desc: 'Backup automático e controle de acesso ativos.', icon: ShieldCheck },
];

export default function Implementation() {
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/company-settings').then(setSettings).catch(() => null),
      api.get('/products').then(setProducts).catch(() => []),
      api.get('/stock').then(setStock).catch(() => []),
      api.get('/users').then(setUsers).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" /></div>;

  const company = settings?.company || {};
  const fiscal = settings?.fiscal || {};
  const state = {
    company: Boolean(company.name && company.cnpj && company.email),
    users: users.length >= 2,
    products: products.length >= 3,
    stock: stock.some(item => Number(item.current_stock || 0) > 0),
    fiscal: Boolean(fiscal.fiscal_environment && fiscal.nfe_provider),
    security: fiscal.auto_backup !== 0 && fiscal.auto_backup !== false,
  };
  const done = Object.values(state).filter(Boolean).length;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6 text-primary-600" />
            <h1 className="page-title">Implantação do Cliente</h1>
          </div>
          <p className="page-subtitle">Checklist de preparação para transformar a demonstração em ambiente real.</p>
        </div>
        <span className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">{done}/{steps.length} etapas concluídas</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <p className="stat-value">{company.trade_name || company.name || 'Empresa demo'}</p>
          <p className="stat-label">Cliente em implantação</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{products.length}</p>
          <p className="stat-label">Produtos cadastrados</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{fiscal.fiscal_environment === 'production' ? 'Produção' : 'Homologação'}</p>
          <p className="stat-label">Ambiente fiscal</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {steps.map(step => {
          const Icon = step.icon;
          const complete = state[step.key];
          return (
            <div key={step.key} className={`rounded-xl border bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.07)] ${complete ? 'border-emerald-200' : 'border-amber-200'}`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${complete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    {complete ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-amber-600" />}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
                  <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${complete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {complete ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
        <p className="font-semibold">Roteiro de apresentação sugerido</p>
        <p className="mt-2">Mostre o pedido de venda, gere a OP, registre apontamento, confira estoque, emita NF-e demonstrativa e finalize com backup/configuração fiscal.</p>
      </div>
    </div>
  );
}
