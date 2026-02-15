import { 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRightLeft,
  UserMinus // Ícone para registar falta
} from 'lucide-react';
import { Turno } from '@/types';

interface ListaTurnosProps {
  turnos: Turno[];
  loading: boolean;
  onSubstituir: (turno: Turno) => void;
  onFalta: (turnoId: string) => void; // <--- NOVA PROP
}

export default function ListaTurnos({ turnos, loading, onSubstituir, onFalta }: ListaTurnosProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 text-sm">A carregar turnos...</p>
      </div>
    );
  }

  if (turnos.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <p className="text-slate-500 italic">Nenhum turno encontrado para os critérios selecionados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {turnos.map((turno) => (
        <div 
          key={turno.id}
          className={`p-4 rounded-xl border transition-all hover:shadow-md ${
            turno.status === 'falta' 
              ? 'bg-red-50 border-red-100' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Info do Cliente e Horário */}
            <div className="flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-lg ${
                turno.status === 'falta' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{turno.cliente}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    turno.status === 'falta' ? 'bg-red-200 text-red-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {turno.tipo}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    {turno.horario}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {turno.localizacao}
                  </span>
                </div>
              </div>
            </div>

            {/* Cuidadora e Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  turno.status === 'falta' ? 'bg-red-100 text-red-400' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Cuidadora</p>
                  <p className={`text-sm font-semibold ${turno.status === 'falta' ? 'text-red-400' : 'text-slate-700'}`}>
                    {turno.cuidadora || 'Não atribuída'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {turno.status === 'falta' ? (
                  <button 
                    onClick={() => onSubstituir(turno)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                  >
                    <ArrowRightLeft className="w-4 h-4" /> Substituir
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Botão para Registar Falta (Aparece se não for falta) */}
                    <button 
                      onClick={() => onFalta(turno.id)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all"
                      title="Registar Falta"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                    
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" /> Confirmado
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