import React, { useEffect, useState } from 'react';
import { getClientRequests, createClientRequest } from '../../services/api';
import { Wrench, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ClientRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'maintenance', urgency: 'normal' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const res = await getClientRequests();
      const data = res.data?.requests || res.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createClientRequest(form);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'maintenance', urgency: 'normal' });
      await loadRequests();
    } catch {}
    setSubmitting(false);
  };

  const statusBadge = (status: string) => {
    if (status === 'completed' || status === 'resolved') return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} />Concluido</span>;
    if (status === 'in_progress' || status === 'em_andamento') return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><Clock size={12} />Em Andamento</span>;
    if (status === 'pending' || status === 'pendente') return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"><AlertTriangle size={12} />Pendente</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wrench size={24} className="text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-800">Meus Pedidos</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium">
          <Plus size={16} /> Novo Pedido
        </button>
      </div>

      {requests.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <Wrench size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum pedido encontrado</p>
          <button onClick={() => setShowForm(true)} className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
            Criar Primeiro Pedido
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r: any, i: number) => (
            <div key={r.id || i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{r.title || r.subject || `Pedido #${r.id}`}</p>
                  {r.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>}
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    {r.category && <span className="capitalize">{r.category}</span>}
                    {r.created_at && <span>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
                {statusBadge(r.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New request form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Novo Pedido</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titulo</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="Ex: Torneira com vazamento" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descricao</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm h-24 resize-none" required placeholder="Descreva o problema..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="maintenance">Manutencao</option>
                    <option value="cleaning">Limpeza</option>
                    <option value="plumbing">Canalizar</option>
                    <option value="electrical">Eletricidade</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Urgencia</label>
                  <select value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="low">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
                  {submitting ? 'Enviando...' : 'Enviar Pedido'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
