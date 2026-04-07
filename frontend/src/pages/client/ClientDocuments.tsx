import React, { useEffect, useState, useRef } from 'react';
import { getClientDocuments, uploadClientDocument } from '../../services/api';
import { FolderOpen, Upload, FileText, Download } from 'lucide-react';

export default function ClientDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    try {
      const res = await getClientDocuments();
      const data = res.data?.documents || res.data || [];
      setDocuments(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadClientDocument(file);
      await loadDocs();
    } catch {}
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderOpen size={24} className="text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-800">Meus Documentos</h1>
        </div>
        <label className={`px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          <Upload size={16} />{uploading ? 'Enviando...' : 'Enviar Documento'}
          <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <FolderOpen size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc: any, i: number) => (
            <div key={doc.id || i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg"><FileText size={24} className="text-emerald-600" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{doc.filename || doc.name || `Documento ${doc.id}`}</p>
                <div className="flex gap-3 text-xs text-gray-400 mt-1">
                  {doc.category && <span className="capitalize">{doc.category}</span>}
                  {doc.created_at && <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
              {doc.url && (
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Download size={18} /></a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
