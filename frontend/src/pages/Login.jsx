import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Factory, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center"><Factory className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl text-gray-900">PCP Pro Industrial</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Acesse sua conta</h2>
          <p className="text-gray-500 text-sm mb-8">Entre com suas credenciais para acessar o sistema.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />{error}
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
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Contas de demonstração:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="font-medium">Admin:</span> carlos@metalurgica.com / demo123</p>
              <p><span className="font-medium">PCP:</span> ana@metalurgica.com / demo123</p>
              <p><span className="font-medium">Produção:</span> joao@metalurgica.com / demo123</p>
              <p><span className="font-medium">Super Admin:</span> superadmin@pcppro.com / admin123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-800 to-gray-900 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Factory className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">PCP Pro Industrial</h3>
          <p className="text-primary-200">Controle sua produção do pedido à entrega. Sistema completo para gestão industrial.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {[['Pedidos', 'Controle total'], ['Produção', 'Em tempo real'], ['Estoque', 'Automatizado'], ['Custos', 'Precisos']].map(([t, d], i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-white font-medium text-sm">{t}</p>
                <p className="text-primary-300 text-xs">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
