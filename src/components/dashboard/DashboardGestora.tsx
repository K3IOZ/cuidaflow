'use client';

import { useState } from 'react';
import { 
  Users, 
  Calendar, 
  AlertCircle, 
  Clock,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { useTurnos } from '@/hooks/useTurnos';
import { Turno } from '@/types';
import ListaTurnos from './ListaTurnos';
import ModalSubstituicao from './ModalSubstituicao';
import { supabase } from '@/lib/supabase';

export default function DashboardGestora() {
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'hoje' | 'faltas'>('todos');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<Turno | null>(null);

  const { turnos, loading, stats, refetch } = useTurnos(filtroAtivo, dataSelecionada);

  const handleAbrirSubstituicao = (turno: Turno) => {
    setTurnoSelecionado(turno);
    setIsModalOpen(true);
  };

  const handleRegistarFalta = async (turnoId: string) => {
    const { error } = await supabase
      .from('shifts')
      .update({ status: 'no_show' })
      .eq('id', turnoId);

    if (!error) {
      await refetch();
      setFiltroAtivo('faltas'); // Salto automático para a aba de faltas
    }
  };

  const turnosFiltrados = turnos.filter(t => 
    t.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.cuidadora?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Seletor de Data */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Operações</h1>
          <p className="text-slate-500 text-sm">Gestão de escalas e incidências em tempo real</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <Calendar className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="date" 
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="border-none focus:ring-0 font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Stats Cards (Mantidos conforme o teu design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Total de Turnos</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Faltas por Resolver</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.faltas}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Pendentes</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.pendentes}</div>
        </div>

        <div className="bg-indigo-600 p-4 rounded-2xl shadow-md shadow-indigo-200">
          <div className="flex items-center gap-3 text-indigo-100 mb-2">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Novo Turno</span>
          </div>
          <button className="text-white font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
            Agendar <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setFiltroAtivo('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtroAtivo === 'todos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFiltroAtivo('hoje')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtroAtivo === 'hoje' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Confirmados
            </button>
            <button 
              onClick={() => setFiltroAtivo('faltas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtroAtivo === 'faltas' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Faltas
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquisar cliente ou cuidadora..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Lista de Turnos */}
        <ListaTurnos 
          turnos={turnosFiltrados} 
          loading={loading}
          onSubstituir={handleAbrirSubstituicao}
          onFalta={handleRegistarFalta} // Passamos a nova função aqui
        />
      </div>

      {/* Modal de Substituição */}
      {isModalOpen && turnoSelecionado && (
        <ModalSubstituicao 
          turno={turnoSelecionado}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}