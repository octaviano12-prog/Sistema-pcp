import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { BarChart3, Building2, CreditCard, FileText, Users } from 'lucide-react';

const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminSalesPanel() {
  const [panel, setPanel] = useState({ totals: {}, companies: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/sales-panel')
      .then(setPanel)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" /></div>;

  const cards = [
    { label: 'Empresas', value: panel.totals.companies || 0, icon: Building2, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Clientes ativos', value: panel.totals.activeCompanies || 0, icon: Users, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'MRR estimado', value: formatCurrency(panel.totals.monthlyRecurring), icon: CreditCard, tone: 'bg-purple-50 text-purple-700' },
    { label: 'NF-e autorizadas', value: panel.totals.authorizedInvoices || 0, icon: FileText, tone: 'bg-orange-50 text-orange-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary-600" />
          <h1 className="page-title">Painel Comercial</h1>
        </div>
        <p className="page-subtitle">Visão para vender e acompanhar clientes do PCP Pro Industrial.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="stat-card flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.tone}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="stat-value">{card.value}</p>
              <p className="stat-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">Clientes / ambientes</h3>
          <p className="mt-1 text-sm text-gray-500">Dados comerciais estimados para demonstração e gestão SaaS.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Empresa</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Usuários</th>
                <th>Produtos</th>
                <th>Pedidos</th>
                <th>OPs</th>
                <th>NF-e</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {panel.companies.map(company => (
                <tr key={company.id}>
                  <td><p className="font-medium">{company.trade_name || company.name}</p><p className="text-xs text-gray-500">{company.cnpj}</p></td>
                  <td><span className="badge badge-blue">{company.plan}</span></td>
                  <td><span className={company.status === 'active' ? 'badge badge-green' : 'badge badge-gray'}>{company.status}</span></td>
                  <td>{company.users_count}</td>
                  <td>{company.products_count}</td>
                  <td>{company.orders_count}</td>
                  <td>{company.production_orders_count}</td>
                  <td>{company.authorized_invoices}</td>
                </tr>
              ))}
              {panel.companies.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">Nenhum cliente encontrado</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
