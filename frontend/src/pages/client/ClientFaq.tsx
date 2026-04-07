import React, { useEffect, useState } from 'react';
import { getClientFaq } from '../../services/api';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function ClientFaq() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClientFaq();
        const data = res.data?.faqs || res.data || [];
        setFaqs(Array.isArray(data) ? data : []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle size={24} className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Perguntas Frequentes</h1>
      </div>

      {faqs.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <HelpCircle size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma FAQ disponivel</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq: any, i: number) => {
            const isOpen = openId === (faq.id || i);
            return (
              <div key={faq.id || i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button onClick={() => setOpenId(isOpen ? null : (faq.id || i))}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                  <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
