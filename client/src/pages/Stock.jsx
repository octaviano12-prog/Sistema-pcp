import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Plus, Search, ArrowDownCircle, ArrowUpCircle, X, Package, AlertTriangle } from 'lucide-react';

const statusColors = { normal: 'badge-green', low: 'badge-yellow', critical: 'badge-red' };
const statusLabels = { normal: 'Normal', low: 'Baixo', critical: 'Crítico' };
const movementTypes = { entrada_manual: 'Entrada Manual', saida_manual: 'Saída Manual', compra: 'Compra', consumo_op: 'Consumo em OP', producao: 'Produção Finalizada', ajuste_positivo: 'Ajuste +', ajuste_negativo: 'Ajuste -', reserva: 'Reserva', estorno: 'Estorno' };

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [showMovement, setShowMovement] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ product_id: '', type: 'entrada_manual', quantity: 0, unit_cost: 0, reason: '' });

  const load = () => api.get('/stock').then(setStock);
  useEffect(() => { load(); }, []);

  const filtered = stock.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code?.toLowerCase().includes(search.toLowerCase()));

  const openMovement = (productId) => { setForm({ product_id: productId, type: 'entrada_manual', quantity: 0, unit_cost: 0, reason: '' }); setShowMovement(true); };

  const handleMovement = async () => {
    try {
      await api.post('/stock/movement', form);
      setShowMovement(false); load();
    } catch (e) { alert(e.message); }
  };

  const viewHistory = async (product) => {
    setSelectedProduct(product);
    const data = await api.get(`/stock/product/${product.id}`);
    setMovements(data);
    setShowHistory(true);
  };

  const criticalCount = stock.filter(s => s.stock_status === 'critical').length;
  const lowCount = stock.filter(s => s.stock_status === 'low').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="page-title">Estoque</h1><p className="page-subtitle">Controle de estoque de produtos e materiais</p></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card"><p className="stat-value">{stock.length}</p><p className="stat-label">Produtos cadastrados</p></div>
        <div className="stat-card border-l-4 border-l-yellow-400"><p className="stat-value text-yellow-600">{lowCount}</p><p className="stat-label">Estoque baixo</p></div>
        <div className="stat-card border-l-4 border-l-red-400"><p className="stat-value text-red-600">{criticalCount}</p><p className="stat-label">Estoque crítico</p></div>
      </div>

      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" /></div>

      <div className="table-container">
        <table className="w-full">
          <thead className="table-header"><tr><th>Código</th><th>Produto</th><th>Un.</th><th>Estoque Atual</th><th>Reservado</th><th>Disponível</th><th>Mínimo</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody className="table-body">
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="font-mono text-xs">{p.code}</td>
                <td className="font-medium">{p.name}</td>
                <td>{p.unit}</td>
                <td className="font-medium">{p.current_stock?.toFixed(1)}</td>
                <td>{p.reserved_stock?.toFixed(1)}</td>
                <td className="font-medium">{p.available_stock?.toFixed(1)}</td>
                <td>{p.min_stock}</td>
                <td><span className={`badge ${statusColors[p.stock_status]}`}>{statusLabels[p.stock_status]}</span></td>
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => openMovement(p.id)} className="text-primary-600 hover:text-primary-700 p-1 text-xs font-medium">+ Movimentar</button>
                  <button onClick={() => viewHistory(p)} className="text-gray-400 hover:text-gray-600 p-1 ml-1"><Search className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-gray-400">Nenhum produto encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Movement Modal */}
      {showMovement && (
        <div className="modal-overlay" onClick={() => setShowMovement(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Movimentação de Estoque</h3><button onClick={() => setShowMovement(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="label">Tipo</label><select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{Object.entries(movementTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="label">Quantidade</label><input type="number" step="0.01" className="input" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Custo Unitário (R$)</label><input type="number" step="0.01" className="input" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="label">Motivo</label><input className="input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowMovement(false)} className="btn-secondary">Cancelar</button><button onClick={handleMovement} className="btn-primary">Registrar</button></div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="text-lg font-semibold">Histórico - {selectedProduct?.name}</h3><button onClick={() => setShowHistory(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5">
              <div className="table-container">
                <table className="w-full">
                  <thead className="table-header"><tr><th>Data</th><th>Tipo</th><th>Qtd</th><th>Custo Unit.</th><th>Motivo</th></tr></thead>
                  <tbody className="table-body">
                    {movements.map(m => (
                      <tr key={m.id}>
                        <td className="text-xs">{new Date(m.created_at).toLocaleString('pt-BR')}</td>
                        <td><span className="badge badge-blue">{movementTypes[m.type] || m.type}</span></td>
                        <td className="font-medium">{m.quantity}</td>
                        <td>R$ {m.unit_cost?.toFixed(2)}</td>
                        <td className="text-xs">{m.reason}</td>
                      </tr>
                    ))}
                    {movements.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-gray-400">Sem movimentações</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
