import { useState } from 'react';
import { X, UserPlus, Phone, Award, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ModalAdicionarCuidadora({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  
  // Estado para os campos básicos e skills
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Agora usamos um objeto para skills multiplas
  const [skills, setSkills] = useState({
    higiene: false,
    mobilidade: false,
    medicacao: false,
    companhia: false,
    alimentacao: false,
    limpeza: false,
    compras: false,
    enfermagem: false, // Extra skill útil
    conducao: false    // Extra skill útil
  });

  // Lista de skills disponíveis para seleção
  const skillsList = [
    'higiene', 'mobilidade', 'medicacao', 'companhia', 
    'alimentacao', 'limpeza', 'compras', 'enfermagem', 'conducao'
  ] as const;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Preparar JSON de skills apenas com as verdadeiras
    // Ex: { higiene: true, mobilidade: true }
    const skillsJSON = Object.fromEntries(
      Object.entries(skills).filter(([_, value]) => value === true)
    );

    const { error } = await supabase
      .from('caregivers')
      .insert([{
        name: name,
        phone: phone,
        skills: skillsJSON, // Guardamos o objeto completo
        org_id: 'a0000000-0000-0000-0000-000000000001',
        is_active: true
      }]);

    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert("Erro ao guardar cuidadora: " + error.message);
    }
    setLoading(false);
  };

  const toggleSkill = (skill: keyof typeof skills) => {
    setSkills(prev => ({ ...prev, [skill]: !prev[skill] }));
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
            <input 
              required 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium" 
              placeholder="Ex: Ana Maria Santos" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Contacto Telefónico</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium" 
                placeholder="9..." 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
              <Award className="w-3 h-3" /> Competências & Skills
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
              {skillsList.map(skill => (
                <button 
                  key={skill} 
                  type="button" 
                  onClick={() => toggleSkill(skill)} 
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all capitalize ${
                    skills[skill] ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
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