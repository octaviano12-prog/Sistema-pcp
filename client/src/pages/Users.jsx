import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const roleLabels = { super_admin: 'Super Admin', admin: 'Administrador', pcp: 'PCP', production: 'Produção', stock: 'Estoque', purchases: 'Compras', financial: 'Financeiro', viewer: 'Visualizador' };
const roleColors = { super_admin: 'bg-purple-100 text-purple-800', admin: 'bg-blue-100 text-blue-800', pcp: 'bg-green-100 text-green-800', production: 'bg-orange-100 text-orange-800', stock: 'bg-yellow-100 text-yellow-800', purchases: 'bg-cyan-100 text-cyan-800', financial: 'bg-indigo-100 text-indigo-800', viewer: 'bg-gray-100 text-gray-800' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = () => api.get('/users').then(setUsers);
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'viewer' }); setShowModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ ...u, password: '' }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/users/${editing.id}`, form);
      else await api.post('/users', form);
      setShowModal(false); load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => { if (confirm('Excluir este usuário?')) { await api.delete(`/users/${id}`); load(); } };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="page-title">Usuários</h1><p className="page-subtitle">Gerenciamento de usuários e permissões</p></div>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Usuário</button>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="table-header"><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Criado em</th><th></th></tr></thead>
          <tbody className="table-body">
            {users.map(u => (
              <tr key={u.id}>
                <td className="font-medium">{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${roleColors[u.role]}`}>{roleLabels[u.role] || u.role}</span></td>
                <td><span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{u.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
                <td className="text-xs">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="text-right">
                  <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-primary-600 p-1"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-600 p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">{editing ? 'Editar Usuário' : 'Novo Usuário'}</h3><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="label">Nome *</label><input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">E-mail *</label><input type="email" className="input" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              {!editing && <div><label className="label">Senha *</label><input type="password" className="input" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} /></div>}
              <div><label className="label">Perfil</label><select className="input" value={form.role || 'viewer'} onChange={e => setForm({ ...form, role: e.target.value })}>{Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              {editing && <div><label className="label">Status</label><select className="input" value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value })}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></div>}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={handleSave} className="btn-primary">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
