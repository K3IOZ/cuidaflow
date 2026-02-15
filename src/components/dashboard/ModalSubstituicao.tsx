import { useState, useEffect } from 'react';
import { X, MapPin, Star, AlertCircle, MessageCircle, Phone, MessageSquare, Check } from 'lucide-react';
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
      const { data: allCaregivers } = await supabase
        .from('caregivers')
        .select('*')
        .eq('org_id', 'a0000000-0000-0000-0000-000000000001')
        .eq('is_active', true);

      const { data: busyShifts } = await supabase
        .from('shifts')
        .select('caregiver_id')
        .eq('shift_date', turno.data)
        .neq('status', 'no_show')
        .neq('id', turno.id);

      const busyIds = busyShifts?.map((s: any) => s.caregiver_id) || [];

      const processadas = (allCaregivers || []).map((c: any) => {
        const isOcupada = busyIds.includes(c.id);
        let baseMatch = 70 + Math.floor(Math.random() * 25);
        if (c.name.includes('Jocelina') || c.name.includes('Vera')) baseMatch = 98;
        if (isOcupada) baseMatch = 15;

        return {
          ...c,
          isDisponivel: !isOcupada,
          match: baseMatch,
          rating: (4.2 + Math.random() * 0.7).toFixed(1),
          distancia: (Math.random() * 6).toFixed(1),
          telefone: c.phone || '910000000'
        };
      });

      setCuidadoras(processadas.sort((a: any, b: any) => {
        if (a.isDisponivel !== b.isDisponivel) return a.isDisponivel ? -1 : 1;
        return b.match - a.match;
      }));
    } catch (error) {
      console.error(error);
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
        .update({ caregiver_id: idCuidadora, status: 'confirmed' })
        .eq('id', turno.id);

      if (error) throw error;
      await onSuccess();
      onClose();
    } catch (error) {
      alert("Erro ao atribuir.");
    } finally {
      setProcessing(false);
    }
  };

  // Funções de Contacto
  const contactarWhatsapp = (e: React.MouseEvent, nome: string, telefone: string) => {
    e.stopPropagation();
    const msg = encodeURIComponent(`Olá ${nome}, aqui é a Sara do CuidaFlow. Tens disponibilidade para o turno de ${turno.cliente} às ${turno.horario}?`);
    window.open(`https://wa.me/351${telefone}?text=${msg}`, '_blank');
  };

  const ligar = (e: React.MouseEvent, telefone: string) => {
    e.stopPropagation();
    window.location.href = `tel:+351${telefone}`;
  };

  const mandarSMS = (e: React.MouseEvent, telefone: string) => {
    e.stopPropagation();
    window.location.href = `sms:+351${telefone}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-black text-xl text-slate-900">Substituir Cuidadora</h3>
            <p className="text-sm text-slate-500 font-medium">A analisar perfil ideal para <span className="text-indigo-600">{turno?.cliente}</span></p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center py-12 text-slate-400 font-medium">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
              A calcular matching...
            </div>
          ) : (
            cuidadoras.map((c: any) => (
              <div 
                key={c.id} 
                className={`bg-white p-4 rounded-2xl border-2 transition-all relative group ${
                  c.isDisponivel 
                    ? 'border-slate-100 hover:border-indigo-500 cursor-pointer' 
                    : 'border-transparent opacity-60'
                }`}
                onClick={() => c.isDisponivel && handleAtribuir(c.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-lg">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{c.name}</h4>
                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500" /> {c.rating}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                          <MapPin className="w-3 h-3" /> {c.distancia} km
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${
                      c.match > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.match}% Match
                    </span>
                  </div>
                </div>

                {/* BOTÕES DE CONTACTO (A NOVIDADE) */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => contactarWhatsapp(e, c.name, c.telefone)}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Mandar WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => ligar(e, c.telefone)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Ligar"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => mandarSMS(e, c.telefone)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                      title="Mandar SMS"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>

                  {c.isDisponivel ? (
                    <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:underline">
                      Selecionar para turno <Check className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Ocupada
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}