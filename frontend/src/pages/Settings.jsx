import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Archive, Building2, CheckCircle, Database, FileText, Save, ShieldCheck } from 'lucide-react';

const taxRegimes = {
  simples_nacional: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
};

const certificateStatuses = {
  pending: 'Pendente',
  valid: 'Válido',
  expired: 'Vencido',
};

export default function Settings() {
  const [company, setCompany] = useState({});
  const [fiscal, setFiscal] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/company-settings')
      .then(data => {
        setCompany(data.company || {});
        setFiscal(data.fiscal || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    await api.put('/company-settings', { company, fiscal });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" /></div>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary-600" />
            <h1 className="page-title">Configurações</h1>
          </div>
          <p className="page-subtitle">Dados da empresa, fiscal, backup e preferências do sistema.</p>
        </div>
        <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Salvar configurações</button>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Configurações salvas com sucesso.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="stat-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-6 w-6" /></div>
          <div><p className="stat-value">Ativo</p><p className="stat-label">Ambiente seguro</p></div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FileText className="h-6 w-6" /></div>
          <div><p className="stat-value">{fiscal.fiscal_environment === 'production' ? 'Produção' : 'Homologação'}</p><p className="stat-label">Ambiente fiscal</p></div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700"><Database className="h-6 w-6" /></div>
          <div><p className="stat-value">{fiscal.auto_backup === 0 || fiscal.auto_backup === false ? 'Manual' : 'Ativo'}</p><p className="stat-label">Backup automático</p></div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900"><Building2 className="w-5 h-5 text-primary-600" /> Dados da Empresa</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <div className="card">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900"><FileText className="w-5 h-5 text-primary-600" /> Dados Fiscais e NF-e</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">Regime tributário</label><select className="input" value={fiscal.tax_regime || 'simples_nacional'} onChange={e => setFiscal({ ...fiscal, tax_regime: e.target.value })}>{Object.entries(taxRegimes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="label">Ambiente fiscal</label><select className="input" value={fiscal.fiscal_environment || 'homologation'} onChange={e => setFiscal({ ...fiscal, fiscal_environment: e.target.value })}><option value="homologation">Homologação</option><option value="production">Produção</option></select></div>
          <div><label className="label">Provedor NF-e</label><input className="input" value={fiscal.nfe_provider || 'Demo Fiscal'} onChange={e => setFiscal({ ...fiscal, nfe_provider: e.target.value })} /></div>
          <div><label className="label">Status do certificado</label><select className="input" value={fiscal.certificate_status || 'pending'} onChange={e => setFiscal({ ...fiscal, certificate_status: e.target.value })}>{Object.entries(certificateStatuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="label">Validade do certificado</label><input type="date" className="input" value={fiscal.certificate_expiration || ''} onChange={e => setFiscal({ ...fiscal, certificate_expiration: e.target.value })} /></div>
          <div className="flex items-end"><label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" checked={fiscal.nfe_enabled !== 0 && fiscal.nfe_enabled !== false} onChange={e => setFiscal({ ...fiscal, nfe_enabled: e.target.checked })} /> Integração NF-e ativa</label></div>
          <div className="sm:col-span-2"><label className="label">Observações fiscais</label><textarea className="input" rows={3} value={fiscal.notes || ''} onChange={e => setFiscal({ ...fiscal, notes: e.target.value })} /></div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900"><Archive className="w-5 h-5 text-primary-600" /> Backup e Segurança</h3>
        <div className="space-y-4">
          {[
            ['Backup automático', fiscal.auto_backup === 0 || fiscal.auto_backup === false ? 'Manual' : 'Ativo', 'Cópia diária dos dados da empresa.'],
            ['Último backup', fiscal.last_backup_at ? new Date(fiscal.last_backup_at).toLocaleString('pt-BR') : 'Aguardando execução', 'Registro demonstrativo de backup.'],
            ['Controle de acesso', 'Ativo', 'Usuários por perfil e autenticação protegida.'],
          ].map(([title, status, desc]) => (
            <div key={title} className="flex items-center justify-between gap-4 border-b border-gray-100 py-2 last:border-b-0">
              <div><p className="text-sm font-medium text-gray-900">{title}</p><p className="text-xs text-gray-500">{desc}</p></div>
              <span className="badge badge-green">{status}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4" />
          Pronto para apresentar segurança, backup e integração fiscal ao cliente.
        </div>
      </div>
    </div>
  );
}
