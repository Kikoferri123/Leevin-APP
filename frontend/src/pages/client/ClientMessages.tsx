import React, { useEffect, useState } from 'react';
import { getClientMessages, sendClientMessage, markClientMessageRead } from '../../services/api';
import { MessageSquare, Send, Check, CheckCheck } from 'lucide-react';

export default function ClientMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMsg, setNewMsg] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => { loadMessages(); }, []);

  const loadMessages = async () => {
    try {
      const res = await getClientMessages();
      const data = res.data?.messages || res.data || [];
      setMessages(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendClientMessage(newMsg);
      setNewMsg({ subject: '', message: '' });
      setShowCompose(false);
      await loadMessages();
    } catch {}
    setSending(false);
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markClientMessageRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare size={24} className="text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-800">Mensagens</h1>
        </div>
        <button onClick={() => setShowCompose(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium">
          <Send size={16} /> Nova Mensagem
        </button>
      </div>

      {messages.length === 0 && !showCompose ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <MessageSquare size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma mensagem</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m: any, i: number) => (
            <div key={m.id || i}
              onClick={() => !m.read && m.id && handleMarkRead(m.id)}
              className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                m.read ? 'border-gray-100' : 'border-emerald-200 bg-emerald-50/30'
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${m.read ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                      {m.subject || m.title || 'Mensagem'}
                    </p>
                    {m.read ? <CheckCheck size={14} className="text-emerald-500" /> : <Check size={14} className="text-gray-400" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{m.message || m.body || m.content || ''}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    {m.from_name && <span>De: {m.from_name}</span>}
                    {m.created_at && <span>{new Date(m.created_at).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
              </div>
              {m.reply && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border-l-3 border-emerald-400">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Resposta da gestao:</p>
                  {m.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Nova Mensagem</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assunto</label>
                <input type="text" value={newMsg.subject} onChange={e => setNewMsg({...newMsg, subject: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="Assunto da mensagem" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mensagem</label>
                <textarea value={newMsg.message} onChange={e => setNewMsg({...newMsg, message: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm h-32 resize-none" required placeholder="Escreva sua mensagem..." />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={sending}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
                  <Send size={16} />{sending ? 'Enviando...' : 'Enviar'}
                </button>
                <button type="button" onClick={() => setShowCompose(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
