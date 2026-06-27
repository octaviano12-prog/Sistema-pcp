import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LayoutDashboard, Package, Users, Warehouse, ShoppingCart, Calendar, ClipboardList, Factory, Cog, BarChart3, UserCog, CreditCard, Menu, X, LogOut, Bell, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/app/products', icon: Package, label: 'Produtos' },
  { path: '/app/customers', icon: Users, label: 'Clientes' },
  { path: '/app/stock', icon: Warehouse, label: 'Estoque' },
  { path: '/app/sales-orders', icon: ShoppingCart, label: 'Pedidos' },
  { path: '/app/planning', icon: Calendar, label: 'Planejamento PCP' },
  { path: '/app/production-orders', icon: ClipboardList, label: 'Ordens de Produção' },
  { path: '/app/production-log', icon: Factory, label: 'Apontamento' },
  { path: '/app/machines', icon: Cog, label: 'Máquinas' },
  { path: '/app/bom', icon: Package, label: 'Ficha Técnica' },
  { path: '/app/routes', icon: Factory, label: 'Roteiros' },
  { path: '/app/reports', icon: BarChart3, label: 'Relatórios' },
  { path: '/app/users', icon: UserCog, label: 'Usuários' },
  { path: '/app/settings', icon: Cog, label: 'Configurações' },
  { path: '/app/subscriptions', icon: CreditCard, label: 'Assinatura' },
];

const roleLabels = { super_admin: 'Super Admin', admin: 'Administrador', pcp: 'PCP', production: 'Produção', stock: 'Estoque', purchases: 'Compras', financial: 'Financeiro', viewer: 'Visualizador' };

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">PCP Pro</h1>
            <p className="text-gray-400 text-xs">Industrial</p>
          </div>
          <button className="lg:hidden ml-auto text-gray-400" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="px-3 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}>
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
          <div className="flex-1 flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar OP, produto, cliente..." className="bg-transparent text-sm outline-none flex-1" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-700"><Bell className="w-5 h-5" /><span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">3</span></button>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-xs">{user?.name?.charAt(0) || 'U'}</div>
                <div className="hidden md:block text-left">
                  <p className="font-medium text-gray-700 text-xs">{user?.name}</p>
                  <p className="text-gray-500 text-[11px]">{roleLabels[user?.role] || user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut className="w-4 h-4" />Sair</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
