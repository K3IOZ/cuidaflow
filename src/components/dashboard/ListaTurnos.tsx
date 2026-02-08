'use client';

import React from 'react';
import {
    MapPin,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ArrowRightLeft,
    Calendar
} from 'lucide-react';
import { Turno } from '@/types';

interface ListaTurnosProps {
    turnos: Turno[];
    onSubstituir: (turno: Turno) => void;
}

const getStatusConfig = (status: Turno['status']) => {
    switch (status) {
        case 'confirmado':
            return {
                icon: CheckCircle2,
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-700',
                label: 'Confirmado'
            };
        case 'falta':
            return {
                icon: XCircle,
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-700',
                label: 'Falta'
            };
        case 'pendente':
            return {
                icon: AlertCircle,
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                textColor: 'text-yellow-700',
                label: 'Pendente'
            };
        case 'critico':
            return {
                icon: AlertTriangle,
                bgColor: 'bg-red-100',
                borderColor: 'border-red-300',
                textColor: 'text-red-800',
                label: 'Crítico'
            };
        default:
            return {
                icon: AlertCircle,
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                textColor: 'text-gray-700',
                label: 'Desconhecido'
            };
    }
};

export default function ListaTurnos({ turnos, onSubstituir }: ListaTurnosProps) {
    if (turnos.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Nenhum turno encontrado</h3>
                <p className="text-slate-500 mt-1">Não há turnos para o período selecionado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {turnos.map((turno) => {
                const statusConfig = getStatusConfig(turno.status);
                const StatusIcon = statusConfig.icon;

                return (
                    <div
                        key={turno.id}
                        className={`bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-md ${turno.status === 'critico'
                                ? 'border-red-300 shadow-red-100'
                                : turno.status === 'falta'
                                    ? 'border-red-200'
                                    : 'border-slate-200'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            {/* Left side - Info */}
                            <div className="flex-1 min-w-0">
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {statusConfig.label}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${turno.tipo === 'Adaptado'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {turno.tipo}
                                    </span>
                                </div>

                                {/* Client Name */}
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                    {turno.cliente}
                                </h3>

                                {/* Location */}
                                <div className="flex items-center gap-1.5 text-slate-600 text-sm mb-2">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{turno.localizacao}</span>
                                </div>

                                {/* Time & Duration */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium">{turno.horario}</span>
                                    </div>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-600">{turno.duracao}</span>
                                </div>

                                {/* Caregiver or Missing */}
                                <div className="mt-3 flex items-center gap-2">
                                    {turno.cuidadora ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            <span className="text-sm text-slate-700">{turno.cuidadora}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <XCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Sem cuidadora</span>
                                        </div>
                                    )}
                                </div>

                                {/* Tasks Preview */}
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {turno.tarefas.slice(0, 3).map((tarefa, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-600"
                                        >
                                            {tarefa}
                                        </span>
                                    ))}
                                    {turno.tarefas.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-500">
                                            +{turno.tarefas.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Right side - Action */}
                            <div className="flex flex-col items-end gap-2">
                                {(turno.status === 'falta' || turno.status === 'critico') && (
                                    <button
                                        onClick={() => onSubstituir(turno)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" />
                                        <span>Substituir</span>
                                    </button>
                                )}

                                {turno.status === 'confirmado' && (
                                    <span className="flex items-center gap-1.5 px-3 py-2 text-green-700 text-sm font-medium">
                                        <CheckCircle2 className="w-4 h-4" />
                                        OK
                                    </span>
                                )}

                                {turno.status === 'pendente' && (
                                    <button className="px-4 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-xl font-medium text-sm transition-colors">
                                        Atribuir
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
