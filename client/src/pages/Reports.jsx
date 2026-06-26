import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download } from 'lucide-react';

const COLORS = ['#1e40af', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export default function Reports() {
  const [reportType, setReportType] = useState('production');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ start_date: '', end_date: '' });

  const loadReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (reportType) {
        case 'production': endpoint = `/reports/production?start_date=${filters.start_date}&end_date=${filters.end_date}`; break;
        case 'costs': endpoint = '/reports/costs'; break;
        case 'stock': endpoint = '/reports/stock'; break;
        default: endpoint = '/reports/production';
      }
      const result = await api.get(endpoint);
      setData(result);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadReport(); }, [reportType]);

  const reports = [
    { id: 'production', label: 'Ordens de Produção' },
    { id: 'costs', label: 'Custos' },
    { id: 'stock', label: 'Estoque Crítico' },
  ];

  const exportCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(r => Object.values(r).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="page-title">Relatórios</h1><p className="page-subtitle">Análise e exportação de dados</p></div>
        <button onClick={exportCSV} className="btn-secondary"><Download className="w-4 h-4" /> Exportar CSV</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {reports.map(r => (
            <button key={r.id} onClick={() => setReportType(r.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reportType === r.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{r.label}</button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <input type="date" className="input w-auto" value={filters.start_date} onChange={e => setFilters({ ...filters, start_date: e.target.value })} />
          <input type="date" className="input w-auto" value={filters.end_date} onChange={e => setFilters({ ...filters, end_date: e.target.value })} />
          <button onClick={loadReport} className="btn-primary">Filtrar</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : reportType === 'production' ? (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header"><tr><th>OP</th><th>Produto</th><th>Cliente</th><th>Qtd Plan.</th><th>Qtd Prod.</th><th>Qtd Rej.</th><th>Custo Prev.</th><th>Custo Real</th><th>Status</th></tr></thead>
            <tbody className="table-body">
              {data.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-sm">{r.order_number}</td>
                  <td className="font-medium">{r.product_name}</td>
                  <td>{r.customer_name || '-'}</td>
                  <td>{r.planned_quantity}</td>
                  <td className="text-green-600">{r.produced_quantity || 0}</td>
                  <td className="text-red-600">{r.rejected_quantity || 0}</td>
                  <td>R$ {(r.planned_cost || 0).toFixed(2)}</td>
                  <td>R$ {(r.real_cost || 0).toFixed(2)}</td>
                  <td><span className="badge badge-blue">{r.status}</span></td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-gray-400">Sem dados</td></tr>}
            </tbody>
          </table>
        </div>
      ) : reportType === 'costs' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card"><p className="stat-label">Total Previsto</p><p className="stat-value">R$ {data.reduce((s, r) => s + (r.planned_cost || 0), 0).toFixed(2)}</p></div>
            <div className="stat-card"><p className="stat-label">Total Real</p><p className="stat-value">R$ {data.reduce((s, r) => s + (r.real_cost || 0), 0).toFixed(2)}</p></div>
            <div className="stat-card"><p className="stat-label">Variação</p><p className="stat-value">{data.length > 0 ? ((data.reduce((s, r) => s + (r.real_cost || 0), 0) / data.reduce((s, r) => s + (r.planned_cost || 0), 1) - 1) * 100).toFixed(1) : 0}%</p></div>
          </div>
          <div className="table-container">
            <table className="w-full">
              <thead className="table-header"><tr><th>OP</th><th>Produto</th><th>Qtd</th><th>Custo Prev.</th><th>Custo Real</th><th>Diferença</th><th>Variação</th></tr></thead>
              <tbody className="table-body">
                {data.map((r, i) => (
                  <tr key={i}>
                    <td className="font-mono text-sm">{r.order_number}</td>
                    <td className="font-medium">{r.product_name}</td>
                    <td>{r.produced_quantity}</td>
                    <td>R$ {(r.planned_cost || 0).toFixed(2)}</td>
                    <td>R$ {(r.real_cost || 0).toFixed(2)}</td>
                    <td className={r.difference > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>R$ {(r.difference || 0).toFixed(2)}</td>
                    <td className={r.variation_pct > 0 ? 'text-red-600' : 'text-green-600'}>{r.variation_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header"><tr><th>Código</th><th>Produto</th><th>Un.</th><th>Estoque</th><th>Mínimo</th><th>Máximo</th><th>Valor Total</th><th>Status</th></tr></thead>
            <tbody className="table-body">
              {data.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs">{r.code}</td>
                  <td className="font-medium">{r.name}</td>
                  <td>{r.unit}</td>
                  <td className="font-medium">{r.current_stock?.toFixed(1)}</td>
                  <td>{r.min_stock}</td>
                  <td>{r.max_stock}</td>
                  <td>R$ {(r.total_value || 0).toFixed(2)}</td>
                  <td><span className={`badge ${r.status === 'critical' ? 'badge-red' : 'badge-yellow'}`}>{r.status === 'critical' ? 'Crítico' : 'Baixo'}</span></td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhum item com estoque crítico</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
