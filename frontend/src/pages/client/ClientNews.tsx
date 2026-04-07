import React, { useEffect, useState } from 'react';
import { getClientNews } from '../../services/api';
import { Newspaper } from 'lucide-react';

export default function ClientNews() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClientNews();
        const data = res.data?.news || res.data || [];
        setNews(Array.isArray(data) ? data : []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Newspaper size={24} className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Noticias</h1>
      </div>

      {news.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <Newspaper size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma noticia no momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item: any, i: number) => (
            <div key={item.id || i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
              {item.created_at && <p className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleDateString('pt-BR')}</p>}
              <p className="text-gray-600 mt-3 text-sm leading-relaxed">{item.content || item.body}</p>
              {item.image_url && <img src={item.image_url} alt={item.title} className="mt-3 rounded-lg max-h-48 object-cover" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
