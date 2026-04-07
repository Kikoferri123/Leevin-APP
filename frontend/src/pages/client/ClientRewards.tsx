import React, { useEffect, useState } from 'react';
import { getClientRewards } from '../../services/api';
import { Award, Star, Gift } from 'lucide-react';

export default function ClientRewards() {
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClientRewards();
        setRewards(res.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  const points = rewards?.points || rewards?.total_points || 0;
  const transactions = rewards?.transactions || rewards?.history || [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Award size={24} className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Recompensas</h1>
      </div>

      {/* Points card */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3">
          <Star size={32} />
          <div>
            <p className="text-amber-200 text-sm">Seus Pontos</p>
            <p className="text-3xl font-bold">{points}</p>
          </div>
        </div>
      </div>

      {/* History */}
      {Array.isArray(transactions) && transactions.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b"><h2 className="font-semibold text-gray-800">Historico</h2></div>
          <div className="divide-y">
            {transactions.map((t: any, i: number) => (
              <div key={t.id || i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${t.points > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <Gift size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t.description || t.reason || 'Transacao'}</p>
                    {t.created_at && <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('pt-BR')}</p>}
                  </div>
                </div>
                <span className={`font-bold ${t.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {t.points > 0 ? '+' : ''}{t.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <Gift size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma transacao de pontos ainda</p>
        </div>
      )}
    </div>
  );
}
