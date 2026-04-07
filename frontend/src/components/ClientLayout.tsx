import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileSignature, CreditCard, MessageSquare,
  Wrench, User, LogOut, Menu, X, Newspaper, HelpCircle,
  Award, Bell, Home, FolderOpen
} from 'lucide-react';

const clientNavItems = [
  { path: '/cliente', label: 'Inicio', icon: LayoutDashboard },
  { path: '/cliente/propriedade', label: 'Minha Casa', icon: Home },
  { path: '/cliente/contratos', label: 'Contratos', icon: FileSignature },
  { path: '/cliente/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { path: '/cliente/pedidos', label: 'Pedidos', icon: Wrench },
  { path: '/cliente/mensagens', label: 'Mensagens', icon: MessageSquare },
  { path: '/cliente/documentos', label: 'Documentos', icon: FolderOpen },
  { path: '/cliente/noticias', label: 'Noticias', icon: Newspaper },
  { path: '/cliente/recompensas', label: 'Recompensas', icon: Award },
  { path: '/cliente/faq', label: 'FAQ', icon: HelpCircle },
  { path: '/cliente/perfil', label: 'Meu Perfil', icon: User },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-emerald-900 to-emerald-800 text-white transition-all duration-300 flex flex-col
        fixed lg:relative z-50 h-full ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 flex items-center gap-3 border-b border-emerald-700">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-lg shrink-0">LA</div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Leevin APP</h1>
            <p className="text-xs text-emerald-300">Portal do Cliente</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {clientNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-200 hover:bg-emerald-700/50 hover:text-white'
                }`}>
                <Icon size={20} /><span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold shrink-0 cursor-pointer"
              onClick={() => navigate('/cliente/perfil')}>
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('/cliente/perfil')}>
              <p className="text-sm font-medium truncate">{user?.name || 'Cliente'}</p>
              <p className="text-xs text-emerald-300">Cliente</p>
            </div>
            <button onClick={logout} className="text-emerald-300 hover:text-white p-1" title="Sair"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-gray-700 lg:hidden">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">Cliente</span>
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
