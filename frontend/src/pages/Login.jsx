import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { AlertCircle, ArrowRight, Eye, EyeOff, Factory, ShieldCheck } from 'lucide-react';

const demoAccounts = [
  { label: 'Administrador', email: 'carlos@metalurgica.com', password: 'demo123' },
  { label: 'PCP', email: 'ana@metalurgica.com', password: 'demo123' },
  { label: 'Produção', email: 'joao@metalurgica.com', password: 'demo123' },
  { label: 'Super Admin', email: 'superadmin@pcppro.com', password: 'admin123' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 lg:grid lg:grid-cols-[minmax(420px,0.85fr)_1.15fr]">
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-9 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-lg font-bold leading-tight text-gray-950">PCP Pro Industrial</span>
              <span className="block text-xs font-medium text-gray-500">Sistema de gestão de produção</span>
            </div>
          </Link>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-950">Acesse sua conta</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">Entre para acompanhar pedidos, estoque, produção, custos e indicadores.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input pr-10" placeholder="Sua senha" required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar senha">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <>Entrar no sistema <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Contas para demonstração</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <button key={account.email} type="button" onClick={() => fillDemo(account)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs transition hover:border-primary-300 hover:bg-primary-50">
                  <span className="block font-semibold text-gray-800">{account.label}</span>
                  <span className="block truncate text-gray-500">{account.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden min-h-screen items-center justify-center bg-gray-950 p-12 text-white lg:flex">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-blue-100">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Ambiente seguro para gestão industrial
          </div>
          <h2 className="text-4xl font-bold leading-tight">Do pedido à entrega, tudo conectado no PCP.</h2>
          <p className="mt-5 text-lg leading-8 text-gray-300">Use a demonstração para apresentar módulos, indicadores, custos e alertas de uma operação industrial real.</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              ['Pedidos', 'Controle total'],
              ['Produção', 'Em tempo real'],
              ['Estoque', 'Alertas automáticos'],
              ['Custos', 'Previsto x real'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
