'use client';

import { useState } from 'react';
import { 
  Users, Calendar, AlertCircle, Clock, Filter, Search, Plus, Menu, Bell, RefreshCcw, User, UserPlus, Briefcase, RotateCcw
} from 'lucide-react';
import { useTurnos } from '@/hooks/useTurnos';
import { Turno } from '@/types';
import ListaTurnos from './ListaTurnos';
import ModalSubstituicao from './ModalSubstituicao';
import ModalAdicionarCliente from './ModalAdicionarCliente';
import ModalAdicionarCuidadora from './ModalAdicionarCuidadora';
import ModalAdicionarTurno from './ModalAdicionarTurno';
import { supabase } from '@/lib/supabase';

// Definir o tipo de ação para o Undo Universal
type UndoAction = 
  | { type: 'DELETE'; table: string; data: any }
  | { type: 'UPDATE'; table: string; id: string; oldData: any };

export default function DashboardGestora() {
  // 1. ESTADOS
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'hoje' | 'faltas'>('todos');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Controlo de Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCaregiverModalOpen, setIsCaregiverModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  
  const [turnoSelecionado, setTurnoSelecionado] = useState<Turno | null>(null);

  // Estado para o UNDO (Universal)
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);

  // 2. DADOS
  const { turnos, loading, stats, refetch } = useTurnos(filtroAtivo, dataSelecionada);

  // 3. HANDLERS

  // --- UNDO UNIVERSAL ---
  const handleUndo = async () => {
    if (!lastAction) return;
    
    let error = null;

    if (lastAction.type === 'DELETE') {
        // Se foi apagado, inserimos os dados de volta (usa .data)
        const { error: e } = await supabase.from(lastAction.table).insert(lastAction.data);
        error = e;
    } else if (lastAction.type === 'UPDATE') {
        // Se foi editado, revertemos para os dados antigos (usa .oldData)
        // CORREÇÃO AQUI: update(lastAction.oldData) em vez de .data
        const { error: e } = await supabase.from(lastAction.table).update(lastAction.oldData).eq('id', lastAction.id);
        error = e;
    }
    
    if (!error) {
        setLastAction(null);
        refetch();
    } else {
        alert("Erro ao desfazer: " + error.message);
    }
  };

  const setTemporaryUndo = (action: UndoAction) => {
    setLastAction(action);
    // Limpar o botão de Undo após 8 segundos
    setTimeout(() => {
        setLastAction(prev => (prev === action ? null : prev));
    }, 8000);
  };

  // --- ACÇÕES DE GESTÃO ---

  const handleAbrirSubstituicao = (turno: Turno) => {
    setTurnoSelecionado(turno);
    setIsModalOpen(true);
  };

  const handleRegistarFalta = async (turnoId: string) => {
    // 1. Buscar estado atual para o Undo
    const { data: currentShift } = await supabase.from('shifts').select('*').eq('id', turnoId).single();
    
    if (currentShift) {
        // 2. Guardar no Undo
        setTemporaryUndo({ type: 'UPDATE', table: 'shifts', id: turnoId, oldData: currentShift });

        // 3. Executar Ação
        const { error } = await supabase.from('shifts').update({ status: 'no_show' }).eq('id', turnoId);
        
        if (!error) {
            await refetch();
            setFiltroAtivo('faltas');
        }
    }
  };

  const handleEliminarTurno = async (turnoId: string) => {
    // 1. Buscar dados para restauro
    const { data: realShift } = await supabase.from('shifts').select('*').eq('id', turnoId).single();
    
    if (realShift) {
        // 2. Guardar no Undo
        setTemporaryUndo({ type: 'DELETE', data: realShift, table: 'shifts' });
        
        // 3. Executar Ação
        await supabase.from('shifts').delete().eq('id', turnoId);
        
        // 4. Atualizar UI
        refetch();
    }
  };

  const handleEditarTurno = (turno: Turno) => {
      // Futuramente, ao editar, guardaremos o estado anterior num UPDATE action
      alert(`Funcionalidade de Editar o turno de ${turno.cliente} a caminho!`);
  };

  const turnosFiltrados = turnos.filter(t => 
    t.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.cuidadora?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper para texto do botão Undo
  const getUndoText = () => {
    if (!lastAction) return '';
    if (lastAction.type === 'DELETE') return 'Desfazer Apagar';
    if (lastAction.type === 'UPDATE') return 'Desfazer Alteração';
    return 'Desfazer';
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER PRINCIPAL */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                CuidaFlow
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* BOTÃO UNDO (Aparece só quando há algo para desfazer) */}
            {lastAction && (
                <button 
                    onClick={handleUndo}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full font-bold text-xs animate-in slide-in-from-top-4 shadow-lg hover:bg-slate-700 transition-all"
                >
                    <RotateCcw className="w-3 h-3" /> {getUndoText()}
                </button>
            )}

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
                <p className="text-sm font-bold text-slate-900 leading-none">Sara Santos</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gestora</p>
              </div>
              <button className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm hover:border-indigo-200 transition-all">
                <User className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Título e Ações */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Gestora</h1>
            <p className="text-slate-500 font-medium">Controlo centralizado de cuidados e equipas</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {lastAction && (
                <button 
                    onClick={handleUndo}
                    className="md:hidden w-full mb-2 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm animate-pulse"
                >
                    <RotateCcw className="w-4 h-4" /> {getUndoText()}
                </button>
            )}

            <button onClick={() => setIsClientModalOpen(true)} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95">
              <UserPlus className="w-4 h-4 text-indigo-500" /> + Cliente
            </button>
            <button onClick={() => setIsCaregiverModalOpen(true)} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95">
              <Briefcase className="w-4 h-4 text-emerald-500" /> + Cuidadora
            </button>

            <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block" />

            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 group hover:border-indigo-300 transition-colors">
              <Calendar className="w-5 h-5 text-indigo-500 ml-2" />
              <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} className="border-none focus:ring-0 font-bold text-slate-700 bg-transparent outline-none cursor-pointer pr-4" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-slate-400 mb-4">
              <div className="p-2 bg-slate-50 rounded-lg"><Users className="w-5 h-5" /></div>
              <span className="text-xs font-black uppercase tracking-widest">Total Turnos</span>
            </div>
            <div className="text-4xl font-black text-slate-900">{stats.total}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="p-2 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
              <span className="text-xs font-black uppercase tracking-widest">Incidências</span>
            </div>
            <div className="text-4xl font-black text-red-600">{stats.faltas}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5" /></div>
              <span className="text-xs font-black uppercase tracking-widest">Vazios/Pendentes</span>
            </div>
            <div className="text-4xl font-black text-amber-600">{stats.pendentes}</div>
          </div>
          <div onClick={() => setIsShiftModalOpen(true)} className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 flex flex-col justify-between group cursor-pointer hover:bg-indigo-950 transition-all">
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Agenda Rápida</div>
            <button className="text-white font-bold flex items-center gap-3 text-lg mt-4">
              Novo Turno <div className="p-1 bg-white/10 rounded-lg group-hover:bg-white/20"><Plus className="w-5 h-5" /></div>
            </button>
          </div>
        </div>

        {/* Lista e Filtros */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 space-y-6 bg-slate-50/30">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
              <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-full md:w-fit">
                <button onClick={() => setFiltroAtivo('todos')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filtroAtivo === 'todos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
                <button onClick={() => setFiltroAtivo('hoje')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filtroAtivo === 'hoje' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Confirmados</button>
                <button onClick={() => setFiltroAtivo('faltas')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filtroAtivo === 'faltas' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Faltas</button>
              </div>
              <div className="relative w-full md:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input type="text" placeholder="Pesquisar cliente ou cuidadora..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm" />
              </div>
            </div>
          </div>

          <div className="p-6">
            <ListaTurnos 
              turnos={turnosFiltrados} 
              loading={loading}
              onSubstituir={handleAbrirSubstituicao}
              onFalta={handleRegistarFalta}
              onEliminar={handleEliminarTurno}
              onEditar={handleEditarTurno}
            />
          </div>
        </div>
      </main>

      {/* MODAIS */}
      {isModalOpen && turnoSelecionado && <ModalSubstituicao turno={turnoSelecionado} onClose={() => setIsModalOpen(false)} onSuccess={refetch} />}
      {isClientModalOpen && <ModalAdicionarCliente onClose={() => setIsClientModalOpen(false)} onSuccess={refetch} />}
      {isCaregiverModalOpen && <ModalAdicionarCuidadora onClose={() => setIsCaregiverModalOpen(false)} onSuccess={refetch} />}
      {isShiftModalOpen && <ModalAdicionarTurno onClose={() => setIsShiftModalOpen(false)} onSuccess={refetch} />}
    </div>
  );
}