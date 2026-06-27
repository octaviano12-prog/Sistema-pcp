import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Search, Eye, Play, Pause, CheckCircle, XCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusLabels = { planned: 'Planejada', released: 'Liberada', in_production: 'Em produção', paused: 'Pausada', finished: 'Finalizada', cancelled: 'Cancelada', delayed: 'Atrasada' };
const statusColors = { planned: 'badge-gray', released: 'badge-blue', in_production: 'badge-green', paused: 'badge-yellow', finished: 'badge-green', cancelled: 'badge-red', delayed: 'badge-red' };
const priorityColors = { baixa: 'badge-gray', normal: 'badge-blue', alta: 'badge-orange', urgente: 'badge-red' };

export default function ProductionOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const load = () => { api.get('/production-orders').then(setOrders); api.get('/products?type=finished').then(setProducts); api.get('/customers').then(setCustomers); };
  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => !filter || o.status === filter);

  const openNew = () => { setForm({ product_id: '', planned_quantity: 1, planned_start_date: new Date().toISOString().split('T')[0], planned_end_date: '', priority: 'normal', notes: '' }); setShowModal(true); };

  const handleCreate = async () => {
    try {
      const res = await api.post('/production-orders', form);
      setShowModal(false); load();
      navigate(`/app/production-orders/${res.id}`);
    } catch (e) { alert(e.message); }
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`/production-orders/${id}/${action}`);
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="page-title">Ordens de Produção</h1><p className="page-subtitle">Gerencie todas as OPs</p></div>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Nova OP</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'planned', 'released', 'in_production', 'paused', 'finished', 'cancelled', 'delayed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s ? statusLabels[s] : 'Todas'}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="table-header"><tr><th>OP</th><th>Produto</th><th>Cliente</th><th>Qtd Planejada</th><th>Produzido</th><th>Início Prev.</th><th>Fim Prev.</th><th>Prioridade</th><th>Status</th><th></th></tr></thead>
          <tbody className="table-body">
            {filtered.map(o => (
              <tr key={o.id}>
                <td className="font-mono font-medium text-sm">{o.order_number}</td>
                <td className="font-medium">{o.product_name}</td>
                <td className="text-sm">{o.customer_name || '-'}</td>
                <td>{o.planned_quantity}</td>
                <td><span className={o.produced_quantity > 0 ? 'text-green-600 font-medium' : ''}>{o.produced_quantity || 0}</span></td>
                <td className="text-xs">{o.planned_start_date ? new Date(o.planned_start_date).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="text-xs">{o.planned_end_date ? new Date(o.planned_end_date).toLocaleDateString('pt-BR') : '-'}</td>
                <td><span className={`badge ${priorityColors[o.priority]}`}>{o.priority}</span></td>
                <td><span className={`badge ${statusColors[o.status]}`}>{statusLabels[o.status]}</span></td>
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => navigate(`/app/production-orders/${o.id}`)} className="text-gray-400 hover:text-primary-600 p-1"><Eye className="w-4 h-4" /></button>
                  {o.status === 'planned' && <button onClick={() => handleAction(o.id, 'release')} className="text-blue-500 hover:text-blue-700 p-1" title="Liberar"><Play className="w-4 h-4" /></button>}
                  {o.status === 'released' && <button onClick={() => handleAction(o.id, 'start')} className="text-green-500 hover:text-green-700 p-1" title="Iniciar"><Play className="w-4 h-4" /></button>}
                  {o.status === 'in_production' && <button onClick={() => handleAction(o.id, 'pause')} className="text-yellow-500 hover:text-yellow-700 p-1" title="Pausar"><Pause className="w-4 h-4" /></button>}
                  {o.status === 'paused' && <button onClick={() => handleAction(o.id, 'resume')} className="text-green-500 hover:text-green-700 p-1" title="Retomar"><Play className="w-4 h-4" /></button>}
                  {(o.status === 'in_production' || o.status === 'paused') && <button onClick={() => handleAction(o.id, 'finish')} className="text-emerald-500 hover:text-emerald-700 p-1" title="Finalizar"><CheckCircle className="w-4 h-4" /></button>}
                  {o.status !== 'finished' && o.status !== 'cancelled' && <button onClick={() => handleAction(o.id, 'cancel')} className="text-red-400 hover:text-red-600 p-1" title="Cancelar"><XCircle className="w-4 h-4" /></button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10} className="text-center py-8 text-gray-400">Nenhuma OP encontrada</td></tr>}
          </tbody>
        </table>
      </div>

      {/* New OP Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Nova Ordem de Produção</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="label">Produto *</label><select className="input" value={form.product_id} onChange={e => setForm({ ...form, product_id: parseInt(e.target.value) })}><option value="">Selecione...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div><label className="label">Quantidade *</label><input type="number" className="input" value={form.planned_quantity} onChange={e => setForm({ ...form, planned_quantity: parseFloat(e.target.value) || 0 })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Início Previsto</label><input type="date" className="input" value={form.planned_start_date} onChange={e => setForm({ ...form, planned_start_date: e.target.value })} /></div>
                <div><label className="label">Fim Previsto</label><input type="date" className="input" value={form.planned_end_date} onChange={e => setForm({ ...form, planned_end_date: e.target.value })} /></div>
              </div>
              <div><label className="label">Prioridade</label><select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></div>
              <div><label className="label">Observações</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={handleCreate} className="btn-primary">Criar OP</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
