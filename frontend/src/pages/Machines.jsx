import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Edit2, Trash2, X, Cog } from 'lucide-react';

const statusLabels = { available: 'Disponível', occupied: 'Ocupada', maintenance: 'Manutenção', inactive: 'Inativa' };
const statusColors = { available: 'badge-green', occupied: 'badge-blue', maintenance: 'badge-yellow', inactive: 'badge-gray' };

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => api.get('/machines').then(setMachines);
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', code: '', type: '', sector: '', capacity_per_hour: 0, hourly_cost: 0, status: 'available', notes: '' }); setShowModal(true); };
  const openEdit = (m) => { setEditing(m); setForm(m); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/machines/${editing.id}`, form);
      else await api.post('/machines', form);
      setShowModal(false); load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => { if (confirm('Excluir esta máquina?')) { await api.delete(`/machines/${id}`); load(); } };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="page-title">Máquinas</h1><p className="page-subtitle">Centros de trabalho e máquinas</p></div>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Nova Máquina</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map(m => (
          <div key={m.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"><Cog className="w-5 h-5 text-primary-600" /></div>
              <span className={`badge ${statusColors[m.status]}`}>{statusLabels[m.status]}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{m.name}</h3>
            <p className="text-xs text-gray-500 font-mono mb-2">{m.code}</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Tipo: {m.type || '-'}</p>
              <p>Setor: {m.sector || '-'}</p>
              <p>Capacidade: {m.capacity_per_hour}/hora</p>
              <p>Custo hora: R$ {(m.hourly_cost || 0).toFixed(2)}</p>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <button onClick={() => openEdit(m)} className="text-gray-400 hover:text-primary-600 p-1"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">{editing ? 'Editar Máquina' : 'Nova Máquina'}</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="label">Nome *</label><input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Código</label><input className="input" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
                <div><label className="label">Tipo</label><input className="input" value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} /></div>
              </div>
              <div><label className="label">Setor</label><input className="input" value={form.sector || ''} onChange={e => setForm({ ...form, sector: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Capacidade/Hora</label><input type="number" className="input" value={form.capacity_per_hour || 0} onChange={e => setForm({ ...form, capacity_per_hour: parseFloat(e.target.value) || 0 })} /></div>
                <div><label className="label">Custo Hora (R$)</label><input type="number" step="0.01" className="input" value={form.hourly_cost || 0} onChange={e => setForm({ ...form, hourly_cost: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div><label className="label">Status</label><select className="input" value={form.status || 'available'} onChange={e => setForm({ ...form, status: e.target.value })}>{Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={handleSave} className="btn-primary">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
