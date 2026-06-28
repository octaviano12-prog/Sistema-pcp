import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ClipboardList,
  Cog,
  CreditCard,
  Database,
  Factory,
  FileText,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  UserCog,
  Users,
  Warehouse,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/app/products', icon: Package, label: 'Produtos' },
  { path: '/app/customers', icon: Users, label: 'Clientes' },
  { path: '/app/stock', icon: Warehouse, label: 'Estoque' },
  { path: '/app/sales-orders', icon: ShoppingCart, label: 'Pedidos' },
  { path: '/app/fiscal-invoices', icon: FileText, label: 'Nota Fiscal' },
  { path: '/app/implementation', icon: ClipboardCheck, label: 'Implantação' },
  { path: '/app/data-import', icon: Database, label: 'Importação', roles: ['super_admin', 'admin', 'pcp', 'stock'] },
  { path: '/app/planning', icon: Calendar, label: 'Planejamento PCP' },
  { path: '/app/production-orders', icon: ClipboardList, label: 'Ordens de Produção' },
  { path: '/app/production-log', icon: Factory, label: 'Apontamento' },
  { path: '/app/machines', icon: Cog, label: 'Máquinas' },
  { path: '/app/bom', icon: Package, label: 'Ficha Técnica' },
  { path: '/app/routes', icon: Factory, label: 'Roteiros' },
  { path: '/app/reports', icon: BarChart3, label: 'Relatórios' },
  { path: '/app/users', icon: UserCog, label: 'Usuários', roles: ['super_admin', 'admin'] },
  { path: '/app/settings', icon: Cog, label: 'Configurações', roles: ['super_admin', 'admin'] },
  { path: '/app/admin-sales', icon: BarChart3, label: 'Painel Comercial', roles: ['super_admin', 'admin'] },
  { path: '/app/subscriptions', icon: CreditCard, label: 'Assinatura', roles: ['super_admin', 'admin'] },
];

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  pcp: 'PCP',
  production: 'Produção',
  stock: 'Estoque',
  purchases: 'Compras',
  financial: 'Financeiro',
  viewer: 'Visualizador',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#06142d] shadow-2xl shadow-slate-950/20 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:inset-auto lg:translate-x-0`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(37,99,235,0.22),transparent_32%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-950/40">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">PCP Pro</h1>
              <p className="text-xs text-blue-200">Industrial</p>
            </div>
            <button className="ml-auto text-gray-400 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1 overflow-y-auto px-3 py-4" style={{ maxHeight: 'calc(100vh - 92px)' }}>
            {visibleItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mx-4 mt-2 hidden rounded-xl border border-white/10 bg-white/5 p-4 text-blue-50 lg:block">
            <p className="text-xs text-blue-200">Ambiente</p>
            <p className="mt-1 font-semibold text-white">Produção</p>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm shadow-slate-200/50 backdrop-blur lg:px-6">
          <button className="text-gray-600 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center gap-3">
            <div className="hidden max-w-lg flex-1 items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 md:flex">
              <Search className="h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Buscar OP, produto, cliente..." className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-700" aria-label="Alertas">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
            </button>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">{user?.name?.charAt(0) || 'U'}</div>
                <div className="hidden text-left md:block">
                  <p className="text-xs font-medium text-gray-700">{user?.name}</p>
                  <p className="text-[11px] text-gray-500">{roleLabels[user?.role] || user?.role}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
