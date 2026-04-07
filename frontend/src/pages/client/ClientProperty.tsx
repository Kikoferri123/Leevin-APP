import React, { useEffect, useState } from 'react';
import { getClientProperty } from '../../services/api';
import { Home, MapPin, Bed, Bath, Key } from 'lucide-react';

export default function ClientProperty() {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClientProperty();
        setProperty(res.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

  if (!property) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Home size={24} className="text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-800">Minha Casa</h1>
        </div>
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <Home size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma propriedade associada</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Home size={24} className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Minha Casa</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
          <h2 className="text-xl font-bold">{property.name || property.property_name || 'Minha Propriedade'}</h2>
          {property.address && (
            <div className="flex items-center gap-2 mt-2 text-emerald-200">
              <MapPin size={16} /><span>{property.address}</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {property.type && (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Key size={20} className="text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Tipo</p>
                <p className="text-sm font-medium capitalize">{property.type}</p>
              </div>
            )}
            {property.rooms && (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Bed size={20} className="text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Quartos</p>
                <p className="text-sm font-medium">{property.rooms}</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Bath size={20} className="text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Banheiros</p>
                <p className="text-sm font-medium">{property.bathrooms}</p>
              </div>
            )}
          </div>

          {/* Property details */}
          <div className="space-y-3 text-sm">
            {property.monthly_rent && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Renda Mensal</span>
                <span className="font-medium">EUR {Number(property.monthly_rent).toFixed(2)}</span>
              </div>
            )}
            {property.contract_start && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Inicio do Contrato</span>
                <span>{new Date(property.contract_start).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {property.contract_end && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Fim do Contrato</span>
                <span>{new Date(property.contract_end).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {property.owner_name && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Gestor</span>
                <span>{property.owner_name}</span>
              </div>
            )}
            {property.notes && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
                <p className="font-medium mb-1">Notas:</p>
                <p>{property.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
