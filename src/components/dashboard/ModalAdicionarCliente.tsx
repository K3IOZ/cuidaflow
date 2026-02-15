import { useState } from 'react';
import { X, UserPlus, MapPin, Phone, Heart, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ModalAdicionarCliente({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    higiene: false,
    mobilidade: false,
    medicacao: false,
    companhia: false
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const care_needs = {
      higiene: formData.higiene,
      mobilidade: formData.mobilidade,
      medicacao: formData.medicacao,
      companhia: formData.companhia
    };

    const { error } = await supabase
      .from('clients')
      .insert([{
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        care_needs: care_needs,
        org_id: 'a0000000-0000-0000-0000-000000000001', // ID da Sara
        is_active: true
      }]);

    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert("Erro ao guardar cliente: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><UserPlus className="w-6 h-6" /></div>
            <h3 className="font-black text-xl text-slate-900">Novo Cliente</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Nome Completo</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="Ex: Maria da Silva" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="912..." />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Tipo</label>
              <div className="px-4 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm">Contrato Normal</div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Morada de Atendimento</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="Rua, Número, Andar..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><Heart className="w-3 h-3" /> Necessidades de Cuidado</label>
            <div className="grid grid-cols-2 gap-2">
              {['higiene', 'mobilidade', 'medicacao', 'companhia'].map(need => (
                <button key={need} type="button" onClick={() => setFormData({...formData, [need]: !formData[need] as any})} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${formData[need as keyof typeof formData] ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                  {need.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
            {loading ? 'A guardar...' : <><Save className="w-5 h-5" /> Adicionar Cliente</>}
          </button>
        </form>
      </div>
    </div>
  );
}