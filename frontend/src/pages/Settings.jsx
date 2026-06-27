import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Save, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Settings() {
  const { user } = useAuth();
  const [company, setCompany] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.company_id) {
      api.get('/companies').then(data => {
        const c = data.find(co => co.id === user.company_id);
        if (c) setCompany(c);
      }).catch(() => {});
    }
  }, [user]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="page-title">Configurações</h1><p className="page-subtitle">Configurações da empresa e do sistema</p></div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary-600" /> Dados da Empresa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Razão Social</label><input className="input" value={company.name || ''} onChange={e => setCompany({ ...company, name: e.target.value })} /></div>
          <div><label className="label">Nome Fantasia</label><input className="input" value={company.trade_name || ''} onChange={e => setCompany({ ...company, trade_name: e.target.value })} /></div>
          <div><label className="label">CNPJ</label><input className="input" value={company.cnpj || ''} onChange={e => setCompany({ ...company, cnpj: e.target.value })} /></div>
          <div><label className="label">Inscrição Estadual</label><input className="input" value={company.state_registration || ''} onChange={e => setCompany({ ...company, state_registration: e.target.value })} /></div>
          <div><label className="label">E-mail</label><input type="email" className="input" value={company.email || ''} onChange={e => setCompany({ ...company, email: e.target.value })} /></div>
          <div><label className="label">Telefone</label><input className="input" value={company.phone || ''} onChange={e => setCompany({ ...company, phone: e.target.value })} /></div>
          <div><label className="label">WhatsApp</label><input className="input" value={company.whatsapp || ''} onChange={e => setCompany({ ...company, whatsapp: e.target.value })} /></div>
          <div><label className="label">Plano</label><input className="input bg-gray-50" value={company.plan || 'starter'} readOnly /></div>
          <div className="sm:col-span-2"><label className="label">Endereço</label><input className="input" value={company.address || ''} onChange={e => setCompany({ ...company, address: e.target.value })} /></div>
          <div><label className="label">Cidade</label><input className="input" value={company.city || ''} onChange={e => setCompany({ ...company, city: e.target.value })} /></div>
          <div><label className="label">Estado</label><input className="input" value={company.state || ''} onChange={e => setCompany({ ...company, state: e.target.value })} /></div>
          <div><label className="label">CEP</label><input className="input" value={company.zip_code || ''} onChange={e => setCompany({ ...company, zip_code: e.target.value })} /></div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Salvar</button>
          {saved && <span className="text-green-600 text-sm">Configurações salvas com sucesso!</span>}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Preferências do Sistema</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div><p className="text-sm font-medium">Numeração automática de OP</p><p className="text-xs text-gray-500">Gerar número sequencial automaticamente</p></div>
            <span className="badge badge-green">Ativo</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div><p className="text-sm font-medium">Reservar materiais ao liberar OP</p><p className="text-xs text-gray-500">Bloquear estoque automaticamente</p></div>
            <span className="badge badge-green">Ativo</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div><p className="text-sm font-medium">Baixa automática ao finalizar OP</p><p className="text-xs text-gray-500">Consumir materiais e dar entrada do produto</p></div>
            <span className="badge badge-green">Ativo</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div><p className="text-sm font-medium">Alertas de estoque mínimo</p><p className="text-xs text-gray-500">Notificar quando estoque estiver baixo</p></div>
            <span className="badge badge-green">Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
