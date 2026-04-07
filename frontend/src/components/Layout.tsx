import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, ArrowDownCircle, ArrowUpCircle, FileText, BarChart3,
  Home, Users, FileSignature, FolderOpen, Bell, Settings, LogOut,
  Menu, X, ChevronDown, DollarSign, TrendingUp, Building2, BedDouble,
  CreditCard, Wrench, FileBarChart, HelpCircle, Wallet, Shield, AlertTriangle,
  Newspaper, MessageSquare, Award, LogIn, Star, UserPlus, Palette
} from 'lucide-react';

const allNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'financeiro', 'operacional', 'visualizador'] },
  { label: 'Financeiro', icon: DollarSign, roles: ['admin', 'financeiro', 'operacional'], children: [
    { path: '/entradas', label: 'Entradas (In)', icon: ArrowDownCircle, roles: ['admin', 'financeiro', 'operacional'] },
    { path: '/saidas', label: 'Saidas (Out)', icon: ArrowUpCircle, roles: ['admin', 'financeiro', 'operacional'] },
    { path: '/pagamentos', label: 'Pagamentos', icon: CreditCard, roles: ['admin', 'financeiro', 'operacional'] },
    { path: '/pnl-caixa', label: 'P&L Caixa', icon: FileText, roles: ['admin', 'financeiro'] },
    { path: '/pnl-competencia', label: 'P&L Competencia', icon: TrendingUp, roles: ['admin', 'financeiro'] },
    { path: '/depositos', label: 'Depositos', icon: Wallet, roles: ['admin', 'financeiro'] },
    { path: '/inadimplencia', label: 'Inadimplencia', icon: AlertTriangle, roles: ['admin', 'financeiro'] },
  ]},
  { label: 'Propriedades', icon: Building2, roles: ['admin', 'financeiro', 'operacional', 'visualizador'], children: [
    { path: '/propriedades', label: 'Lista', icon: Home, roles: ['admin', 'financeiro', 'operacional', 'visualizador'] },
    { path: '/ranking', label: 'Ranking', icon: BarChart3, roles: ['admin', 'financeiro'] },
  ]},
  { path: '/disponibilidade', label: 'Disponibilidade', icon: BedDouble, roles: ['admin', 'financeiro', 'operacional', 'visualizador'] },
  { path: '/clientes', label: 'Clientes', icon: Users, roles: ['admin', 'financeiro', 'operacional', 'visualizador'] },
  { path: '/landlords', label: 'Landlords', icon: Building2, roles: ['admin', 'financeiro'] },
  { path: '/rh', label: 'RH', icon: Users, roles: ['admin'] },
  { path: '/contratos', label: 'Contratos', icon: FileSignature, roles: ['admin', 'financeiro', 'operacional', 'visualizador'] },
  { path: '/documentos', label: 'Documentos', icon: FolderOpen, roles: ['admin', 'financeiro', 'operacional', 'visualizador'] },
  { path: '/manutencao', label: 'Pedidos / Manutencao', icon: Wrench, roles: ['admin', 'operacional'] },
  { path: '/alertas', label: 'Alertas', icon: Bell, roles: ['admin', 'financeiro', 'operacional', 'visualizador'] },
  { path: '/relatorios', label: 'Relatorios', icon: FileBarChart, roles: ['admin', 'financeiro'] },
  { label: 'App Mobile', icon: Newspaper, roles: ['admin', 'operacional'], children: [
    { path: '/admin/noticias', label: 'Noticias', icon: Newspaper, roles: ['admin', 'operacional'] },
    { path: '/admin/mensagens', label: 'Mensagens', icon: MessageSquare, roles: ['admin', 'operacional'] },
    { path: '/admin/recompensas', label: 'Recompensas', icon: Award, roles: ['admin', 'operacional'] },
    { path: '/admin/checkins', label: 'Check-ins', icon: LogIn, roles: ['admin', 'operacional'] },
    { path: '/admin/avaliacoes', label: 'Avaliacoes', icon: Star, roles: ['admin', 'operacional'] },
    { path: '/admin/faq', label: 'FAQ', icon: HelpCircle, roles: ['admin', 'operacional'] },
    { path: '/admin/indicacoes', label: 'Indicacoes', icon: UserPlus, roles: ['admin', 'operacional'] },
  ]},
  { path: '/branding', label: 'Marca / Branding', icon: Palette, roles: ['admin'] },
  { path: '/ajuda', label: 'Ajuda', icon: HelpCircle, roles: ['admin', 'financeiro', 'operacional', 'visualizador'] },
  { path: '/auditoria', label: 'Auditoria', icon: Shield, roles: ['admin'] },
  { path: '/configuracoes', label: 'Configuracoes', icon: Settings, roles: ['admin'] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['Financeiro', 'Propriedades']);
  const userRole = user?.role || 'visualizador';

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = allNavItems.filter(item => item.roles?.includes(userRole)).map(item => {
    if (item.children) {
      return { ...item, children: item.children.filter(child => child.roles?.includes(userRole)) };
    }
    return item;
  }).filter(item => !item.children || (item.children && item.children.length > 0));

  // Close mobile menu on navigation
  const handleNavClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col
        fixed lg:relative z-50 h-full ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 flex items-center gap-3 border-b border-slate-700">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-lg shrink-0">LA</div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg leading-tight">Leevin APP</h1>
              <p className="text-xs text-slate-400">Property Management</p>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item: any) => {
            if (item.children) {
              const isOpen = openGroups.includes(item.label);
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <button onClick={() => toggleGroup(item.label)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors">
                    <Icon size={20} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                  {isOpen && sidebarOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child: any) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link key={child.path} to={child.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(child.path) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}>
                            <ChildIcon size={16} /><span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path!}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(item.path!) ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
                <Icon size={20} />{sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shrink-0 cursor-pointer hover:bg-blue-400 transition-colors"
              onClick={() => navigate('/perfil')} title="Meu Perfil">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('/perfil')}>
                <p className="text-sm font-medium truncate hover:text-blue-300 transition-colors">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            )}
            <button onClick={logout} className="text-slate-400 hover:text-white p-1" title="Sair"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => {
            if (window.innerWidth < 1024) {
              setMobileMenuOpen(!mobileMenuOpen);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }} className="text-gray-500 hover:text-gray-700">
            {(sidebarOpen || mobileMenuOpen) ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium capitalize">{userRole}</span>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
