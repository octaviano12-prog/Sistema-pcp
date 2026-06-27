import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => api.get('/customers').then(data => setCustomers(data.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))));
  useEffect(() => { load(); }, [search]);

  const openNew = () => { setEditing(null); setForm({ name: '', document: '', email: '', phone: '', whatsapp: '', address: '', city: '', state: '', notes: '', active: 1 }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm(c); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/customers/${editing.id}`, form);
      else await api.post('/customers', form);
      setShowModal(false); load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => { if (confirm('Excluir este cliente?')) { await api.delete(`/customers/${id}`); load(); } };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="page-title">Clientes</h1><p className="page-subtitle">Cadastro de clientes</p></div>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Cliente</button>
      </div>

      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" /></div>

      <div className="table-container">
        <table className="w-full">
          <thead className="table-header"><tr><th>Nome</th><th>Documento</th><th>E-mail</th><th>Telefone</th><th>Cidade/UF</th><th>Status</th><th></th></tr></thead>
          <tbody className="table-body">
            {customers.map(c => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td className="font-mono text-xs">{c.document}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.city}{c.state ? `/${c.state}` : ''}</td>
                <td><span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>{c.active ? 'Ativo' : 'Inativo'}</span></td>
                <td className="text-right">
                  <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-primary-600 p-1"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-600 p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum cliente encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">{editing ? 'Editar Cliente' : 'Novo Cliente'}</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="label">Nome / Razão Social *</label><input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">CNPJ / CPF</label><input className="input" value={form.document || ''} onChange={e => setForm({ ...form, document: e.target.value })} /></div>
              <div><label className="label">E-mail</label><input type="email" className="input" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Telefone</label><input className="input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label">WhatsApp</label><input className="input" value={form.whatsapp || ''} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
              <div><label className="label">Cidade</label><input className="input" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div><label className="label">Estado</label><input className="input" value={form.state || ''} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label">Endereço</label><input className="input" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label">Observações</label><textarea className="input" rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={handleSave} className="btn-primary">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
