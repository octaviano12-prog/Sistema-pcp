import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { AlertTriangle, CheckCircle, FileText, Plus, RefreshCw, Search, ShieldCheck, XCircle } from 'lucide-react';

const statusLabels = {
  draft: 'Rascunho',
  processing: 'Processando',
  authorized: 'Autorizada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada',
};

const statusClasses = {
  draft: 'badge-gray',
  processing: 'badge-blue',
  authorized: 'badge-green',
  rejected: 'badge-red',
  cancelled: 'badge-orange',
};

const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-';

export default function FiscalInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [invoiceData, orderData] = await Promise.all([
        api.get('/fiscal-invoices'),
        api.get('/sales-orders'),
      ]);
      setInvoices(invoiceData);
      setOrders(orderData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createInvoice = async () => {
    if (!selectedOrder) return alert('Selecione um pedido para gerar a nota.');
    setSaving(true);
    try {
      await api.post('/fiscal-invoices', { sales_order_id: Number(selectedOrder) });
      setSelectedOrder('');
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const issueInvoice = async (id) => {
    setSaving(true);
    try {
      await api.post(`/fiscal-invoices/${id}/issue`, {});
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelInvoice = async (id) => {
    if (!confirm('Cancelar esta nota fiscal demonstrativa?')) return;
    setSaving(true);
    try {
      await api.post(`/fiscal-invoices/${id}/cancel`, { reason: 'Cancelamento demonstrativo realizado pelo sistema.' });
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const term = search.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(term) ||
      invoice.customer_name?.toLowerCase().includes(term) ||
      invoice.order_number?.toLowerCase().includes(term) ||
      invoice.access_key?.toLowerCase().includes(term)
    );
  });

  const stats = [
    { label: 'Notas autorizadas', value: invoices.filter(i => i.status === 'authorized').length, icon: CheckCircle, tone: 'text-emerald-700 bg-emerald-50' },
    { label: 'Em processamento', value: invoices.filter(i => i.status === 'processing' || i.status === 'draft').length, icon: RefreshCw, tone: 'text-blue-700 bg-blue-50' },
    { label: 'Pendências fiscais', value: invoices.filter(i => i.status === 'rejected').length, icon: AlertTriangle, tone: 'text-red-700 bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary-600" />
            <h1 className="page-title">Nota Fiscal Integrada</h1>
          </div>
          <p className="page-subtitle">Demonstração de emissão NF-e vinculada aos pedidos de venda.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Ambiente de homologação demonstrativo
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h3 className="font-semibold text-gray-900">Gerar nota a partir do pedido</h3>
            <p className="mt-1 text-sm text-gray-500">Selecione um pedido de venda e crie a NF-e demonstrativa vinculada.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select className="input min-w-[280px]" value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)}>
              <option value="">Selecione um pedido...</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>{order.order_number} - {order.customer_name}</option>
              ))}
            </select>
            <button onClick={createInvoice} disabled={saving} className="btn-primary justify-center">
              <Plus className="h-4 w-4" />
              Gerar NF-e
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Notas fiscais</h3>
            <p className="mt-1 text-sm text-gray-500">Lista demonstrativa para mostrar integração fiscal ao cliente.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="bg-transparent text-sm outline-none" placeholder="Buscar nota, cliente..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Nota</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Emissão</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Chave de acesso</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading && <tr><td colSpan={8} className="py-8 text-center text-gray-400">Carregando notas...</td></tr>}
              {!loading && filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="font-mono font-semibold text-sm">{invoice.invoice_number}</td>
                  <td className="font-mono text-xs">{invoice.order_number || '-'}</td>
                  <td>{invoice.customer_name || '-'}</td>
                  <td className="text-xs">{formatDate(invoice.issue_date)}</td>
                  <td className="font-medium">{formatCurrency(invoice.total_value)}</td>
                  <td><span className={`badge ${statusClasses[invoice.status] || 'badge-gray'}`}>{statusLabels[invoice.status] || invoice.status}</span></td>
                  <td className="max-w-[260px] truncate font-mono text-xs text-gray-500">{invoice.access_key || invoice.error_message || 'Aguardando emissão'}</td>
                  <td className="text-right">
                    {invoice.status !== 'authorized' && invoice.status !== 'cancelled' && (
                      <button onClick={() => issueInvoice(invoice.id)} disabled={saving} className="mr-2 text-xs font-semibold text-primary-600 hover:text-primary-800">Emitir</button>
                    )}
                    {invoice.status === 'authorized' && (
                      <button onClick={() => cancelInvoice(invoice.id)} disabled={saving} className="text-xs font-semibold text-red-600 hover:text-red-800">Cancelar</button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filteredInvoices.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">Nenhuma nota encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>Esta tela demonstra a integração fiscal. Para emissão real, é necessário contratar/configurar certificado digital, ambiente SEFAZ e provedor fiscal.</span>
        </div>
      </div>
    </div>
  );
}
