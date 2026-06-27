import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ClipboardList, AlertTriangle, CheckCircle, Factory, Package, DollarSign, TrendingUp, AlertCircle, Clock } from 'lucide-react';

const COLORS = ['#1e40af', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#6b7280', '#06b6d4'];
const statusLabels = { planned: 'Planejada', released: 'Liberada', in_production: 'Em produção', paused: 'Pausada', finished: 'Finalizada', cancelled: 'Cancelada', delayed: 'Atrasada' };
const statusColors = { planned: 'bg-gray-100 text-gray-800', released: 'bg-blue-100 text-blue-800', in_production: 'bg-green-100 text-green-800', paused: 'bg-yellow-100 text-yellow-800', finished: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-red-100 text-red-800', delayed: 'bg-red-100 text-red-800' };

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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  const stats = [
    { label: 'OPs Abertas', value: summary.openOps || 0, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'OPs Atrasadas', value: summary.delayedOps || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Finalizadas no Mês', value: summary.finishedThisMonth || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Produção Hoje', value: summary.todayProduction || 0, icon: Factory, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Estoque Crítico', value: summary.criticalStock || 0, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Custo Previsto (Mês)', value: `R$ ${(summary.plannedCostMonth || 0).toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { label: 'Custo Real (Mês)', value: `R$ ${(summary.realCostMonth || 0).toLocaleString('pt-BR')}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Refugos (Mês)', value: summary.totalScrap || 0, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  const pieData = (charts.statusDist || []).map(s => ({ name: statusLabels[s.status] || s.status, value: s.count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral da produção</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}><s.icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: 18, height: 18 }} /></div>
            </div>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Production chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Produção dos últimos 7 dias</h3>
          {(charts.dailyProd || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.dailyProd}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [v, 'Produzido']} />
                <Bar dataKey="total" fill="#1e40af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">Sem dados de produção recente</div>}
        </div>

        {/* Status distribution */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Status das Ordens de Produção</h3>
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
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-medium ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">Sem dados</div>}
        </div>

        {/* Top products */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Produtos mais fabricados</h3>
          {(charts.topProducts || []).length > 0 ? (
            <div className="space-y-3">
              {charts.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${(p.total / charts.topProducts[0].total) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{p.total} un</span>
                </div>
              ))}
            </div>
          ) : <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Sem dados</div>}
        </div>

        {/* Alerts */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Alertas</h3>
          {alerts.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-sm ${a.type === 'critical' ? 'bg-red-50 text-red-700' : a.type === 'danger' ? 'bg-red-50 text-red-700' : a.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{a.message}</span>
                </div>
              ))}
            </div>
          ) : <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Nenhum alerta</div>}
        </div>
      </div>
    </div>
  );
}
