'use client';

import { useState } from 'react';
import { 
  Users, 
  Calendar, 
  AlertCircle, 
  Clock,
  Filter,
  Search,
  Plus,
  Menu,
  Bell,
  RefreshCcw,
  User,
  LogOut,
  ChevronDown
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
      setFiltroAtivo('faltas');
    }
  };

  const turnosFiltrados = turnos.filter(t => 
    t.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.cuidadora?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HEADER PRINCIPAL (RESTAURADO) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                CuidaFlow
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => refetch()} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              title="Recarregar dados"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full relative text-slate-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">Sara Santos</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Gestora</p>
              </div>
              <button className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm hover:border-indigo-200 transition-all">
                <User className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. CONTEÚDO PRINCIPAL (COM MARGENS RESTAURADAS) */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Título e Seletor de Data */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Gestora</h1>
            <p className="text-slate-500 font-medium mt-1">Bem-vinda de volta. Tens {stats.faltas} incidências para resolver.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 group hover:border-indigo-300 transition-colors">
            <Calendar className="w-5 h-5 text-indigo-500 ml-2" />
            <input 
              type="date" 
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="border-none focus:ring-0 font-bold text-slate-700 bg-transparent outline-none cursor-pointer pr-4"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-slate-400 mb-4">
              <div className="p-2 bg-slate-50 rounded-lg"><Users className="w-5 h-5" /></div>
              <span className="text-sm font-bold uppercase tracking-wider">Total Turnos</span>
            </div>
            <div className="text-4xl font-black text-slate-900">{stats.total}</div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="p-2 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
              <span className="text-sm font-bold uppercase tracking-wider">Faltas</span>
            </div>
            <div className="text-4xl font-black text-red-600">{stats.faltas}</div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5" /></div>
              <span className="text-sm font-bold uppercase tracking-wider">Pendentes</span>
            </div>
            <div className="text-4xl font-black text-amber-600">{stats.pendentes}</div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 flex flex-col justify-between group cursor-pointer hover:bg-indigo-950 transition-all">
            <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">Acções Rápidas</div>
            <button className="text-white font-bold flex items-center gap-3 text-lg mt-4">
              Novo Turno <div className="p-1 bg-white/10 rounded-lg group-hover:bg-white/20"><Plus className="w-5 h-5" /></div>
            </button>
          </div>
        </div>

        {/* Lista e Filtros */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 space-y-6">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit">
                <button 
                  onClick={() => setFiltroAtivo('todos')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filtroAtivo === 'todos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFiltroAtivo('hoje')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filtroAtivo === 'hoje' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Confirmados
                </button>
                <button 
                  onClick={() => setFiltroAtivo('faltas')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filtroAtivo === 'faltas' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Faltas
                </button>
              </div>

              <div className="relative w-full md:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Pesquisar cliente ou cuidadora..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <ListaTurnos 
              turnos={turnosFiltrados} 
              loading={loading}
              onSubstituir={handleAbrirSubstituicao}
              onFalta={handleRegistarFalta}
            />
          </div>
        </div>
      </main>

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