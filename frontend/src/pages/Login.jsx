import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  DollarSign,
  Eye,
  EyeOff,
  Factory,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';

const demoAccounts = [
  { label: 'Administrador', email: 'carlos@metalurgica.com', password: 'demo123', icon: ShieldCheck },
  { label: 'PCP', email: 'ana@metalurgica.com', password: 'demo123', icon: BarChart3 },
  { label: 'Produção', email: 'joao@metalurgica.com', password: 'demo123', icon: Factory },
  { label: 'Super Admin', email: 'superadmin@pcppro.com', password: 'admin123', icon: ClipboardList },
];

const featureCards = [
  { icon: ClipboardList, title: 'Pedidos', desc: 'Controle total dos pedidos e prazos de entrega.' },
  { icon: Factory, title: 'Produção', desc: 'Acompanhe o chão de fábrica em tempo real.' },
  { icon: Boxes, title: 'Estoque', desc: 'Visão completa do estoque e movimentações.' },
  { icon: DollarSign, title: 'Custos', desc: 'Custos previstos vs. reais com análise detalhada.' },
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
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(520px,0.76fr)_1fr]">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-10">
        <div className="pointer-events-none absolute -left-28 bottom-8 h-72 w-72 rounded-full border border-blue-100" />
        <div className="pointer-events-none absolute -bottom-24 left-24 h-96 w-96 rounded-full border border-blue-100" />
        <div className="pointer-events-none absolute left-12 top-2/3 grid grid-cols-6 gap-2 opacity-40">
          {Array.from({ length: 36 }).map((_, i) => <span key={i} className="h-1 w-1 rounded-full bg-blue-300" />)}
        </div>

        <div className="relative w-full max-w-lg">
          <Link to="/" className="mb-10 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-600 shadow-xl shadow-blue-500/25">
              <Factory className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="block text-2xl font-bold leading-tight text-gray-950">PCP Pro Industrial</span>
              <span className="block text-base font-medium text-slate-500">Sistema de gestão de produção</span>
            </div>
          </Link>

          <div className="rounded-xl border border-white/70 bg-white/90 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary-600">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-950">Acesse sua conta</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">Entre para acompanhar pedidos, estoque, produção, custos e indicadores.</p>
              </div>
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
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input h-14 pl-12 text-base" placeholder="seu@email.com" required />
                </div>
              </div>
              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input h-14 pl-12 pr-12 text-base" placeholder="Sua senha" required />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar senha">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-primary-600 px-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition hover:bg-primary-700">
                {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><LockKeyhole className="h-5 w-5" /> Entrar no sistema <ArrowRight className="ml-auto h-5 w-5" /></>}
              </button>
            </form>
          </div>

          <div className="mt-5 rounded-xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-primary-600">
                <Users className="h-5 w-5" />
              </div>
              <p className="font-semibold text-gray-950">Contas para demonstração</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <button key={account.email} type="button" onClick={() => fillDemo(account)} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-primary-300 hover:bg-primary-50">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
                    <account.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-gray-900">{account.label}</span>
                    <span className="block truncate text-xs text-slate-500">{account.email}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden min-h-screen items-center justify-center overflow-hidden bg-[#06142d] p-14 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_12%,rgba(37,99,235,0.35),transparent_28%),radial-gradient(circle_at_18%_88%,rgba(37,99,235,0.32),transparent_32%)]" />
        <div className="absolute -right-20 top-16 h-96 w-96 rounded-full border border-blue-400/10" />
        <div className="absolute bottom-20 left-0 h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="absolute right-16 top-16 h-64 w-64 rounded-full border border-blue-300/10" />

        <div className="relative max-w-3xl">
          <div className="mb-8 inline-flex items-center gap-3 rounded-xl border border-blue-400/30 bg-white/5 px-5 py-3 text-base text-blue-50">
            <ShieldCheck className="h-6 w-6 text-sky-300" />
            Ambiente seguro para gestão industrial
          </div>
          <h2 className="max-w-2xl text-5xl font-bold leading-tight">
            Do pedido à entrega, tudo <span className="text-primary-400">conectado</span> no PCP.
          </h2>
          <p className="mt-7 max-w-2xl text-xl leading-9 text-blue-100">Use a demonstração para apresentar módulos, indicadores, custos e alertas de uma operação industrial real.</p>

          <div className="mt-10 grid grid-cols-2 gap-6">
            {featureCards.map((item) => (
              <div key={item.title} className="rounded-xl border border-blue-300/20 bg-white/[0.04] p-6 shadow-2xl shadow-blue-950/20 backdrop-blur">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-blue-300/30 bg-primary-600/80 text-white shadow-lg shadow-primary-950/30">
                  <item.icon className="h-8 w-8" />
                </div>
                <p className="text-xl font-bold text-white">{item.title}</p>
                <p className="mt-2 text-base leading-7 text-blue-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
