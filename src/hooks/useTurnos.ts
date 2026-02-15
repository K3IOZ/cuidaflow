import { useState, useEffect, useCallback } from 'react';
import { Turno } from '@/types';
import { supabase } from '@/lib/supabase';

export function useTurnos(filtroAtivo: 'todos' | 'hoje' | 'faltas') {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTurnos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // FIX 1: Data dinâmica (Hoje) em vez de fixa
            const hoje = new Date().toISOString().split('T')[0];

            // FIX 2: Adicionei o filtro da Organização ID correto
            let query = supabase
                .from('shifts')
                .select(`
                    id, shift_date, start_time, end_time, status, tasks, type,
                    client:clients (name, address),
                    caregiver:caregivers!caregiver_id (name)
                `)
                .eq('org_id', 'a0000000-0000-0000-0000-000000000001'); // ID da Simulação

            // Se o filtro for 'hoje', usa a data atual
            if (filtroAtivo === 'hoje') {
                query = query.eq('shift_date', hoje);
            }

            // Filtro de faltas
            if (filtroAtivo === 'faltas') {
                query = query.in('status', ['no_show']);
            }

            const { data, error: dbError } = await query;
            if (dbError) throw dbError;

            // Transformação de dados
            const transformados: Turno[] = (data as any[]).map(s => {
                let statusFinal: any = 'pendente';
                if (s.status === 'no_show') statusFinal = 'falta';
                if (s.status === 'confirmed') statusFinal = 'confirmado';
                if (s.status === 'scheduled') statusFinal = 'pendente';

                return {
                    id: s.id,
                    cliente: s.client?.name || 'Sem nome',
                    localizacao: s.client?.address || 'Sem morada',
                    horario: `${s.start_time} - ${s.end_time}`,
                    duracao: '4h', // Valor por defeito seguro
                    status: statusFinal,
                    tipo: s.type || 'Normal',
                    data: s.shift_date,
                    tarefas: Array.isArray(s.tasks)
                        ? s.tasks.map((t: any) => typeof t === 'object' ? t.name : t)
                        : [],
                    cuidadora: s.caregiver?.name || 'Por atribuir'
                };
            });

            setTurnos(transformados);
        } catch (err: any) {
            console.error("Erro Supabase:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filtroAtivo]);

    useEffect(() => { fetchTurnos(); }, [fetchTurnos]);

    const stats = {
        total: turnos.length,
        faltas: turnos.filter(t => t.status === 'falta').length,
        criticos: turnos.filter(t => t.status === 'critico').length,
        pendentes: turnos.filter(t => t.status === 'pendente').length,
    };

    return { turnos, loading, error, refetch: fetchTurnos, stats };
}