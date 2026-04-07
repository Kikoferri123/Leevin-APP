import React, { useEffect, useState } from 'react';
import { getClientPayments } from '../../services/api';
import { CreditCard, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function ClientPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClientPayments();
        const data = res.data?.payments || res.data || [];
        setPayments(Array.isArray(data) ? data : []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const statusIcon = (status: string) => {
    if (status === 'paid' || status === 'pago') return <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14} />Pago</span>;
    if (status === 'pending' || status === 'pendente') return <span className="flex items-center gap-1 text-amber-600"><Clock size={14} />Pendente</span>;
    if (status === 'overdue' || status === 'atrasado') return <span className="flex items-center gap-1 text-red-600"><AlertTriangle size={14} />Atrasado</span>;
    return <span className="text-gray-500">{status}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  // Calculate summary
  const totalPaid = payments.filter(p => p.status === 'paid' || p.status === 'pago').reduce((s, p) => s + (p.amount || p.value || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending' || p.status === 'pendente').reduce((s, p) => s + (p.amount || p.value || 0), 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue' || p.status === 'atrasado').reduce((s, p) => s + (p.amount || p.value || 0), 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CreditCard size={24} className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Meus Pagamentos</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Pago</p>
          <p className="text-xl font-bold text-green-600">EUR {totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pendente</p>
          <p className="text-xl font-bold text-amber-600">EUR {totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Atrasado</p>
          <p className="text-xl font-bold text-red-600">EUR {totalOverdue.toFixed(2)}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <CreditCard size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum pagamento encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Descricao</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((p: any, i: number) => (
                <tr key={p.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{p.date || p.due_date ? new Date(p.date || p.due_date).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{p.description || p.reference || `Pagamento #${p.id}`}</td>
                  <td className="px-4 py-3 text-right font-medium">EUR {Number(p.amount || p.value || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center text-xs">{statusIcon(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
