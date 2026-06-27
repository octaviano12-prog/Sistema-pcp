import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';

export default function RoutesModule() {
  const [products, setProducts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get('/products?type=finished').then(setProducts);
    api.get('/machines').then(setMachines);
  }, []);

  const loadRoutes = async (productId) => {
    setSelectedProduct(productId);
    const data = await api.get(`/routes/product/${productId}`);
    setRoutes(data);
  };

  const openNew = () => {
    const nextSeq = routes.length > 0 ? Math.max(...routes.map(r => r.sequence)) + 1 : 1;
    setForm({ sequence: nextSeq, operation_name: '', machine_id: '', standard_time_minutes: 0, setup_time_minutes: 0, hourly_cost: 0, notes: '' });
    setShowModal(true);
  };

  const handleAdd = async () => {
    try {
      await api.post('/routes', { ...form, product_id: parseInt(selectedProduct), machine_id: form.machine_id ? parseInt(form.machine_id) : null });
      setShowModal(false);
      loadRoutes(selectedProduct);
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => { await api.delete(`/routes/${id}`); loadRoutes(selectedProduct); };

  const totalTime = routes.reduce((s, r) => s + (r.standard_time_minutes || 0), 0);

  return (
    <div className="space-y-4">
      <div><h1 className="page-title">Roteiros de Produção</h1><p className="page-subtitle">Operações e sequências de fabricação</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Produtos</h3>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {products.map(p => (
              <button key={p.id} onClick={() => loadRoutes(p.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedProduct == p.id ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50'}`}>
                <span className="font-mono text-xs text-gray-400 mr-2">{p.code}</span>{p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedProduct ? (
            <div className="card text-center py-12 text-gray-400"><p>Selecione um produto para ver o roteiro</p></div>
          ) : (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Roteiro de Produção</h3>
                  <p className="text-sm text-gray-500">Tempo total: <strong>{totalTime} min</strong> ({(totalTime / 60).toFixed(1)}h) — {routes.length} operações</p>
                </div>
                <button onClick={openNew} className="btn-primary text-xs"><Plus className="w-3 h-3" /> Operação</button>
              </div>

              {routes.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">Nenhuma operação cadastrada</p>
              ) : (
                <div className="space-y-2">
                  {routes.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">{r.sequence}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{r.operation_name}</p>
                        <p className="text-xs text-gray-500">{r.machine_name || 'Sem máquina'} — {r.standard_time_minutes} min — R$ {(r.hourly_cost || 0).toFixed(2)}/h</p>
                      </div>
                      <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Adicionar Operação</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="label">Nome da Operação *</label><input className="input" value={form.operation_name || ''} onChange={e => setForm({ ...form, operation_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Sequência</label><input type="number" className="input" value={form.sequence || 1} onChange={e => setForm({ ...form, sequence: parseInt(e.target.value) || 1 })} /></div>
                <div><label className="label">Máquina</label><select className="input" value={form.machine_id || ''} onChange={e => setForm({ ...form, machine_id: e.target.value })}><option value="">Nenhuma</option>{machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Tempo Padrão (min)</label><input type="number" className="input" value={form.standard_time_minutes || 0} onChange={e => setForm({ ...form, standard_time_minutes: parseFloat(e.target.value) || 0 })} /></div>
                <div><label className="label">Setup (min)</label><input type="number" className="input" value={form.setup_time_minutes || 0} onChange={e => setForm({ ...form, setup_time_minutes: parseFloat(e.target.value) || 0 })} /></div>
                <div><label className="label">Custo/Hora (R$)</label><input type="number" step="0.01" className="input" value={form.hourly_cost || 0} onChange={e => setForm({ ...form, hourly_cost: parseFloat(e.target.value) || 0 })} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={handleAdd} className="btn-primary">Adicionar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
