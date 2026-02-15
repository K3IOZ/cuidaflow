import { useState } from 'react';
import { X, UserPlus, Star, Phone, Award, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ModalAdicionarCuidadora({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', skill: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('caregivers')
      .insert([{
        name: formData.name,
        phone: formData.phone,
        skills: { [formData.skill.toLowerCase()]: true },
        org_id: 'a0000000-0000-0000-0000-000000000001',
        is_active: true
      }]);

    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert("Erro ao guardar cuidadora.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><UserPlus className="w-6 h-6" /></div>
            <h3 className="font-black text-xl text-slate-900">Nova Cuidadora</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Nome da Profissional</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Ex: Ana Maria Santos" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Contacto Telefónico</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium" placeholder="9..." />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Especialidade Principal</label>
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={formData.skill} onChange={e => setFormData({...formData, skill: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium appearance-none">
                <option value="">Selecionar Skill...</option>
                <option value="AVC">Apoio AVC</option>
                <option value="Mobilidade">Mobilidade Reduzida</option>
                <option value="Higiene">Higiene e Conforto</option>
                <option value="Pernoita">Pernoita</option>
              </select>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
            {loading ? 'A registar...' : <><Save className="w-5 h-5" /> Registar Profissional</>}
          </button>
        </form>
      </div>
    </div>
  );
}