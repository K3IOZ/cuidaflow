import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  turno: any;
  onConfirm: () => void;
}

export function ModalSubstituicao({ isOpen, onClose, turno, onConfirm }: ModalProps) {
  const [cuidadoras, setCuidadoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && turno) {
      fetchCuidadorasDisponiveis();
    }
  }, [isOpen, turno]);

  const fetchCuidadorasDisponiveis = async () => {
    setLoading(true);
    try {
      // 1. Buscar todas as cuidadoras ativas da organização
      const { data: allCaregivers, error: errCare } = await supabase
        .from('caregivers')
        .select('*')
        .eq('org_id', 'a0000000-0000-0000-0000-000000000001') // ID Simulação
        .eq('is_active', true);

      if (errCare) throw errCare;

      // 2. Buscar turnos que coincidem com este horário (para ver quem está ocupada)
      // Nota: Isto é uma verificação simples. Num sistema final seria mais robusto.
      const { data: busyShifts } = await supabase
        .from('shifts')
        .select('caregiver_id')
        .eq('shift_date', turno.data) // No mesmo dia
        .eq('start_time', turno.horario.split(' - ')[0]) // À mesma hora de início
        .neq('status', 'no_show'); // Que não tenham faltado

      const busyIds = busyShifts?.map(s => s.caregiver_id) || [];

      // 3. Marcar quem está disponível
      const processadas = allCaregivers.map(c => ({
        ...c,
        isDisponivel: !busyIds.includes(c.id) // Se não estiver na lista de ocupadas
      }));

      // Ordenar: Disponíveis primeiro
      setCuidadoras(processadas.sort((a, b) => (a.isDisponivel === b.isDisponivel) ? 0 : a.isDisponivel ? -1 : 1));

    } catch (error) {
      console.error("Erro ao buscar cuidadoras:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAtribuir = async (idCuidadora: string) => {
    setProcessing(true);
    try {
      // ATUALIZAÇÃO NO SUPABASE
      const { error } = await supabase
        .from('shifts')
        .update({
          caregiver_id: idCuidadora,
          status: 'confirmed' // Passa de 'no_show' ou 'scheduled' para Confirmado
        })
        .eq('id', turno.id);

      if (error) throw error;

      onConfirm(); // Atualiza o dashboard
      onClose();   // Fecha o modal

    } catch (error) {
      console.error("Erro ao atribuir:", error);
      alert("Erro ao atribuir turno. Tenta novamente.");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Substituir Cuidadora</h3>
            <p className="text-sm text-slate-500">
              {turno?.cliente} • {turno?.horario}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Lista */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-400">A procurar disponibilidades...</div>
          ) : (
            <div className="space-y-2">
              {cuidadoras.map((c) => (
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
                            <AlertCircle className="w-3 h-3" /> Ocupada neste horário
                          </span>
                        )}
                        <span className="text-slate-400">• {c.phone}</span>
                      </div>
                    </div>
                  </div>

                  {c.isDisponivel && (
                    <button 
                      disabled={processing}
                      className="px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {processing ? '...' : 'Atribuir'}
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