import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ArrowLeft, Play, Pause, CheckCircle, XCircle, Printer } from 'lucide-react';

const statusLabels = { planned: 'Planejada', released: 'Liberada', in_production: 'Em produção', paused: 'Pausada', finished: 'Finalizada', cancelled: 'Cancelada', delayed: 'Atrasada', pending: 'Pendente', reserved: 'Reservado', in_progress: 'Em andamento', consumed: 'Consumido' };
const statusColors = { planned: 'badge-gray', released: 'badge-blue', in_production: 'badge-green', paused: 'badge-yellow', finished: 'badge-green', cancelled: 'badge-red', delayed: 'badge-red', pending: 'badge-gray', reserved: 'badge-blue', in_progress: 'badge-yellow', consumed: 'badge-green' };

export default function ProductionOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tab, setTab] = useState('general');

  useEffect(() => { api.get(`/production-orders/${id}`).then(setOrder); }, [id]);

  const handleAction = async (action) => {
    try { await api.post(`/production-orders/${id}/${action}`); api.get(`/production-orders/${id}`).then(setOrder); } catch (e) { alert(e.message); }
  };

  if (!order) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  const tabs = [
    { id: 'general', label: 'Dados Gerais' },
    { id: 'materials', label: 'Materiais' },
    { id: 'operations', label: 'Operações' },
    { id: 'logs', label: 'Apontamentos' },
    { id: 'costs', label: 'Custos' },
  ];

  const costDiff = (order.real_cost || 0) - (order.planned_cost || 0);
  const costVariation = order.planned_cost > 0 ? ((costDiff / order.planned_cost) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/production-orders')} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="page-title">{order.order_number}</h1>
            <span className={`badge ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
          </div>
          <p className="page-subtitle">{order.product_name} — {order.planned_quantity} unidades</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-secondary text-xs"><Printer className="w-3 h-3" /> Imprimir</button>
          {order.status === 'planned' && <button onClick={() => handleAction('release')} className="btn-primary text-xs"><Play className="w-3 h-3" /> Liberar</button>}
          {order.status === 'released' && <button onClick={() => handleAction('start')} className="btn-success text-xs"><Play className="w-3 h-3" /> Iniciar</button>}
          {order.status === 'in_production' && <button onClick={() => handleAction('pause')} className="btn-secondary text-xs"><Pause className="w-3 h-3" /> Pausar</button>}
          {order.status === 'paused' && <button onClick={() => handleAction('resume')} className="btn-success text-xs"><Play className="w-3 h-3" /> Retomar</button>}
          {(order.status === 'in_production' || order.status === 'paused') && <button onClick={() => handleAction('finish')} className="btn-success text-xs"><CheckCircle className="w-3 h-3" /> Finalizar</button>}
          {order.status !== 'finished' && order.status !== 'cancelled' && <button onClick={() => handleAction('cancel')} className="btn-danger text-xs"><XCircle className="w-3 h-3" /> Cancelar</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-900">Informações</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Produto:</span><p className="font-medium">{order.product_name}</p></div>
              <div><span className="text-gray-500">Código:</span><p className="font-medium">{order.product_code}</p></div>
              <div><span className="text-gray-500">Cliente:</span><p className="font-medium">{order.customer_name || '-'}</p></div>
              <div><span className="text-gray-500">Pedido:</span><p className="font-medium">{order.sales_order_number || '-'}</p></div>
              <div><span className="text-gray-500">Qtd Planejada:</span><p className="font-medium">{order.planned_quantity}</p></div>
              <div><span className="text-gray-500">Qtd Produzida:</span><p className="font-medium text-green-600">{order.produced_quantity || 0}</p></div>
              <div><span className="text-gray-500">Qtd Rejeitada:</span><p className="font-medium text-red-600">{order.rejected_quantity || 0}</p></div>
              <div><span className="text-gray-500">Prioridade:</span><p className="font-medium">{order.priority}</p></div>
              <div><span className="text-gray-500">Início Previsto:</span><p className="font-medium">{order.planned_start_date ? new Date(order.planned_start_date).toLocaleDateString('pt-BR') : '-'}</p></div>
              <div><span className="text-gray-500">Fim Previsto:</span><p className="font-medium">{order.planned_end_date ? new Date(order.planned_end_date).toLocaleDateString('pt-BR') : '-'}</p></div>
              <div><span className="text-gray-500">Início Real:</span><p className="font-medium">{order.real_start_date ? new Date(order.real_start_date).toLocaleDateString('pt-BR') : '-'}</p></div>
              <div><span className="text-gray-500">Fim Real:</span><p className="font-medium">{order.real_end_date ? new Date(order.real_end_date).toLocaleDateString('pt-BR') : '-'}</p></div>
            </div>
            {order.notes && <div className="pt-2 border-t"><span className="text-gray-500 text-sm">Observações:</span><p className="text-sm mt-1">{order.notes}</p></div>}
          </div>
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-900">Resumo de Custos</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Custo Previsto:</span><span className="font-medium">R$ {(order.planned_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Custo Real:</span><span className="font-medium">R$ {(order.real_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between pt-2 border-t"><span className="text-gray-500">Diferença:</span><span className={`font-bold ${costDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>R$ {costDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Variação:</span><span className={`font-bold ${costVariation > 0 ? 'text-red-600' : 'text-green-600'}`}>{costVariation}%</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'materials' && (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header"><tr><th>Produto</th><th>Código</th><th>Qtd Prevista</th><th>Reservado</th><th>Consumido</th><th>Custo Unit.</th><th>Custo Total</th><th>Status</th></tr></thead>
            <tbody className="table-body">
              {(order.materials || []).map(m => (
                <tr key={m.id}>
                  <td className="font-medium">{m.product_name}</td>
                  <td className="font-mono text-xs">{m.product_code}</td>
                  <td>{m.planned_quantity?.toFixed(2)}</td>
                  <td>{m.reserved_quantity?.toFixed(2)}</td>
                  <td>{m.consumed_quantity?.toFixed(2)}</td>
                  <td>R$ {m.unit_cost?.toFixed(2)}</td>
                  <td className="font-medium">R$ {m.total_cost?.toFixed(2)}</td>
                  <td><span className={`badge ${statusColors[m.status]}`}>{statusLabels[m.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'operations' && (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header"><tr><th>#</th><th>Operação</th><th>Máquina</th><th>Tempo Prev. (min)</th><th>Tempo Real (min)</th><th>Status</th></tr></thead>
            <tbody className="table-body">
              {(order.operations || []).map(o => (
                <tr key={o.id}>
                  <td className="font-mono">{o.sequence}</td>
                  <td className="font-medium">{o.operation_name}</td>
                  <td>{o.machine_name || '-'}</td>
                  <td>{o.planned_time_minutes}</td>
                  <td className={o.real_time_minutes > 0 ? 'font-medium' : ''}>{o.real_time_minutes || '-'}</td>
                  <td><span className={`badge ${statusColors[o.status]}`}>{statusLabels[o.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'logs' && (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header"><tr><th>Data/Hora</th><th>Operação</th><th>Operador</th><th>Máquina</th><th>Tempo (min)</th><th>Produzido</th><th>Rejeitado</th><th>Motivo Parada</th></tr></thead>
            <tbody className="table-body">
              {(order.logs || []).map(l => (
                <tr key={l.id}>
                  <td className="text-xs">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                  <td>{l.operation_name || '-'}</td>
                  <td>{l.user_name || '-'}</td>
                  <td>{l.machine_name || '-'}</td>
                  <td>{l.total_time_minutes}</td>
                  <td className="text-green-600 font-medium">{l.produced_quantity || 0}</td>
                  <td className="text-red-600">{l.rejected_quantity || 0}</td>
                  <td className="text-xs">{l.stop_reason || '-'}</td>
                </tr>
              ))}
              {(!order.logs || order.logs.length === 0) && <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhum apontamento registrado</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'costs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Custo de Materiais</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Previsto:</span><span className="font-medium">R$ {(order.materials || []).reduce((s, m) => s + (m.total_cost || 0), 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Consumido:</span><span className="font-medium">R$ {(order.materials || []).reduce((s, m) => s + (m.consumed_quantity || 0) * (m.unit_cost || 0), 0).toFixed(2)}</span></div>
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">Resumo Geral</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Custo Previsto Total:</span><span className="font-bold text-lg">R$ {(order.planned_cost || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Custo Real Total:</span><span className="font-bold text-lg">R$ {(order.real_cost || 0).toFixed(2)}</span></div>
              <div className="flex justify-between pt-2 border-t"><span className="text-gray-500">Variação:</span><span className={`font-bold ${costDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>{costDiff > 0 ? '+' : ''}R$ {costDiff.toFixed(2)} ({costVariation}%)</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Custo por Unidade:</span><span className="font-medium">R$ {order.produced_quantity > 0 ? (order.real_cost / order.produced_quantity).toFixed(2) : '-'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
