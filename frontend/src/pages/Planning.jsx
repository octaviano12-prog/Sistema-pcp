import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { AlertTriangle, CheckCircle, Clock, Package, Plus, X } from 'lucide-react';

export default function Planning() {
  const [planning, setPlanning] = useState([]);
  const [showCreateOP, setShowCreateOP] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [opForm, setOpForm] = useState({});

  useEffect(() => { api.get('/planning').then(setPlanning); }, []);

  const openCreateOP = (order, item) => {
    setSelectedItem({ ...item, sales_order_id: order.id, customer_id: order.customer_id, customer_name: order.customer_name });
    setOpForm({ product_id: item.product_id, sales_order_id: order.id, customer_id: order.customer_id, planned_quantity: item.quantity - item.current_stock, planned_start_date: new Date().toISOString().split('T')[0], planned_end_date: order.delivery_date || '', priority: order.priority });
    setShowCreateOP(true);
  };

  const handleCreateOP = async () => {
    try {
      await api.post('/production-orders', opForm);
      setShowCreateOP(false);
      api.get('/planning').then(setPlanning);
    } catch (e) { alert(e.message); }
  };

  const checkMaterials = async (productId, quantity) => {
    try { return await api.post('/planning/check-materials', { product_id: productId, quantity }); } catch { return []; }
  };

  return (
    <div className="space-y-4">
      <div><h1 className="page-title">Planejamento PCP</h1><p className="page-subtitle">Planeje a produção com base nos pedidos e disponibilidade</p></div>

      {planning.length === 0 ? (
        <div className="card text-center py-12 text-gray-400"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhum pedido pendente de planejamento</p></div>
      ) : planning.map(order => (
        <div key={order.id} className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                <span className={`badge ${order.priority === 'urgente' ? 'badge-red' : order.priority === 'alta' ? 'badge-orange' : 'badge-blue'}`}>{order.priority}</span>
              </div>
              <p className="text-sm text-gray-500">{order.customer_name} — Entrega: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('pt-BR') : 'Sem prazo'}</p>
            </div>
            {new Date(order.delivery_date) < new Date() && <span className="badge badge-red flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />Prazo vencido</span>}
          </div>

          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{item.product_name} <span className="text-gray-400">({item.product_code})</span></p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span>Pedido: <strong>{item.quantity}</strong></span>
                      <span>Estoque: <strong className={item.current_stock < item.quantity ? 'text-red-600' : 'text-green-600'}>{item.current_stock}</strong></span>
                      <span>Faltam: <strong className="text-red-600">{Math.max(0, item.quantity - item.current_stock)}</strong></span>
                      {!item.has_bom && <span className="text-orange-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Sem ficha técnica</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.needs_production && item.has_bom && (
                      <button onClick={() => openCreateOP(order, item)} className="btn-primary text-xs"><Plus className="w-3 h-3" /> Gerar OP</button>
                    )}
                    {!item.needs_production && <span className="badge badge-green flex items-center gap-1"><CheckCircle className="w-3 h-3" />Estoque suficiente</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Create OP Modal */}
      {showCreateOP && (
        <div className="modal-overlay" onClick={() => setShowCreateOP(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Gerar Ordem de Produção</h3><button onClick={() => setShowCreateOP(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="label">Produto</label><p className="text-sm font-medium bg-gray-50 px-3 py-2 rounded-lg">{selectedItem?.product_name}</p></div>
              <div><label className="label">Cliente</label><p className="text-sm bg-gray-50 px-3 py-2 rounded-lg">{selectedItem?.customer_name}</p></div>
              <div><label className="label">Quantidade</label><input type="number" className="input" value={opForm.planned_quantity} onChange={e => setOpForm({ ...opForm, planned_quantity: parseFloat(e.target.value) || 0 })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Início Previsto</label><input type="date" className="input" value={opForm.planned_start_date} onChange={e => setOpForm({ ...opForm, planned_start_date: e.target.value })} /></div>
                <div><label className="label">Fim Previsto</label><input type="date" className="input" value={opForm.planned_end_date} onChange={e => setOpForm({ ...opForm, planned_end_date: e.target.value })} /></div>
              </div>
              <div><label className="label">Prioridade</label><select className="input" value={opForm.priority} onChange={e => setOpForm({ ...opForm, priority: e.target.value })}><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowCreateOP(false)} className="btn-secondary">Cancelar</button><button onClick={handleCreateOP} className="btn-primary">Criar OP</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
