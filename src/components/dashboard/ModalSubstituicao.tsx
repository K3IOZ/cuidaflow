import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Alinhado com o que o DashboardGestora.tsx envia
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
    if (turno) {
      fetchCuidadorasDisponiveis();
    }
  }, [turno]);

  const fetchCuidadorasDisponiveis = async () => {
    setLoading(true);
    try {
      // 1. Buscar cuidadoras
      const { data: allCaregivers, error: errCare } = await supabase
        .from('caregivers')
        .select('*')
        .eq('org_id', 'a0000000-0000-0000-0000-000000000001')
        .eq('is_active', true);

      if (errCare) throw errCare;

      // 2. Buscar turnos ocupados
      const { data: busyShifts } = await supabase
        .from('shifts')
        .select('caregiver_id')
        .eq('shift_date', turno.data)
        .eq('start_time', turno.horario.split(' - ')[0])
        .neq('status', 'no_show');

      const busyIds = busyShifts?.map((s: any) => s.caregiver_id) || [];

      // 3. Cruzar dados
      const processadas = (allCaregivers || []).map((c: any) => ({
        ...c,
        isDisponivel: !busyIds.includes(c.id)
      }));

      setCuidadoras(processadas.sort((a: any, b: any) => (a.isDisponivel === b.isDisponivel) ? 0 : a.isDisponivel ? -1 : 1));

    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAtribuir = async (idCuidadora: string) => {
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

      onSuccess(); // Agora o nome coincide com o DashboardGestora!
      onClose();

    } catch (error) {
      alert("Erro ao atribuir. Tenta novamente.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Substituir Cuidadora</h3>
            <p className="text-sm text-slate-500">
              {turno?.cliente} • {turno?.horario}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Lista */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-400">A verificar agenda...</div>
          ) : (
            <div className="space-y-2">
              {cuidadoras.map((c: any) => (
                <div 
                  key={c.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    c.isDisponivel 
                      ? 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer group' 
                      : 'border-red-100 bg-red-50 opacity-70'
                  }`}
                  onClick={() => c.isDisponivel && handleAtribuir(c.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      c.isDisponivel ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <div className="flex items-center gap-2 text-xs">
                        {c.isDisponivel ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Disponível
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Ocupada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {c.isDisponivel && (
                    <button className="px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100">
                      Atribuir
                    </button>
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