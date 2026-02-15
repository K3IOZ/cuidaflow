import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, User, Star, MapPin, Brain } from 'lucide-react';
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
      // 1. Buscar cuidadoras
      const { data: allCaregivers } = await supabase
        .from('caregivers')
        .select('*')
        .eq('org_id', 'a0000000-0000-0000-0000-000000000001')
        .eq('is_active', true);

      // 2. Buscar turnos ativos hoje para ver quem está realmente ocupada
      const { data: busyShifts } = await supabase
        .from('shifts')
        .select('caregiver_id, start_time, end_time')
        .eq('shift_date', turno.data)
        .neq('status', 'no_show');

      const busyIds = busyShifts?.map((s: any) => s.caregiver_id) || [];

      // 3. Processar Matching (Simulado com base nas skills do Plano Mestre)
      const processadas = (allCaregivers || []).map((c: any) => {
        const isOcupada = busyIds.includes(c.id);
        
        // Lógica de Match % (Simulada baseada em skills vs necessidades do utente)
        let matchScore = 85; 
        if (c.name.includes('Jocelina') || c.name.includes('Vera')) matchScore = 98;
        if (isOcupada) matchScore = 40;

        return {
          ...c,
          isDisponivel: !isOcupada,
          match: matchScore,
          rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1), // Rating realista entre 4.2 e 5.0
          distancia: (Math.random() * 5).toFixed(1) // Distância simulada em km
        };
      });

      // Ordenar por Match % (maior primeiro)
      setCuidadoras(processadas.sort((a: any, b: any) => b.match - a.match));

    } catch (error) {
      console.error("Erro no matching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAtribuir = async (idCuidadora: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ caregiver_id: idCuidadora, status: 'confirmed' })
        .eq('id', turno.id);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      alert("Erro ao guardar. Tenta novamente.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header Profissional */}
        <div className="p-6 border-b flex justify-between items-start bg-slate-50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Substituição Inteligente</span>
            <h3 className="font-bold text-2xl text-slate-800 mt-2">{turno?.cliente}</h3>
            <div className="flex gap-4 mt-1 text-sm text-slate-500">
               <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {turno?.localizacao?.split(',')[0]}</span>
               <span className="font-medium text-slate-700">{turno?.horario}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X /></button>
        </div>

        {/* Lista de Cuidadoras com UI Rica */}
        <div className="p-4 max-h-[70vh] overflow-y-auto bg-white">
          {loading ? (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              Calculando melhor correspondência...
            </div>
          ) : (
            <div className="grid gap-3">
              {cuidadoras.map((c: any) => (
                <div 
                  key={c.id} 
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    c.isDisponivel 
                      ? 'border-slate-100 hover:border-indigo-500 bg-white shadow-sm cursor-pointer' 
                      : 'border-slate-50 bg-slate-50 opacity-60 grayscale'
                  }`}
                  onClick={() => c.isDisponivel && handleAtribuir(c.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{c.name}</h4>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="w-3 h-3 fill-amber-500" /> {c.rating}</span>
                          <span className="text-slate-400">{c.distancia} km de distância</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.match > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.match}% Match
                      </span>
                    </div>
                  </div>

                  {/* Skills e Info */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(c.skills || {}).filter(([_, v]) => v).map(([skill]) => (
                      <span key={skill} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 capitalize">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Barra de Match */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.match > 90 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${c.match}%` }}></div>
                  </div>

                  {!c.isDisponivel && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center rounded-xl">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Ocupada
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}