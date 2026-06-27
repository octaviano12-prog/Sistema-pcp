import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react';

const types = { finished: 'Produto Acabado', intermediate: 'Intermediário', raw_material: 'Matéria-prima', input: 'Insumo', packaging: 'Embalagem', service: 'Serviço' };
const units = ['UN', 'KG', 'G', 'M', 'M²', 'M³', 'L', 'ML', 'CX', 'PC', 'HORA'];
const typeColors = { finished: 'bg-green-100 text-green-800', intermediate: 'bg-blue-100 text-blue-800', raw_material: 'bg-yellow-100 text-yellow-800', input: 'bg-purple-100 text-purple-800', packaging: 'bg-orange-100 text-orange-800', service: 'bg-gray-100 text-gray-800' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => api.get(`/products?search=${search}&type=${typeFilter}`).then(setProducts);
  useEffect(() => { load(); }, [search, typeFilter]);

  const openNew = () => { setEditing(null); setForm({ code: '', name: '', description: '', type: 'finished', unit: 'UN', cost_price: 0, sale_price: 0, min_stock: 0, max_stock: 0, lead_time_days: 0, weight: 0, active: 1 }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm(p); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/products/${editing.id}`, form);
      else await api.post('/products', form);
      setShowModal(false); load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => { if (confirm('Excluir este produto?')) { await api.delete(`/products/${id}`); load(); } };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="page-title">Produtos</h1><p className="page-subtitle">Cadastro de produtos, matérias-primas e insumos</p></div>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Produto</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" /></div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input w-auto">
          <option value="">Todos os tipos</option>
          {Object.entries(types).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="table-header"><tr><th>Código</th><th>Nome</th><th>Tipo</th><th>Un.</th><th>Custo</th><th>Preço Venda</th><th>Estoque Mín.</th><th>Status</th><th></th></tr></thead>
          <tbody className="table-body">
            {products.map(p => (
              <tr key={p.id}>
                <td className="font-mono text-xs">{p.code}</td>
                <td className="font-medium">{p.name}</td>
                <td><span className={`badge ${typeColors[p.type]}`}>{types[p.type]}</span></td>
                <td>{p.unit}</td>
                <td>R$ {(p.cost_price || 0).toFixed(2)}</td>
                <td>R$ {(p.sale_price || 0).toFixed(2)}</td>
                <td>{p.min_stock}</td>
                <td><span className={`badge ${p.active ? 'badge-green' : 'badge-gray'}`}>{p.active ? 'Ativo' : 'Inativo'}</span></td>
                <td className="text-right">
                  <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-primary-600 p-1"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600 p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-gray-400">Nenhum produto encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">{editing ? 'Editar Produto' : 'Novo Produto'}</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Código</label><input className="input" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
              <div><label className="label">Nome *</label><input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="sm:col-span-2"><label className="label">Descrição</label><input className="input" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">Tipo</label><select className="input" value={form.type || 'finished'} onChange={e => setForm({ ...form, type: e.target.value })}>{Object.entries(types).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="label">Unidade</label><select className="input" value={form.unit || 'UN'} onChange={e => setForm({ ...form, unit: e.target.value })}>{units.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
              <div><label className="label">Custo (R$)</label><input type="number" step="0.01" className="input" value={form.cost_price || 0} onChange={e => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Preço Venda (R$)</label><input type="number" step="0.01" className="input" value={form.sale_price || 0} onChange={e => setForm({ ...form, sale_price: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Estoque Mínimo</label><input type="number" step="0.01" className="input" value={form.min_stock || 0} onChange={e => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Estoque Máximo</label><input type="number" step="0.01" className="input" value={form.max_stock || 0} onChange={e => setForm({ ...form, max_stock: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Lead Time (dias)</label><input type="number" className="input" value={form.lead_time_days || 0} onChange={e => setForm({ ...form, lead_time_days: parseInt(e.target.value) || 0 })} /></div>
              <div><label className="label">Peso (kg)</label><input type="number" step="0.01" className="input" value={form.weight || 0} onChange={e => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={handleSave} className="btn-primary">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
