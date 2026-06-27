import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const plans = [
  { id: 'starter', name: 'Starter', price: 147, features: ['Até 3 usuários', 'Até 100 produtos', 'Até 50 OPs/mês', 'Estoque básico', 'Dashboard básico'] },
  { id: 'profissional', name: 'Profissional', price: 297, features: ['Até 10 usuários', 'Produtos ilimitados', 'OPs ilimitadas', 'Ficha técnica', 'Estoque completo', 'Apontamento', 'Relatórios', 'Custos por OP'] },
  { id: 'industrial', name: 'Industrial', price: 597, features: ['Usuários ilimitados', 'MRP', 'Carga máquina', 'Qualidade', 'Manutenção', 'API', 'Integrações', 'Suporte prioritário'] },
];

const statusLabels = { active: 'Ativa', trial: 'Teste', overdue: 'Vencida', blocked: 'Bloqueada', cancelled: 'Cancelada' };
const statusColors = { active: 'badge-green', trial: 'badge-blue', overdue: 'badge-red', blocked: 'badge-red', cancelled: 'badge-gray' };

export default function Subscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => { api.get('/subscriptions').then(setSubscriptions).catch(() => {}); }, []);

  const currentSub = subscriptions[0];
  const currentPlan = plans.find(p => p.id === currentSub?.plan) || plans[0];

  return (
    <div className="space-y-6">
      <div><h1 className="page-title">Assinatura</h1><p className="page-subtitle">Gerencie seu plano e assinatura</p></div>

      {/* Current plan */}
      <div className="card border-2 border-primary-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-lg text-gray-900">Plano {currentPlan.name}</h3>
              {currentSub && <span className={`badge ${statusColors[currentSub.status]}`}>{statusLabels[currentSub.status]}</span>}
            </div>
            <p className="text-gray-500 text-sm">
              {currentSub?.next_billing_date ? `Próximo vencimento: ${new Date(currentSub.next_billing_date).toLocaleDateString('pt-BR')}` : 'Sem dados de cobrança'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">R$ {currentPlan.price}</p>
            <p className="text-sm text-gray-500">/mês</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recursos inclusos:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentPlan.features.map((f, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-gray-600"><CheckCircle className="w-3 h-3 text-green-500" />{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Plans comparison */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Alterar plano</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={`card ${currentSub?.plan === plan.id ? 'ring-2 ring-primary-500' : ''}`}>
              <h4 className="font-bold text-gray-900">{plan.name}</h4>
              <p className="text-2xl font-bold text-primary-600 mt-2">R$ {plan.price}<span className="text-sm text-gray-500 font-normal">/mês</span></p>
              <ul className="mt-4 space-y-1.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600"><CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              {currentSub?.plan !== plan.id && (
                <button className="btn-secondary w-full justify-center mt-4 text-xs">Mudar para {plan.name}</button>
              )}
              {currentSub?.plan === plan.id && (
                <div className="mt-4 text-center text-xs text-primary-600 font-medium">Plano atual</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
