import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Trash2, X, Package } from 'lucide-react';

export default function BOM() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [boms, setBoms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ component_id: '', quantity: 1, unit: 'UN', loss_percentage: 0, unit_cost: 0, notes: '' });

  useEffect(() => {
    api.get('/products').then(setAllProducts);
    api.get('/products?type=finished').then(setProducts);
  }, []);

  const loadBOM = async (productId) => {
    setSelectedProduct(productId);
    const data = await api.get(`/boms/product/${productId}`);
    setBoms(data);
  };

  const openNew = () => { setForm({ component_id: '', quantity: 1, unit: 'UN', loss_percentage: 0, unit_cost: 0, notes: '' }); setShowModal(true); };

  const handleAdd = async () => {
    try {
      const component = allProducts.find(p => p.id === parseInt(form.component_id));
      await api.post('/boms', { ...form, product_id: parseInt(selectedProduct), component_id: parseInt(form.component_id), unit_cost: form.unit_cost || component?.cost_price || 0 });
      setShowModal(false);
      loadBOM(selectedProduct);
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => { await api.delete(`/boms/${id}`); loadBOM(selectedProduct); };

  const totalCost = boms.reduce((s, b) => s + (b.total_cost || 0), 0);
  const selectedProd = allProducts.find(p => p.id === parseInt(selectedProduct));

  return (
    <div className="space-y-4">
      <div><h1 className="page-title">Ficha Técnica</h1><p className="page-subtitle">Composição de produtos e custos</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product list */}
        <div className="card">
          <h3 className="font-semibold mb-3">Produtos Acabados</h3>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {products.map(p => (
              <button key={p.id} onClick={() => loadBOM(p.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedProduct == p.id ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50'}`}>
                <span className="font-mono text-xs text-gray-400 mr-2">{p.code}</span>{p.name}
              </button>
            ))}
          </div>
        </div>

        {/* BOM detail */}
        <div className="lg:col-span-2">
          {!selectedProduct ? (
            <div className="card text-center py-12 text-gray-400"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Selecione um produto para ver a ficha técnica</p></div>
          ) : (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedProd?.name}</h3>
                  <p className="text-sm text-gray-500">{selectedProd?.code} — Custo total: <strong className="text-primary-600">R$ {totalCost.toFixed(2)}</strong></p>
                </div>
                <button onClick={openNew} className="btn-primary text-xs"><Plus className="w-3 h-3" /> Componente</button>
              </div>

              {boms.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">Nenhum componente cadastrado</p>
              ) : (
                <div className="table-container">
                  <table className="w-full">
                    <thead className="table-header"><tr><th>Componente</th><th>Qtd</th><th>Un.</th><th>Perda %</th><th>Custo Unit.</th><th>Custo Total</th><th></th></tr></thead>
                    <tbody className="table-body">
                      {boms.map(b => (
                        <tr key={b.id}>
                          <td className="font-medium">{b.component_name} <span className="text-gray-400 text-xs">({b.component_code})</span></td>
                          <td>{b.quantity}</td>
                          <td>{b.unit}</td>
                          <td>{b.loss_percentage}%</td>
                          <td>R$ {b.unit_cost?.toFixed(2)}</td>
                          <td className="font-medium">R$ {b.total_cost?.toFixed(2)}</td>
                          <td><button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Adicionar Componente</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="label">Componente *</label><select className="input" value={form.component_id} onChange={e => { const p = allProducts.find(pr => pr.id === parseInt(e.target.value)); setForm({ ...form, component_id: e.target.value, unit: p?.unit || 'UN', unit_cost: p?.cost_price || 0 }); }}><option value="">Selecione...</option>{allProducts.filter(p => p.id !== parseInt(selectedProduct)).map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Quantidade</label><input type="number" step="0.01" className="input" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} /></div>
                <div><label className="label">Unidade</label><input className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Perda (%)</label><input type="number" step="0.1" className="input" value={form.loss_percentage} onChange={e => setForm({ ...form, loss_percentage: parseFloat(e.target.value) || 0 })} /></div>
                <div><label className="label">Custo Unitário (R$)</label><input type="number" step="0.01" className="input" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={handleAdd} className="btn-primary">Adicionar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
