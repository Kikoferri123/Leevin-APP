import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TransactionsIn from './pages/TransactionsIn';
import TransactionsOut from './pages/TransactionsOut';
import PnL from './pages/PnL';
import Properties from './pages/Properties';
import PropertyProfile from './pages/PropertyProfile';
import Ranking from './pages/Ranking';
import Clients from './pages/Clients';
import ClientProfile from './pages/ClientProfile';
import Contracts from './pages/Contracts';
import Documents from './pages/Documents';
import Alerts from './pages/Alerts';
import SettingsPage from './pages/SettingsPage';
import Availability from './pages/Availability';
import PaymentTracking from './pages/PaymentTracking';
import UserProfile from './pages/UserProfile';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import DepositTracking from './pages/DepositTracking';
import HelpManual from './pages/HelpManual';
import Landlords from './pages/Landlords';
import LandlordProfile from './pages/LandlordProfile';
import HR from './pages/HR';
import EmployeeProfile from './pages/EmployeeProfile';
import Inadimplencia from './pages/Inadimplencia';
import AuditLogs from './pages/AuditLogs';
import PublicSign from './pages/PublicSign';
import AdminNews from './pages/AdminNews';
import AdminMessages from './pages/AdminMessages';
import AdminRewards from './pages/AdminRewards';
import AdminCheckins from './pages/AdminCheckins';
import AdminReviews from './pages/AdminReviews';
import AdminFaq from './pages/AdminFaq';
import AdminReferrals from './pages/AdminReferrals';
import BrandingPage from './pages/BrandingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/sign/:token" element={<PublicSign />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/entradas" element={<ProtectedRoute><TransactionsIn /></ProtectedRoute>} />
      <Route path="/saidas" element={<ProtectedRoute><TransactionsOut /></ProtectedRoute>} />
      <Route path="/pnl-caixa" element={<ProtectedRoute><PnL mode="caixa" /></ProtectedRoute>} />
      <Route path="/pnl-competencia" element={<ProtectedRoute><PnL mode="competencia" /></ProtectedRoute>} />
      <Route path="/pagamentos" element={<ProtectedRoute><PaymentTracking /></ProtectedRoute>} />
      <Route path="/depositos" element={<ProtectedRoute><DepositTracking /></ProtectedRoute>} />
      <Route path="/propriedades" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
      <Route path="/propriedades/:id" element={<ProtectedRoute><PropertyProfile /></ProtectedRoute>} />
      <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/clientes/:id" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
      <Route path="/landlords" element={<ProtectedRoute><Landlords /></ProtectedRoute>} />
      <Route path="/landlords/:id" element={<ProtectedRoute><LandlordProfile /></ProtectedRoute>} />
      <Route path="/rh" element={<ProtectedRoute><HR /></ProtectedRoute>} />
      <Route path="/rh/funcionarios/:id" element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>} />
      <Route path="/inadimplencia" element={<ProtectedRoute><Inadimplencia /></ProtectedRoute>} />
      <Route path="/auditoria" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
      <Route path="/contratos" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
      <Route path="/documentos" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/disponibilidade" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
      <Route path="/manutencao" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
      <Route path="/alertas" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/ajuda" element={<ProtectedRoute><HelpManual /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/branding" element={<ProtectedRoute><BrandingPage /></ProtectedRoute>} />
      <Route path="/admin/noticias" element={<ProtectedRoute><AdminNews /></ProtectedRoute>} />
      <Route path="/admin/mensagens" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
      <Route path="/admin/recompensas" element={<ProtectedRoute><AdminRewards /></ProtectedRoute>} />
      <Route path="/admin/checkins" element={<ProtectedRoute><AdminCheckins /></ProtectedRoute>} />
      <Route path="/admin/avaliacoes" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
      <Route path="/admin/faq" element={<ProtectedRoute><AdminFaq /></ProtectedRoute>} />
      <Route path="/admin/indicacoes" element={<ProtectedRoute><AdminReferrals /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </ErrorBoundary>
  );
}
