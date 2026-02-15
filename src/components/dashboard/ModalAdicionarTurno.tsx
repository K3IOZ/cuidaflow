import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Briefcase, Save, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalAdicionarTurno({ onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [caregivers, setCaregivers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    client_id: '',
    caregiver_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '13:00',
    type: 'Normal' as 'Normal' | 'Adaptado'
  });

  useEffect(() => {
    fetchAuxiliares();
  }, []);

  const fetchAuxiliares = async () => {
    const { data: c } = await supabase.from('clients').select('id, name').eq('is_active', true).order('name');
    const { data: g } = await supabase.from('caregivers').select('id, name').eq('is_active', true).order('name');
    if (c) setClients(c);
    if (g) setCaregivers(g);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) return alert("Seleciona um cliente!");
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('shifts')
        .insert([{
          org_id: 'a0000000-0000-0000-0000-000000000001',
          client_id: formData.client_id,
          caregiver_id: formData.caregiver_id || null, // Pode ser vazio
          shift_date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          status: formData.caregiver_id ? 'confirmed' : 'scheduled',
          type: formData.type,
          tasks: []
        }]);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error: any) {
      alert("Erro ao criar turno: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[120] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xl text-slate-900">Agendar Novo Turno</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Seleção de Cliente */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Cliente</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                required
                value={formData.client_id}
                onChange={e => setFormData({...formData, client_id: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 appearance-none"
              >
                <option value="">Escolher Cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Data */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Data</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none"
                />
              </div>
            </div>
            {/* Tipo */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Tipo de Serviço</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Adaptado">Adaptado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hora Início */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Hora Início</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="time"
                  value={formData.start_time}
                  onChange={e => setFormData({...formData, start_time: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none"
                />
              </div>
            </div>
            {/* Hora Fim */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Hora Fim</label>
              <input 
                type="time"
                value={formData.end_time}
                onChange={e => setFormData({...formData, end_time: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none"
              />
            </div>
          </div>

          {/* Seleção de Cuidadora (Opcional) */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Cuidadora (Opcional)</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={formData.caregiver_id}
                onChange={e => setFormData({...formData, caregiver_id: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 appearance-none"
              >
                <option value="">Deixar em aberto (Vazio)</option>
                {caregivers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 italic ml-1">Se não selecionares ninguém, o turno aparecerá como "Vazio" para atribuição posterior.</p>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'A agendar...' : <><Save className="w-5 h-5" /> Confirmar Agendamento</>}
          </button>
        </form>
      </div>
    </div>
  );
}