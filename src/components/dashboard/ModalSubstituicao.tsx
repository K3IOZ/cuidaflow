import { useState, useEffect } from 'react';
import { X, MapPin, Star, AlertCircle, Check } from 'lucide-react';
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
      // 1. Buscar todas as cuidadoras
      const { data: allCaregivers } = await supabase
        .from('caregivers')
        .select('*')
        .eq('org_id', 'a0000000-0000-0000-0000-000000000001')
        .eq('is_active', true);

      // 2. Buscar conflitos de agenda (quem já trabalha neste dia/hora)
      const { data: busyShifts } = await supabase
        .from('shifts')
        .select('caregiver_id')
        .eq('shift_date', turno.data)
        .neq('status', 'no_show') // Ignorar quem faltou, considerar quem trabalha
        .neq('id', turno.id); // Ignorar o próprio turno que estamos a editar

      const busyIds = busyShifts?.map((s: any) => s.caregiver_id) || [];

      // 3. Processar lista
      const processadas = (allCaregivers || []).map((c: any) => {
        const isOcupada = busyIds.includes(c.id);
        
        // Simulação de Match variado (para não serem todas iguais)
        // Num sistema real, isto viria do backend com base nas skills
        let baseMatch = 65 + Math.floor(Math.random() * 30); // Entre 65% e 95%
        if (c.name.includes('Jocelina') || c.name.includes('Vera')) baseMatch = 98;
        if (isOcupada) baseMatch = 10; // Penalização forte se ocupada

        // Rating variado
        const ratingCalc = (4.0 + Math.random()).toFixed(1);

        return {
          ...c,
          isDisponivel: !isOcupada,
          match: baseMatch,
          rating: ratingCalc,
          distancia: (Math.random() * 8).toFixed(1) // km simulados
        };
      });

      // Ordenar: Disponíveis primeiro, depois por maior Match
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
      // 1. Atualizar Supabase
      const { error } = await supabase
        .from('shifts')
        .update({ 
          caregiver_id: idCuidadora,
          status: 'confirmed' // Muda de 'no_show' para Confirmado
        })
        .eq('id', turno.id);

      if (error) throw error;

      // 2. Avisar o Dashboard para recarregar
      await onSuccess();
      
      // 3. Fechar (com pequeno delay para garantir que a UI não pisca)
      setTimeout(() => {
        onClose();
      }, 100);

    } catch (error) {
      alert("Erro ao atribuir turno.");
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header Simples */}
        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Substituir Cuidadora</h3>
            <p className="text-sm text-slate-500 flex items-center gap-2">
               {turno?.cliente} • {turno?.horario}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Lista Limpa (Sem barras de progresso) */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center py-10 text-slate-400">A carregar lista...</div>
          ) : (
            <div className="space-y-2">
              {cuidadoras.map((c: any) => (
                <div 
                  key={c.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    c.isDisponivel 
                      ? 'border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer bg-white' 
                      : 'border-slate-100 bg-slate-50 opacity-60'
                  }`}
                  onClick={() => c.isDisponivel && handleAtribuir(c.id)}
                >
                  {/* Esquerda: Foto + Nome + Rating */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-500" /> {c.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {c.distancia} km
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direita: Match % ou Estado */}
                  <div className="text-right">
                    {c.isDisponivel ? (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        c.match > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {c.match}% Match
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Ocupada
                      </span>
                    )}
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