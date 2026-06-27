import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Play, Pause, CheckCircle, Clock, Factory } from 'lucide-react';

const stopReasons = ['Falta de material', 'Falta de operador', 'Máquina parada', 'Manutenção', 'Aguardando inspeção', 'Falta de energia', 'Setup', 'Retrabalho', 'Outro'];

export default function ProductionLog() {
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedOP, setSelectedOP] = useState(null);
  const [form, setForm] = useState({ production_order_id: '', operation_id: '', machine_id: '', produced_quantity: 0, rejected_quantity: 0, stop_reason: '', notes: '' });
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    api.get('/production-orders').then(data => setOrders(data.filter(o => ['released', 'in_production', 'paused'].includes(o.status))));
    api.get('/machines').then(setMachines);
    api.get('/production-logs').then(setLogs);
  }, []);

  const loadOPDetail = async (opId) => {
    setSelectedOP(opId);
    setForm({ ...form, production_order_id: opId, operation_id: '', machine_id: '' });
  };

  const selectedOrder = orders.find(o => o.id === parseInt(selectedOP));

  const handleSubmit = async () => {
    if (!form.production_order_id) return alert('Selecione uma OP');
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - (30 * 60000)); // default 30 min
      await api.post('/production-logs', {
        production_order_id: parseInt(form.production_order_id),
        operation_id: form.operation_id ? parseInt(form.operation_id) : null,
        machine_id: form.machine_id ? parseInt(form.machine_id) : null,
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        produced_quantity: parseFloat(form.produced_quantity) || 0,
        rejected_quantity: parseFloat(form.rejected_quantity) || 0,
        stop_reason: form.stop_reason,
        notes: form.notes,
      });
      setForm({ ...form, produced_quantity: 0, rejected_quantity: 0, stop_reason: '', notes: '' });
      api.get('/production-logs').then(setLogs);
      alert('Apontamento registrado com sucesso!');
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-4">
      <div><h1 className="page-title">Apontamento de Produção</h1><p className="page-subtitle">Registre a produção do chão de fábrica</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Factory className="w-5 h-5 text-primary-600" /> Registrar Apontamento</h3>

          <div><label className="label">Ordem de Produção *</label>
            <select className="input" value={form.production_order_id} onChange={e => loadOPDetail(e.target.value)}>
              <option value="">Selecione a OP...</option>
              {orders.map(o => <option key={o.id} value={o.id}>{o.order_number} — {o.product_name} ({o.planned_quantity} un)</option>)}
            </select>
          </div>

          {selectedOrder && (
            <>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p><strong>Produto:</strong> {selectedOrder.product_name}</p>
                <p><strong>Qtd Planejada:</strong> {selectedOrder.planned_quantity} | <strong>Produzida:</strong> {selectedOrder.produced_quantity || 0}</p>
              </div>
            </>
          )}

          <div><label className="label">Máquina</label>
            <select className="input" value={form.machine_id} onChange={e => setForm({ ...form, machine_id: e.target.value })}>
              <option value="">Selecione...</option>
              {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Qtd Produzida</label><input type="number" className="input text-lg font-bold text-green-600" value={form.produced_quantity} onChange={e => setForm({ ...form, produced_quantity: e.target.value })} /></div>
            <div><label className="label">Qtd Rejeitada</label><input type="number" className="input text-lg font-bold text-red-600" value={form.rejected_quantity} onChange={e => setForm({ ...form, rejected_quantity: e.target.value })} /></div>
          </div>

          <div><label className="label">Motivo de Parada</label>
            <select className="input" value={form.stop_reason} onChange={e => setForm({ ...form, stop_reason: e.target.value })}>
              <option value="">Nenhum</option>
              {stopReasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div><label className="label">Observações</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>

          <button onClick={handleSubmit} className="btn-success w-full justify-center py-3 text-base"><CheckCircle className="w-5 h-5" /> Registrar Apontamento</button>
        </div>

        {/* Recent logs */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400" /> Últimos Apontamentos</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {logs.slice(0, 20).map(l => (
              <div key={l.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-primary-600">{l.order_number}</span>
                  <span className="text-xs text-gray-400">{new Date(l.created_at).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>{l.product_name}</span>
                  <span>{l.operation_name || '-'}</span>
                  <span>{l.user_name || '-'}</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs">
                  {l.produced_quantity > 0 && <span className="text-green-600 font-medium">+{l.produced_quantity} produzidas</span>}
                  {l.rejected_quantity > 0 && <span className="text-red-600 font-medium">{l.rejected_quantity} rejeitadas</span>}
                  {l.total_time_minutes > 0 && <span className="text-gray-500">{l.total_time_minutes} min</span>}
                  {l.stop_reason && <span className="text-orange-600">{l.stop_reason}</span>}
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Nenhum apontamento registrado</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
