import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

const types = {
  finished: 'Produto Acabado',
  intermediate: 'Intermediário',
  raw_material: 'Matéria-prima',
  input: 'Insumo',
  packaging: 'Embalagem',
  service: 'Serviço',
};

const units = ['UN', 'KG', 'G', 'M', 'M²', 'M³', 'L', 'ML', 'CX', 'PC', 'HORA'];
const typeColors = {
  finished: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  raw_material: 'bg-yellow-100 text-yellow-800',
  input: 'bg-purple-100 text-purple-800',
  packaging: 'bg-orange-100 text-orange-800',
  service: 'bg-gray-100 text-gray-800',
};

const emptyProduct = {
  code: '',
  name: '',
  description: '',
  type: 'finished',
  unit: 'UN',
  cost_price: 0,
  sale_price: 0,
  min_stock: 0,
  max_stock: 0,
  lead_time_days: 0,
  weight: 0,
  active: 1,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [autoCode, setAutoCode] = useState(true);

  const load = () => api.get(`/products?search=${search}&type=${typeFilter}`).then(setProducts);
  useEffect(() => { load(); }, [search, typeFilter]);

  const fetchNextCode = async (type = 'finished') => {
    try {
      const response = await api.get(`/products/next-code?type=${type}`);
      return response.code || '';
    } catch {
      return '';
    }
  };

  const openNew = async () => {
    const type = 'finished';
    const code = await fetchNextCode(type);
    setEditing(null);
    setAutoCode(true);
    setForm({ ...emptyProduct, type, code });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setAutoCode(false);
    setForm(product);
    setShowModal(true);
  };

  const handleTypeChange = async (nextType) => {
    const nextForm = { ...form, type: nextType };
    if (!editing && autoCode) nextForm.code = await fetchNextCode(nextType);
    setForm(nextForm);
  };

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/products/${editing.id}`, form);
      else await api.post('/products', form);
      setShowModal(false);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Excluir este produto?')) {
      await api.delete(`/products/${id}`);
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Produtos</h1>
          <p className="page-subtitle">Cadastro de produtos, matérias-primas e insumos</p>
        </div>
        <button onClick={openNew} className="btn-primary"><Plus className="h-4 w-4" /> Novo Produto</button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input w-auto">
          <option value="">Todos os tipos</option>
          {Object.entries(types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="table-header">
            <tr><th>Código</th><th>Nome</th><th>Tipo</th><th>Un.</th><th>Custo</th><th>Preço Venda</th><th>Estoque Mín.</th><th>Status</th><th></th></tr>
          </thead>
          <tbody className="table-body">
            {products.map(product => (
              <tr key={product.id}>
                <td className="font-mono text-xs">{product.code}</td>
                <td className="font-medium">{product.name}</td>
                <td><span className={`badge ${typeColors[product.type] || 'badge-gray'}`}>{types[product.type] || product.type}</span></td>
                <td>{product.unit}</td>
                <td>R$ {(product.cost_price || 0).toFixed(2)}</td>
                <td>R$ {(product.sale_price || 0).toFixed(2)}</td>
                <td>{product.min_stock}</td>
                <td><span className={`badge ${product.active ? 'badge-green' : 'badge-gray'}`}>{product.active ? 'Ativo' : 'Inativo'}</span></td>
                <td className="text-right">
                  <button onClick={() => openEdit(product)} className="p-1 text-gray-400 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(product.id)} className="ml-1 p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-gray-400">Nenhum produto encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b p-5">
              <h3 className="text-lg font-semibold">{editing ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className="label">Código</label>
                <input
                  className="input"
                  value={form.code || ''}
                  onChange={e => {
                    setAutoCode(false);
                    setForm({ ...form, code: e.target.value.toUpperCase() });
                  }}
                  placeholder="Gerado automaticamente"
                />
                {!editing && <p className="mt-1 text-xs text-gray-500">Automático pelo tipo do produto. Pode editar se necessário.</p>}
              </div>
              <div><label className="label">Nome *</label><input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="sm:col-span-2"><label className="label">Descrição</label><input className="input" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">Tipo</label><select className="input" value={form.type || 'finished'} onChange={e => handleTypeChange(e.target.value)}>{Object.entries(types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
              <div><label className="label">Unidade</label><select className="input" value={form.unit || 'UN'} onChange={e => setForm({ ...form, unit: e.target.value })}>{units.map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></div>
              <div><label className="label">Custo (R$)</label><input type="number" step="0.01" className="input" value={form.cost_price || 0} onChange={e => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Preço Venda (R$)</label><input type="number" step="0.01" className="input" value={form.sale_price || 0} onChange={e => setForm({ ...form, sale_price: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Estoque Mínimo</label><input type="number" step="0.01" className="input" value={form.min_stock || 0} onChange={e => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Estoque Máximo</label><input type="number" step="0.01" className="input" value={form.max_stock || 0} onChange={e => setForm({ ...form, max_stock: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Lead Time (dias)</label><input type="number" className="input" value={form.lead_time_days || 0} onChange={e => setForm({ ...form, lead_time_days: parseInt(e.target.value) || 0 })} /></div>
              <div><label className="label">Peso (kg)</label><input type="number" step="0.01" className="input" value={form.weight || 0} onChange={e => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex justify-end gap-3 border-t p-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSave} className="btn-primary">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
