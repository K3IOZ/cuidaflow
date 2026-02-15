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
            // FIX CRÍTICO: Usar a data LOCAL (Porto) e não UTC
            // 'en-CA' força o formato YYYY-MM-DD que o Supabase gosta
            const hojeLocal = new Date().toLocaleDateString('en-CA');

            let query = supabase
                .from('shifts')
                .select(`
                    id, shift_date, start_time, end_time, status, tasks, type,
                    client:clients (name, address),
                    caregiver:caregivers!caregiver_id (name)
                `)
                .eq('org_id', 'a0000000-0000-0000-0000-000000000001') // ID da Simulação
                .order('start_time', { ascending: true }); // Ordenar por hora

            // Filtro 'Hoje' usando a data correta
            if (filtroAtivo === 'hoje') {
                query = query.eq('shift_date', hojeLocal);
            }

            // Filtro 'Faltas'
            if (filtroAtivo === 'faltas') {
                query = query.eq('status', 'no_show');
            }

            const { data, error: dbError } = await query;
            if (dbError) throw dbError;

            const transformados: Turno[] = (data as any[]).map(s => {
                // Cálculo real da duração (ex: 13:00 às 09:00)
                const start = parseInt(s.start_time.split(':')[0]);
                const end = parseInt(s.end_time.split(':')[0]);
                let duracaoHoras = end - start;
                if (duracaoHoras < 0) duracaoHoras += 24; // Compensa turnos que passam da meia-noite

                let statusFinal: any = 'pendente';
                if (s.status === 'no_show') statusFinal = 'falta';
                if (s.status === 'confirmed') statusFinal = 'confirmado';
                if (s.status === 'scheduled') statusFinal = 'pendente';

                return {
                    id: s.id,
                    cliente: s.client?.name || 'Sem nome',
                    localizacao: s.client?.address || 'Sem morada',
                    // Formata para não mostrar segundos (13:00 em vez de 13:00:00)
                    horario: `${s.start_time.slice(0,5)} - ${s.end_time.slice(0,5)}`,
                    duracao: `${duracaoHoras}h`,
                    status: statusFinal,
                    tipo: s.type || 'Normal',
                    data: s.shift_date, // A data está aqui, só falta o cartão mostrá-la
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