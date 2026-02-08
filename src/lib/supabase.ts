import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente Supabase para uso no browser
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

// Tipos para as tabelas do Supabase (quando o Opus criar o schema)
export type Database = {
    public: {
        Tables: {
            organizations: {
                Row: {
                    id: string;
                    name: string;
                    created_at: string;
                };
            };
            shifts: {
                Row: {
                    id: string;
                    organization_id: string;
                    client_id: string;
                    caregiver_id: string | null;
                    start_time: string;
                    end_time: string;
                    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
                    type: 'normal' | 'adapted';
                    location: string;
                    tasks: string[];
                    created_at: string;
                };
            };
            caregivers: {
                Row: {
                    id: string;
                    organization_id: string;
                    user_id: string;
                    name: string;
                    phone: string;
                    skills: string[];
                    rating: number;
                    created_at: string;
                };
            };
            clients: {
                Row: {
                    id: string;
                    organization_id: string;
                    name: string;
                    address: string;
                    needs: string[];
                    care_type: 'normal' | 'adapted';
                    created_at: string;
                };
            };
        };
    };
};
