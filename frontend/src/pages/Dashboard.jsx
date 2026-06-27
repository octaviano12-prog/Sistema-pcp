import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ClipboardList, AlertTriangle, CheckCircle, Factory, Package, DollarSign, TrendingUp, AlertCircle, Clock } from 'lucide-react';

const COLORS = ['#1e40af', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#6b7280', '#06b6d4'];
const statusLabels = { planned: 'Planejada', released: 'Liberada', in_production: 'Em produção', paused: 'Pausada', finished: 'Finalizada', cancelled: 'Cancelada', delayed: 'Atrasada' };
const formatNumber = (value) => Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [charts, setCharts] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary').then(setSummary).catch(() => {}),
      api.get('/dashboard/charts').then(setCharts).catch(() => {}),
      api.get('/dashboard/alerts').then(setAlerts).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" /></div>;

  const stats = [
    { label: 'OPs Abertas', value: summary.openOps || 0, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'OPs Atrasadas', value: summary.delayedOps || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Finalizadas no Mês', value: summary.finishedThisMonth || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Produção Hoje', value: formatNumber(summary.todayProduction), icon: Factory, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Estoque Crítico', value: summary.criticalStock || 0, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Custo Previsto (Mês)', value: formatCurrency(summary.plannedCostMonth), icon: DollarSign, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { label: 'Custo Real (Mês)', value: formatCurrency(summary.realCostMonth), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Refugos (Mês)', value: formatNumber(summary.totalScrap), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  const pieData = (charts.statusDist || []).map(s => ({ name: statusLabels[s.status] || s.status, value: s.count }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Dashboard de Produção</h1>
          <p className="page-subtitle">Indicadores operacionais, custos, estoque e alertas em tempo real.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <Clock className="h-4 w-4" />
          Atualizado automaticamente
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="mb-2 flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-[18px] w-[18px] ${s.color}`} />
              </div>
            </div>
            <p className="stat-value break-words">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900">Produção dos últimos 7 dias</h3>
          {(charts.dailyProd || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.dailyProd}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [formatNumber(v), 'Produzido']} />
                <Bar dataKey="total" fill="#1e40af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">Sem dados de produção recente</div>}
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900">Status das Ordens de Produção</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="ml-auto font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">Sem dados</div>}
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900">Produtos mais fabricados</h3>
          {(charts.topProducts || []).length > 0 ? (
            <div className="space-y-3">
              {charts.topProducts.map((p, i) => (
                <div key={`${p.name}-${i}`} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">{i + 1}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                      <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${(p.total / charts.topProducts[0].total) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{formatNumber(p.total)} un</span>
                </div>
              ))}
            </div>
          ) : <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">Sem dados</div>}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-900">Alertas operacionais</h3>
            <span className="badge badge-orange">{alerts.length} pendências</span>
          </div>
          {alerts.length > 0 ? (
            <div className="max-h-[250px] space-y-2 overflow-y-auto">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 rounded-lg p-2.5 text-sm ${a.type === 'critical' ? 'bg-red-50 text-red-700' : a.type === 'danger' ? 'bg-red-50 text-red-700' : a.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{a.message}</span>
                </div>
              ))}
            </div>
          ) : <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">Nenhum alerta</div>}
        </div>
      </div>
    </div>
  );
}
