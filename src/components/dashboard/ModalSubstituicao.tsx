import { useState, useEffect } from 'react';
import { X, MapPin, Star, AlertCircle, Check, Brain, Activity } from 'lucide-react'; // Adicionei ícones extra
import { supabase } from '@/lib/supabase';

interface ModalProps {
  onClose: () => void;
  turno: any;
  onSuccess: () => void;
}

export default function ModalSubstituicao({ onClose, turno, onSuccess }: ModalProps) {
  const [cuidadoras, setCuidadoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (turno) fetchDadosMatching();
  }, [turno]);

  const fetchDadosMatching = async () => {
    setLoading(true);
    try {
      // 1. Buscar Cuidadoras
      const { data: allCaregivers } = await supabase
        .from('caregivers')
        .select('*')
        .eq('org_id', 'a0000000-0000-0000-0000-000000000001')
        .eq('is_active', true);

      // 2. Buscar Ocupação
      const { data: busyShifts } = await supabase
        .from('shifts')
        .select('caregiver_id')
        .eq('shift_date', turno.data)
        .neq('status', 'no_show')
        .neq('id', turno.id);

      const busyIds = busyShifts?.map((s: any) => s.caregiver_id) || [];

      // 3. Processar Dados
      const processadas = (allCaregivers || []).map((c: any) => {
        const isOcupada = busyIds.includes(c.id);
        
        // Simulação inteligente de Match
        let baseMatch = 75 + Math.floor(Math.random() * 20); 
        // Penalizar se estiver longe (>5km)
        const distancia = parseFloat((Math.random() * 8).toFixed(1));
        if (distancia > 5) baseMatch -= 15;
        // Bónus para as "Favoritas"
        if (c.name.includes('Jocelina') || c.name.includes('Vera')) baseMatch = 98;
        if (isOcupada) baseMatch = 10;

        return {
          ...c,
          isDisponivel: !isOcupada,
          match: baseMatch,
          rating: (4.1 + Math.random() * 0.8).toFixed(1),
          distancia: distancia,
          // Garante que skills é um array, mesmo que venha null da DB
          skillsLista: c.skills ? Object.keys(c.skills).filter(k => c.skills[k] === true) : []
        };
      });

      // Ordenar: Disponíveis primeiro -> Maior Match -> Mais Perto
      setCuidadoras(processadas.sort((a: any, b: any) => {
        if (a.isDisponivel !== b.isDisponivel) return a.isDisponivel ? -1 : 1;
        return b.match - a.match;
      }));

    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAtribuir = async (idCuidadora: string) => {
    if (processing) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ 
          caregiver_id: idCuidadora,
          status: 'confirmed' 
        })
        .eq('id', turno.id);

      if (error) throw error;

      await onSuccess(); // Refetch dos dados
      onClose(); // Fecha modal
      
    } catch (error) {
      alert("Erro ao atribuir. Verifica a ligação.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div>
            <h3 className="font-bold text-xl text-slate-800">Substituir Cuidadora</h3>
            <div className="text-sm text-slate-500 mt-1 flex flex-col">
               <span className="font-medium text-slate-700">{turno?.cliente}</span>
               <span>{turno?.horario} • {turno?.data}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50">
          {loading ? (
            <div className="text-center py-12 text-slate-400">A analisar competências...</div>
          ) : (
            <div className="space-y-3">
              {cuidadoras.map((c: any) => (
                <div 
                  key={c.id} 
                  onClick={() => c.isDisponivel && handleAtribuir(c.id)}
                  className={`bg-white p-4 rounded-xl border transition-all relative overflow-hidden group ${
                    c.isDisponivel 
                      ? 'border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer' 
                      : 'border-slate-100 opacity-60 grayscale-[0.8]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        c.isDisponivel ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {c.name.charAt(0)}
                      </div>
                      
                      {/* Info Principal */}
                      <div>
                        <h4 className="font-bold text-slate-900">{c.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-medium text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500" /> {c.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {c.distancia} km
                          </span>
                        </div>

                        {/* SKILLS - AQUI ESTÁ O QUE FALTAVA 👇 */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {c.skillsLista && c.skillsLista.length > 0 ? (
                            c.skillsLista.map((skill: string) => (
                              <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold rounded border border-slate-200">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Geral</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Match ou Status */}
                    <div className="flex flex-col items-end gap-2">
                       {c.isDisponivel ? (
                         <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                           c.match >= 90 ? 'bg-emerald-100 text-emerald-700' : 
                           c.match >= 70 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                         }`}>
                           {c.match}% Match
                         </span>
                       ) : (
                         <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center gap-1">
                           <AlertCircle className="w-3 h-3" /> Ocupada
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}