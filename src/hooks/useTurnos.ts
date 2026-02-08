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
            const targetDate = '2026-02-08';

            let query = supabase
                .from('shifts')
                .select(`
                    id, shift_date, start_time, end_time, status, tasks, type,
                    client:clients (name, address),
                    caregiver:caregivers!caregiver_id (name)
                `);

            if (filtroAtivo === 'hoje') query = query.eq('shift_date', targetDate);

            // AQUI ESTÁ O FIX: Usamos 'no_show' para a base de dados
            if (filtroAtivo === 'faltas') {
                query = query.in('status', ['no_show']);
            }

            const { data, error: dbError } = await query;
            if (dbError) throw dbError;

            const transformados: Turno[] = (data as any[]).map(s => {
                // TRADUTOR DE ESTADOS (Para o frontend entender)
                let statusFinal: any = 'pendente';
                if (s.status === 'no_show') statusFinal = 'falta';
                if (s.status === 'confirmed') statusFinal = 'confirmado';
                if (s.status === 'scheduled') statusFinal = 'pendente';

                return {
                    id: s.id,
                    cliente: s.client?.name || 'Sem nome',
                    localizacao: s.client?.address || 'Sem morada',
                    horario: `${s.start_time} - ${s.end_time}`,
                    duracao: '6h',
                    status: statusFinal, // "falta" reaparece aqui
                    tipo: s.type || 'Normal',
                    data: s.shift_date,
                    tarefas: Array.isArray(s.tasks)
                        ? s.tasks.map((t: any) => typeof t === 'object' ? t.name : t)
                        : [],
                    cuidadora: s.caregiver?.name || null
                };
            });

            setTurnos(transformados);
        } catch (err: any) {
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