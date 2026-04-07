import React, { useEffect, useState } from 'react';
import { getClientPortalProfile, updateClientPortalProfile } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User, Save, CheckCircle } from 'lucide-react';

export default function ClientProfile() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', nationality: '', birth_date: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClientPortalProfile();
        const data = res.data;
        setProfile(data);
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          nationality: data.nationality || '',
          birth_date: data.birth_date || '',
        });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateClientPortalProfile(form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <User size={24} className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle size={16} /> Perfil atualizado com sucesso!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" disabled />
            <p className="text-xs text-gray-400 mt-1">Email nao pode ser alterado</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="+351 xxx xxx xxx" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
              <input type="text" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Portuguesa" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
            <input type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          <button type="submit" disabled={saving}
            className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
            <Save size={16} />{saving ? 'Salvando...' : 'Salvar Alteracoes'}
          </button>
        </form>
      </div>

      {/* Additional info */}
      {profile && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-3">Informacoes da Conta</h2>
          <div className="space-y-2 text-sm">
            {profile.property_name && <div className="flex justify-between"><span className="text-gray-500">Propriedade</span><span>{profile.property_name}</span></div>}
            {profile.check_in && <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span>{new Date(profile.check_in).toLocaleDateString('pt-BR')}</span></div>}
            {profile.check_out && <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span>{new Date(profile.check_out).toLocaleDateString('pt-BR')}</span></div>}
            {profile.document_id && <div className="flex justify-between"><span className="text-gray-500">Documento</span><span>{profile.document_id}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}
