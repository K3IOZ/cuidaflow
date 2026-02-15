import { useState, useEffect, useCallback } from 'react';
import { Turno } from '@/types';
import { supabase } from '@/lib/supabase';

export function useTurnos(filtroAtivo: 'todos' | 'hoje' | 'faltas', dataSelecionada: string) {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTurnos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // A query agora é filtrada pela data selecionada no Dashboard
            let query = supabase
                .from('shifts')
                .select(`
                    id, shift_date, start_time, end_time, status, tasks, type,
                    client:clients (name, address),
                    caregiver:caregivers!caregiver_id (name)
                `)
                .eq('shift_date', dataSelecionada)
                .eq('org_id', 'a0000000-0000-0000-0000-000000000001');

            // Filtro de faltas atua sobre a data selecionada
            if (filtroAtivo === 'faltas') {
                query = query.eq('status', 'no_show');
            }

            const { data, error: dbError } = await query;
            if (dbError) throw dbError;

            const transformados: Turno[] = (data as any[]).map(s => {
                let statusFinal: any = 'pendente';
                if (s.status === 'no_show') statusFinal = 'falta';
                if (s.status === 'confirmed') statusFinal = 'confirmado';
                if (s.status === 'scheduled') statusFinal = 'pendente';

                return {
                    id: s.id,
                    cliente: s.client?.name || 'Sem nome',
                    localizacao: s.client?.address || 'Sem morada',
                    horario: `${s.start_time.slice(0,5)} - ${s.end_time.slice(0,5)}`,
                    duracao: '4h', 
                    status: statusFinal,
                    tipo: s.type || 'Normal',
                    data: s.shift_date,
                    tarefas: Array.isArray(s.tasks) ? s.tasks : [],
                    cuidadora: s.caregiver?.name || null
                };
            });

            setTurnos(transformados);
        } catch (err: any) {
            console.error("Erro useTurnos:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filtroAtivo, dataSelecionada]);

    useEffect(() => {
        fetchTurnos();
    }, [fetchTurnos]);

    const stats = {
        total: turnos.length,
        faltas: turnos.filter(t => t.status === 'falta').length,
        criticos: turnos.filter(t => t.status === 'critico').length,
        pendentes: turnos.filter(t => t.status === 'pendente').length,
    };

    return { turnos, loading, error, refetch: fetchTurnos, stats };
}