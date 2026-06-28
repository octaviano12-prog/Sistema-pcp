import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Customers from './pages/Customers.jsx';
import Stock from './pages/Stock.jsx';
import SalesOrders from './pages/SalesOrders.jsx';
import Planning from './pages/Planning.jsx';
import ProductionOrders from './pages/ProductionOrders.jsx';
import ProductionOrderDetail from './pages/ProductionOrderDetail.jsx';
import ProductionLog from './pages/ProductionLog.jsx';
import Machines from './pages/Machines.jsx';
import BOM from './pages/BOM.jsx';
import RoutesModule from './pages/RoutesModule.jsx';
import Reports from './pages/Reports.jsx';
import Users from './pages/Users.jsx';
import Settings from './pages/Settings.jsx';
import Subscriptions from './pages/Subscriptions.jsx';
import FiscalInvoices from './pages/FiscalInvoices.jsx';
import DataImport from './pages/DataImport.jsx';
import Implementation from './pages/Implementation.jsx';
import AdminSalesPanel from './pages/AdminSalesPanel.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="stock" element={<Stock />} />
        <Route path="sales-orders" element={<SalesOrders />} />
        <Route path="planning" element={<Planning />} />
        <Route path="production-orders" element={<ProductionOrders />} />
        <Route path="production-orders/:id" element={<ProductionOrderDetail />} />
        <Route path="production-log" element={<ProductionLog />} />
        <Route path="machines" element={<Machines />} />
        <Route path="bom" element={<BOM />} />
        <Route path="routes" element={<RoutesModule />} />
        <Route path="reports" element={<Reports />} />
        <Route path="fiscal-invoices" element={<FiscalInvoices />} />
        <Route path="implementation" element={<Implementation />} />
        <Route path="data-import" element={<ProtectedRoute roles={['super_admin', 'admin', 'pcp', 'stock']}><DataImport /></ProtectedRoute>} />
        <Route path="admin-sales" element={<ProtectedRoute roles={['super_admin', 'admin']}><AdminSalesPanel /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['super_admin', 'admin']}><Users /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute roles={['super_admin', 'admin']}><Settings /></ProtectedRoute>} />
        <Route path="subscriptions" element={<ProtectedRoute roles={['super_admin', 'admin']}><Subscriptions /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
