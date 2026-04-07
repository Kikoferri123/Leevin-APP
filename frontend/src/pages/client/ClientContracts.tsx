import React, { useEffect, useState } from 'react';
import { getClientContracts, getClientContract, signClientContract } from '../../services/api';
import { FileSignature, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function ClientContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const res = await getClientContracts();
      const data = res.data?.contracts || res.data || [];
      setContracts(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  const viewContract = async (id: number) => {
    try {
      const res = await getClientContract(id);
      setSelected(res.data);
    } catch {}
  };

  const handleSign = async (id: number) => {
    setSigning(true);
    try {
      await signClientContract(id, { signed: true });
      await loadContracts();
      setSelected(null);
    } catch {}
    setSigning(false);
  };

  const statusBadge = (status: string, signed: boolean) => {
    if (signed) return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} />Assinado</span>;
    if (status === 'active') return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><Clock size={12} />Ativo</span>;
    if (status === 'expired') return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><XCircle size={12} />Expirado</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">{status}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileSignature size={24} className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Meus Contratos</h1>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <FileSignature size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum contrato encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{c.type || 'Contrato'} #{c.id}</p>
                  {c.property_name && <p className="text-sm text-gray-500">{c.property_name}</p>}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    {c.start_date && <span>Inicio: {new Date(c.start_date).toLocaleDateString('pt-BR')}</span>}
                    {c.end_date && <span>Fim: {new Date(c.end_date).toLocaleDateString('pt-BR')}</span>}
                    {c.value && <span className="font-medium text-gray-700">EUR {Number(c.value).toFixed(2)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(c.status, c.signed)}
                  <button onClick={() => viewContract(c.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm hover:bg-emerald-100 flex items-center gap-1">
                    <Eye size={14} /> Ver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">Contrato #{selected.id}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Tipo</span><span>{selected.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Propriedade</span><span>{selected.property_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Inicio</span><span>{selected.start_date ? new Date(selected.start_date).toLocaleDateString('pt-BR') : '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fim</span><span>{selected.end_date ? new Date(selected.end_date).toLocaleDateString('pt-BR') : '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Valor</span><span className="font-medium">EUR {Number(selected.value || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>{statusBadge(selected.status, selected.signed)}</div>
              {selected.notes && <div className="p-3 bg-gray-50 rounded-lg text-gray-600">{selected.notes}</div>}
            </div>
            <div className="flex gap-3 mt-6">
              {!selected.signed && (
                <button onClick={() => handleSign(selected.id)} disabled={signing}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
                  {signing ? 'Assinando...' : 'Assinar Contrato'}
                </button>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
