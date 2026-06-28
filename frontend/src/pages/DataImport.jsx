import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Database, FileSpreadsheet, Upload, AlertCircle, CheckCircle } from 'lucide-react';

const templates = {
  products: `codigo,nome,tipo,unidade,custo,preco,estoque_minimo,estoque_maximo
PA-001,Produto Acabado Exemplo,finished,UN,45.50,89.90,10,100
MP-001,Chapa de Aço,raw,KG,8.20,0,50,500`,
  customers: `nome,cnpj,email,telefone,whatsapp,endereco,cidade,uf
Indústria Cliente Ltda,11.222.333/0001-44,compras@cliente.com.br,1133334444,11999998888,Rua Exemplo 100,São Paulo,SP`,
  stock: `codigo,quantidade,custo,motivo
PA-001,20,45.50,Estoque inicial
MP-001,200,8.20,Estoque inicial`,
};

const labels = {
  products: 'Produtos',
  customers: 'Clientes',
  stock: 'Estoque inicial',
};

export default function DataImport() {
  const { user } = useAuth();
  const allowedTypes = useMemo(() => {
    if (['super_admin', 'admin', 'pcp'].includes(user?.role)) return Object.keys(labels);
    if (user?.role === 'stock') return ['stock'];
    return [];
  }, [user?.role]);
  const [type, setType] = useState('products');
  const [csv, setCsv] = useState(templates.products);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (allowedTypes.length > 0 && !allowedTypes.includes(type)) {
      setType(allowedTypes[0]);
      setCsv(templates[allowedTypes[0]]);
      setResult(null);
    }
  }, [allowedTypes, type]);

  const changeType = (nextType) => {
    setType(nextType);
    setCsv(templates[nextType]);
    setResult(null);
  };

  const submit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await api.post(`/import/${type}`, { csv });
      setResult(response);
    } catch (error) {
      setResult({ imported: 0, errors: [error.message] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-primary-600" />
            <h1 className="page-title">Importação de Dados</h1>
          </div>
          <p className="page-subtitle">Importe produtos, clientes e estoque inicial por CSV para acelerar a implantação.</p>
        </div>
        <span className="badge badge-blue">CSV / Excel exportado</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(labels).filter(([key]) => allowedTypes.includes(key)).map(([key, label]) => (
          <button
            key={key}
            onClick={() => changeType(key)}
            className={`rounded-xl border p-5 text-left transition ${type === key ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-100' : 'border-gray-200 bg-white hover:border-primary-200'}`}
          >
            <Database className="mb-3 h-6 w-6 text-primary-600" />
            <p className="font-semibold text-gray-900">{label}</p>
            <p className="mt-1 text-sm text-gray-500">Modelo pronto para copiar do Excel.</p>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900">CSV de {labels[type]}</h3>
            <p className="mt-1 text-sm text-gray-500">Cole aqui o conteúdo exportado do Excel em formato CSV.</p>
          </div>
          <button onClick={() => setCsv(templates[type])} className="btn-secondary">Usar modelo</button>
        </div>
        <textarea
          className="input min-h-[280px] font-mono text-xs leading-5"
          value={csv}
          onChange={e => setCsv(e.target.value)}
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">Separador esperado: vírgula. Cabeçalhos aceitam português ou inglês.</div>
          <button onClick={submit} disabled={loading} className="btn-primary justify-center">
            <Upload className="h-4 w-4" />
            {loading ? 'Importando...' : 'Importar dados'}
          </button>
        </div>
      </div>

      {result && (
        <div className={`rounded-xl border p-4 ${result.errors?.length ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          <div className="flex items-center gap-2 font-semibold">
            {result.errors?.length ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
            {result.imported} registro(s) importado(s)
          </div>
          {result.errors?.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {result.errors.map((error, index) => <li key={index}>{error}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
