'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Search, Star, MapPin, Award, Loader2, ChevronRight } from 'lucide-react';
import { Turno } from '@/types';
import { assignCaregiverToShift, getAvailableCaregivers } from '@/lib/actions/shifts';

interface ModalSubstituicaoProps {
    turno: Turno;
    onClose: () => void;
    onSuccess: () => void; // Nova prop para atualizar o dashboard
}

export default function ModalSubstituicao({ turno, onClose, onSuccess }: ModalSubstituicaoProps) {
    const [busca, setBusca] = useState('');
    const [cuidadoraSelecionada, setCuidadoraSelecionada] = useState<any | null>(null);
    const [cuidadoras, setCuidadoras] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function carregar() {
            const result = await getAvailableCaregivers(turno.id);
            if (result.success && result.data) {
                const processadas = result.data.map((c: any, index: number) => ({
                    ...c,
                    distancia: (1.2 + index * 0.8).toFixed(1),
                    match: 95 - index * 3,
                    skills_tags: index === 0 ? ['Mobilidade', 'Demência', 'Fisioterapia'] : ['Higiene', 'Medicação']
                }));
                setCuidadoras(processadas);
            }
            setLoading(false);
        }
        carregar();
    }, []);

    const handleConfirmar = async () => {
        if (!cuidadoraSelecionada) return;
        setIsSaving(true);
        try {
            const result = await assignCaregiverToShift(turno.id, cuidadoraSelecionada.id);
            if (result.success) {
                onSuccess(); // Esta é a magia que atualiza o dashboard na hora!
                onClose();
            } else {
                alert('Erro: ' + result.error);
            }
        } catch (error) {
            alert('Erro de rede.');
        } finally {
            setIsSaving(false);
        }
    };

    const filtradas = cuidadoras.filter(c => c.name.toLowerCase().includes(busca.toLowerCase()));

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-md">
            <div className="bg-slate-50 w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

                {/* Cabeçalho Azul Premium (Igual à tua imagem 1) */}
                <div className="bg-blue-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-white/20 rounded-full transition-all">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold">Substituir Cuidadora</h2>
                    <p className="text-blue-100 mt-1 font-medium">{turno.cliente} • {turno.horario}</p>

                    {/* Info do Local */}
                    <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/20">
                        <MapPin className="w-4 h-4 text-blue-200" />
                        <span>{turno.localizacao}</span>
                    </div>
                </div>

                {/* Campo de Pesquisa Minimalista */}
                <div className="p-4 bg-white border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Procurar cuidadora por nome..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                {/* Lista de Cuidadoras (Design msedge_82U6OvCBVh) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Cuidadoras Compatíveis</p>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
                    ) : filtradas.map((c, idx) => (
                        <button
                            key={c.id}
                            onClick={() => setCuidadoraSelecionada(c)}
                            className={`w-full group flex flex-col p-5 rounded-[24px] border-2 transition-all relative ${cuidadoraSelecionada?.id === c.id
                                ? 'border-blue-600 bg-white shadow-xl ring-4 ring-blue-600/5'
                                : 'border-white bg-white hover:border-slate-200 shadow-sm'
                                }`}
                        >
                            {idx === 0 && (
                                <div className="absolute -top-3 left-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <Award className="w-3 h-3" /> MELHOR MATCH
                                </div>
                            )}

                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-600 border border-blue-100">
                                        {c.name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{c.name}</h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="flex items-center text-sm text-slate-500 font-medium">
                                                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {c.distancia} km
                                            </span>
                                            <span className="flex items-center text-sm text-amber-500 font-bold">
                                                <Star className="w-3.5 h-3.5 fill-current mr-1" /> {c.rating || '5.0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-blue-600">{c.match}%</span>
                                    <ChevronRight className={`w-5 h-5 ml-auto mt-1 ${cuidadoraSelecionada?.id === c.id ? 'text-blue-600' : 'text-slate-300'}`} />
                                </div>
                            </div>

                            {/* Skills Tags */}
                            <div className="flex gap-2 mt-4">
                                {c.skills_tags.map((s: string) => (
                                    <span key={s} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Rodapé fixo */}
                <div className="p-6 bg-white border-t border-slate-100">
                    <button
                        onClick={handleConfirmar}
                        disabled={!cuidadoraSelecionada || isSaving}
                        className={`w-full py-5 rounded-[22px] font-black text-lg flex items-center justify-center gap-3 transition-all ${cuidadoraSelecionada && !isSaving
                            ? 'bg-blue-600 text-white shadow-2xl shadow-blue-300 hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Atribuição'}
                    </button>
                    <p className="text-center text-slate-400 text-xs mt-4 font-medium uppercase tracking-widest">
                        Selecione uma cuidadora para ver detalhes
                    </p>
                </div>
            </div>
        </div>
    );
}