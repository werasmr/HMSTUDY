import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { RequisitesPage } from './pages/RequisitesPage';
import { OrdersPage } from './pages/OrdersPage';
import { DisputesPage } from './pages/DisputesPage';
import { FinancesPage, TransactionsPage } from './pages/FinancesPage';
import { DevicesPage } from './pages/DevicesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminWalletsPage } from './pages/admin/AdminWalletsPage';
import type { Role } from './types';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="requisites" element={<RoleRoute roles={['TRADER', 'ADMIN']}><RequisitesPage /></RoleRoute>} />
        <Route path="sell" element={<RoleRoute roles={['TRADER', 'ADMIN']}><OrdersPage type="PAY_IN" title="Pay In" /></RoleRoute>} />
        <Route path="buy" element={<RoleRoute roles={['TRADER', 'ADMIN']}><OrdersPage type="PAY_OUT" title="Pay Out" /></RoleRoute>} />
        <Route path="disputes" element={<DisputesPage />} />
        <Route path="finances" element={<RoleRoute roles={['TRADER', 'ADMIN']}><FinancesPage /></RoleRoute>} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="devices" element={<RoleRoute roles={['TRADER']}><DevicesPage /></RoleRoute>} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin/users" element={<RoleRoute roles={['ADMIN']}><AdminUsersPage /></RoleRoute>} />
        <Route path="admin/wallets" element={<RoleRoute roles={['ADMIN']}><AdminWalletsPage /></RoleRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
