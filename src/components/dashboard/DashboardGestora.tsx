'use client';

import React, { useState, useEffect } from 'react';
import {
    AlertCircle,
    Calendar,
    Clock,
    Filter,
    Bell,
    Menu,
    Loader2,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import { Turno } from '@/types';
import ListaTurnos from './ListaTurnos';
import ModalSubstituicao from './ModalSubstituicao';
import { useTurnos } from '@/hooks/useTurnos';

export default function DashboardGestora() {
    const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'hoje' | 'faltas'>('hoje');
    const [modalAberto, setModalAberto] = useState(false);
    const [turnoSelecionado, setTurnoSelecionado] = useState<Turno | null>(null);

    // Hook personalizado para buscar dados do Supabase
    const {
        turnos,
        loading,
        error,
        refetch,
        stats
    } = useTurnos(filtroAtivo);

    const handleSubstituir = (turno: Turno) => {
        setTurnoSelecionado(turno);
        setModalAberto(true);
    };

    const handleFecharModal = () => {
        setModalAberto(false);
        setTurnoSelecionado(null);
    };

    // Componente de Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">A carregar turnos...</h2>
                    <p className="text-slate-500 text-sm">A ligar à base de dados</p>
                </div>
            </div>
        );
    }

    // Componente de Erro
    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-200 text-center max-w-md">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Erro ao carregar dados</h2>
                    <p className="text-slate-600 text-sm mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Mobile */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">CuidaFlow</h1>
                                <p className="text-xs text-slate-500">Painel da Gestora</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refetch}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                title="Atualizar dados"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative">
                                <Bell className="w-5 h-5" />
                                {stats.faltas > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">S</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">Turnos Hoje</span>
                            <Calendar className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>

                    <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-red-700">Faltas Urgentes</span>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold text-red-700">{stats.faltas}</p>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-orange-700">Pendentes</span>
                            <Clock className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-orange-700">{stats.pendentes}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">Críticos</span>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold text-red-600">{stats.criticos}</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFiltroAtivo('hoje')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filtroAtivo === 'hoje'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => setFiltroAtivo('faltas')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filtroAtivo === 'faltas'
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Faltas
                    </button>
                    <button
                        onClick={() => setFiltroAtivo('todos')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filtroAtivo === 'todos'
                            ? 'bg-slate-800 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Todos
                    </button>
                    <div className="flex-1"></div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-full text-sm text-slate-700 hover:bg-slate-50">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                </div>

                {/* Lista de Turnos */}
                <div className="mt-6">
                    <ListaTurnos
                        turnos={turnos}
                        onSubstituir={handleSubstituir}
                    />
                </div>
            </div>

            {/* Modal de Substituição */}
            {modalAberto && turnoSelecionado && (
                <ModalSubstituicao
                    turno={turnoSelecionado}
                    onClose={handleFecharModal}
                    onSuccess={refetch} // <--- ISTO É O QUE FAZ O DASHBOARD ATUALIZAR NA HORA!
                />
            )}
        </div>
    );
}
