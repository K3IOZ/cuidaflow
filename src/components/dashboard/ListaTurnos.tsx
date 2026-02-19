import { 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRightLeft, 
  UserMinus, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw 
} from 'lucide-react';
import { Turno } from '@/types';
import { useState } from 'react';

interface ListaTurnosProps {
  turnos: Turno[];
  loading: boolean;
  onSubstituir: (turno: Turno) => void;
  onFalta: (turnoId: string) => void;
  // ESTAS DUAS LINHAS SÃO AS QUE FALTAVAM PARA O ERRO DESAPARECER:
  onEditar: (turno: Turno) => void;
  onEliminar: (turnoId: string) => void;
}

export default function ListaTurnos({ turnos, loading, onSubstituir, onFalta, onEditar, onEliminar }: ListaTurnosProps) {
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 text-sm font-medium">A carregar escala...</p>
      </div>
    );
  }

  if (turnos.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-slate-500 italic font-medium">Nenhum turno planeado para esta data.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {turnos.map((turno) => (
        <div 
          key={turno.id}
          className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
            eliminandoId === turno.id ? 'opacity-30 grayscale' : 
            turno.status === 'falta' ? 'bg-red-50/50 border-red-100' : 
            turno.status === 'vazio' ? 'bg-amber-50/30 border-amber-100 border-dashed' :
            'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`mt-1 p-2.5 rounded-xl ${
                turno.status === 'falta' ? 'bg-red-100 text-red-600' : 
                turno.status === 'vazio' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{turno.cliente}</h4>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                    turno.status === 'falta' ? 'bg-red-200 text-red-700' : 
                    turno.status === 'vazio' ? 'bg-amber-200 text-amber-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {turno.tipo}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    {turno.horario}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" /> {turno.localizacao}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              
              {/* Informação da Cuidadora */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  turno.status === 'falta' ? 'bg-red-100 text-red-400' : 
                  turno.status === 'vazio' ? 'bg-amber-100 text-amber-400' :
                  'bg-indigo-50 text-indigo-600'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cuidadora</p>
                  <p className={`text-sm font-bold ${
                    turno.status === 'falta' ? 'text-red-400' : 
                    turno.status === 'vazio' ? 'text-amber-600 italic' :
                    'text-slate-700'
                  }`}>
                    {turno.cuidadora || 'Não atribuída'}
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                {/* Botões de Gestão (Editar / Eliminar) */}
                <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onEditar(turno)}
                      className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all text-slate-400"
                      title="Editar Turno"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setEliminandoId(turno.id);
                        setTimeout(() => onEliminar(turno.id), 500); // Pequeno delay visual
                      }}
                      className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-slate-400"
                      title="Eliminar Turno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {turno.status === 'falta' || turno.status === 'vazio' ? (
                  <button 
                    onClick={() => onSubstituir(turno)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 ${
                      turno.status === 'falta' 
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                  >
                    {turno.status === 'falta' ? <ArrowRightLeft className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {turno.status === 'falta' ? 'Substituir' : 'Atribuir'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onFalta(turno.id)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Registar Falta"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                    
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-xs font-black border border-emerald-100 hidden sm:flex">
                      <CheckCircle2 className="w-4 h-4" /> CONFIRMADO
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}