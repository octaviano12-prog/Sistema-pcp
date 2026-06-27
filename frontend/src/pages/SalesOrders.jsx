import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Search, Edit2, Trash2, X, Eye } from 'lucide-react';

const statusLabels = { open: 'Aberto', in_planning: 'Em planejamento', in_production: 'Em produção', partially_produced: 'Parcialmente produzido', produced: 'Produzido', delivered: 'Entregue', cancelled: 'Cancelado' };
const statusColors = { open: 'badge-blue', in_planning: 'badge-yellow', in_production: 'badge-green', partially_produced: 'badge-orange', produced: 'badge-green', delivered: 'badge-green', cancelled: 'badge-red' };
const priorityLabels = { baixa: 'Baixa', normal: 'Normal', alta: 'Alta', urgente: 'Urgente' };
const priorityColors = { baixa: 'badge-gray', normal: 'badge-blue', alta: 'badge-orange', urgente: 'badge-red' };

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ customer_id: '', delivery_date: '', priority: 'normal', notes: '', items: [] });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 1, unit_price: 0 });

  const load = () => { api.get('/sales-orders').then(setOrders); api.get('/customers').then(setCustomers); api.get('/products?type=finished').then(setProducts); };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ customer_id: '', delivery_date: '', priority: 'normal', notes: '', items: [] }); setNewItem({ product_id: '', quantity: 1, unit_price: 0 }); setShowModal(true); };

  const addItem = () => {
    if (!newItem.product_id) return;
    const product = products.find(p => p.id === parseInt(newItem.product_id));
    setForm({ ...form, items: [...form.items, { ...newItem, product_id: parseInt(newItem.product_id), unit_price: product?.sale_price || newItem.unit_price, product_name: product?.name }] });
    setNewItem({ product_id: '', quantity: 1, unit_price: 0 });
  };

  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

  const handleSave = async () => {
    try {
      await api.post('/sales-orders', form);
      setShowModal(false); load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => { if (confirm('Excluir este pedido?')) { await api.delete(`/sales-orders/${id}`); load(); } };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="page-title">Pedidos de Venda</h1><p className="page-subtitle">Gerenciamento de pedidos</p></div>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Pedido</button>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="table-header"><tr><th>Número</th><th>Cliente</th><th>Data</th><th>Entrega</th><th>Prioridade</th><th>Itens</th><th>Valor Total</th><th>Status</th><th></th></tr></thead>
          <tbody className="table-body">
            {orders.map(o => (
              <tr key={o.id}>
                <td className="font-mono font-medium text-sm">{o.order_number}</td>
                <td>{o.customer_name}</td>
                <td className="text-xs">{new Date(o.order_date).toLocaleDateString('pt-BR')}</td>
                <td className="text-xs">{o.delivery_date ? new Date(o.delivery_date).toLocaleDateString('pt-BR') : '-'}</td>
                <td><span className={`badge ${priorityColors[o.priority]}`}>{priorityLabels[o.priority]}</span></td>
                <td>{o.items?.length || 0}</td>
                <td className="font-medium">R$ {(o.items || []).reduce((s, i) => s + (i.total_price || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td><span className={`badge ${statusColors[o.status]}`}>{statusLabels[o.status]}</span></td>
                <td className="text-right">
                  <button onClick={() => setShowDetail(o)} className="text-gray-400 hover:text-primary-600 p-1"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(o.id)} className="text-gray-400 hover:text-red-600 p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-gray-400">Nenhum pedido encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Novo Pedido</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Cliente *</label><select className="input" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: parseInt(e.target.value) })}><option value="">Selecione...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="label">Data de Entrega</label><input type="date" className="input" value={form.delivery_date} onChange={e => setForm({ ...form, delivery_date: e.target.value })} /></div>
                <div><label className="label">Prioridade</label><select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>{Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3">Itens do Pedido</h4>
                <div className="flex gap-2 mb-3">
                  <select className="input flex-1" value={newItem.product_id} onChange={e => { const p = products.find(pr => pr.id === parseInt(e.target.value)); setNewItem({ ...newItem, product_id: e.target.value, unit_price: p?.sale_price || 0 }); }}>
                    <option value="">Produto...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" className="input w-20" placeholder="Qtd" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })} />
                  <input type="number" step="0.01" className="input w-28" placeholder="Preço" value={newItem.unit_price} onChange={e => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })} />
                  <button onClick={addItem} className="btn-primary"><Plus className="w-4 h-4" /></button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-2">
                    <span className="text-sm">{item.product_name} — {item.quantity} un × R$ {item.unit_price?.toFixed(2)}</span>
                    <div className="flex items-center gap-2"><span className="font-medium text-sm">R$ {(item.quantity * item.unit_price).toFixed(2)}</span><button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={handleSave} className="btn-primary">Criar Pedido</button></div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Pedido {showDetail.order_number}</h3><button onClick={() => setShowDetail(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-gray-500">Cliente:</span><p className="font-medium">{showDetail.customer_name}</p></div>
                <div><span className="text-gray-500">Data:</span><p className="font-medium">{new Date(showDetail.order_date).toLocaleDateString('pt-BR')}</p></div>
                <div><span className="text-gray-500">Entrega:</span><p className="font-medium">{showDetail.delivery_date ? new Date(showDetail.delivery_date).toLocaleDateString('pt-BR') : '-'}</p></div>
                <div><span className="text-gray-500">Status:</span><p><span className={`badge ${statusColors[showDetail.status]}`}>{statusLabels[showDetail.status]}</span></p></div>
              </div>
              <div className="table-container">
                <table className="w-full">
                  <thead className="table-header"><tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th><th>Total</th></tr></thead>
                  <tbody className="table-body">
                    {(showDetail.items || []).map(item => (
                      <tr key={item.id}><td>{item.product_name}</td><td>{item.quantity}</td><td>R$ {item.unit_price?.toFixed(2)}</td><td className="font-medium">R$ {item.total_price?.toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
