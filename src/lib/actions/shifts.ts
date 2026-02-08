'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Interface para o Dashboard
export interface DashboardShift {
    id: string;
    client_id: string;
    caregiver_id: string | null;
    shift_date: string;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'pending_acceptance' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    type: 'Normal' | 'Adaptado';
    tasks: string[] | any;
    client: {
        name: string;
        address: string;
    } | null;
    caregiver: {
        name: string;
    } | null;
}

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * 1. BUSCAR TURNOS
 * Traz os dados reais do dia, incluindo as relações com clientes e cuidadoras
 */
export async function getDashboardShifts(date?: string): Promise<ActionResult<DashboardShift[]>> {
    try {
        const supabase = await createClient();
        const targetDate = date || '2026-02-08';

        const { data, error } = await supabase
            .from('shifts')
            .select(`
                id,
                shift_date,
                start_time,
                end_time,
                status,
                tasks,
                type,
                client:clients (name, address),
                caregiver:caregivers!caregiver_id (name)
            `)
            .eq('shift_date', targetDate)
            .order('start_time', { ascending: true });

        if (error) throw error;

        return {
            success: true,
            data: data as unknown as DashboardShift[]
        };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 2. ATRIBUIR CUIDADORA
 * Grava a substituição e marca o turno como confirmado
 */
export async function assignCaregiverToShift(shiftId: string, caregiverId: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('shifts')
            .update({
                caregiver_id: caregiverId,
                status: 'confirmed',
                updated_at: new Date().toISOString()
            })
            .eq('id', shiftId);

        if (error) throw error;

        // Revalida o cache para o Dashboard atualizar sozinho
        revalidatePath('/dashboard');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 3. BUSCAR CUIDADORAS DISPONÍVEIS (INTELIGENTE)
 * Filtra cuidadoras que já têm turnos confirmados no mesmo dia
 */
export async function getAvailableCaregivers(shiftId: string): Promise<ActionResult<any[]>> {
    try {
        const supabase = await createClient();

        // A. Primeiro, vamos buscar a data do turno que queremos preencher
        const { data: currentShift, error: shiftError } = await supabase
            .from('shifts')
            .select('shift_date')
            .eq('id', shiftId)
            .single();

        if (shiftError || !currentShift) throw new Error("Não foi possível localizar o turno.");

        // B. Descobrimos quais cuidadoras já estão ocupadas nesse dia
        const { data: occupiedShifts } = await supabase
            .from('shifts')
            .select('caregiver_id')
            .eq('shift_date', currentShift.shift_date)
            .not('caregiver_id', 'is', null)
            .in('status', ['confirmed', 'in_progress', 'completed']);

        // Extraímos apenas os IDs (ex: ['id-da-ana', 'id-da-maria'])
        const occupiedIds = occupiedShifts?.map(s => s.caregiver_id) || [];

        // C. Vamos buscar todas as cuidadoras que NÃO estão ocupadas
        let query = supabase.from('caregivers').select('*');

        if (occupiedIds.length > 0) {
            // "Filtra as cuidadoras cujo ID não está na lista de ocupadas"
            query = query.not('id', 'in', `(${occupiedIds.map(id => `"${id}"`).join(',')})`);
        }

        const { data, error } = await query.order('name');

        if (error) throw error;

        return {
            success: true,
            data: data || []
        };
    } catch (err: any) {
        console.error("Erro na busca de disponibilidade:", err.message);
        return { success: false, error: err.message };
    }
}