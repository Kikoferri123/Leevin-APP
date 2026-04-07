import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getClientContracts, getClientPayments, getClientRequests, getClientMessages, getClientAlerts, getClientProperty } from '../../services/api';
import { Link } from 'react-router-dom';
import { FileSignature, CreditCard, Wrench, MessageSquare, Bell, Home } from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ contracts: 0, payments: 0, requests: 0, messages: 0, alerts: 0 });
  const [property, setProperty] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [contractsRes, paymentsRes, requestsRes, messagesRes, alertsRes] = await Promise.allSettled([
          getClientContracts(),
          getClientPayments(),
          getClientRequests(),
          getClientMessages(),
          getClientAlerts(),
        ]);

        setStats({
          contracts: contractsRes.status === 'fulfilled' ? (contractsRes.value.data?.length || contractsRes.value.data?.contracts?.length || 0) : 0,
          payments: paymentsRes.status === 'fulfilled' ? (paymentsRes.value.data?.length || paymentsRes.value.data?.payments?.length || 0) : 0,
          requests: requestsRes.status === 'fulfilled' ? (requestsRes.value.data?.length || requestsRes.value.data?.requests?.length || 0) : 0,
          messages: messagesRes.status === 'fulfilled' ? (messagesRes.value.data?.length || messagesRes.value.data?.messages?.length || 0) : 0,
          alerts: alertsRes.status === 'fulfilled' ? (alertsRes.value.data?.length || alertsRes.value.data?.alerts?.length || 0) : 0,
        });

        if (alertsRes.status === 'fulfilled') {
          const alertData = alertsRes.value.data?.alerts || alertsRes.value.data || [];
          setRecentAlerts(Array.isArray(alertData) ? alertData.slice(0, 5) : []);
        }

        try {
          const propRes = await getClientProperty();
          setProperty(propRes.data);
        } catch {}
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  const cards = [
    { label: 'Contratos', value: stats.contracts, icon: FileSignature, color: 'bg-blue-500', link: '/cliente/contratos' },
    { label: 'Pagamentos', value: stats.payments, icon: CreditCard, color: 'bg-green-500', link: '/cliente/pagamentos' },
    { label: 'Pedidos', value: stats.requests, icon: Wrench, color: 'bg-orange-500', link: '/cliente/pedidos' },
    { label: 'Mensagens', value: stats.messages, icon: MessageSquare, color: 'bg-purple-500', link: '/cliente/mensagens' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ola, {user?.name || 'Cliente'}!</h1>
        <p className="text-gray-500">Bem-vindo ao seu portal</p>
      </div>

      {/* Property card */}
      {property && (
        <Link to="/cliente/propriedade" className="block mb-6 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-5 text-white hover:from-emerald-700 hover:to-emerald-800 transition-colors">
          <div className="flex items-center gap-3">
            <Home size={24} />
            <div>
              <p className="text-sm text-emerald-200">Minha Casa</p>
              <p className="text-lg font-semibold">{property.name || property.property_name || 'Minha Propriedade'}</p>
              {property.address && <p className="text-sm text-emerald-200">{property.address}</p>}
            </div>
          </div>
        </Link>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.link}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`${card.color} p-2 rounded-lg text-white`}><Icon size={20} /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent alerts */}
      {recentAlerts.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-amber-500" />
            <h2 className="font-semibold text-gray-800">Alertas Recentes</h2>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert: any, i: number) => (
              <div key={alert.id || i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                  {alert.created_at && <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleDateString('pt-BR')}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
