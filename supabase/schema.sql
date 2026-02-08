-- =============================================================================
-- CuidaFlow Database Schema
-- Version: 2.1
-- Descrição: Schema completo para plataforma de gestão de apoio domiciliário
-- NOTA: Todas as tabelas são criadas no schema PUBLIC
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSÕES
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Text search (trigrams)
-- Note: PostGIS precisa ser ativado via Dashboard do Supabase em Database > Extensions

-- -----------------------------------------------------------------------------
-- TIPOS ENUM
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_status AS ENUM (
        'scheduled',
        'pending_acceptance',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'no_show'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transport_type AS ENUM ('normal', 'adapted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- TABELA: organizations
-- Multi-tenancy principal. Todas as entidades pertencem a uma organização.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE organizations IS 'Organizações (tenants) do sistema';
COMMENT ON COLUMN organizations.slug IS 'Identificador único URL-friendly';
COMMENT ON COLUMN organizations.settings IS 'Configurações: timezone, moeda, preferências';

-- -----------------------------------------------------------------------------
-- TABELA: profiles
-- Perfis de utilizadores no schema public, referenciando auth.users pelo ID
-- O trigger para criar profiles automaticamente será criado depois via Dashboard
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,  -- Será o mesmo ID de auth.users
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Perfis de utilizadores (gestoras, admins)';
COMMENT ON COLUMN profiles.id IS 'Mesmo ID que auth.users - associar manualmente ou via trigger';

CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- -----------------------------------------------------------------------------
-- TABELA: caregivers
-- Cuidadoras/Auxiliares de ação direta
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS caregivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    skills JSONB DEFAULT '[]',
    availability JSONB DEFAULT '{}',
    location_lat FLOAT,
    location_lng FLOAT,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE caregivers IS 'Cuidadoras e auxiliares de apoio domiciliário';
COMMENT ON COLUMN caregivers.skills IS 'Array de competências: ["alzheimer", "mobilidade_reduzida", ...]';
COMMENT ON COLUMN caregivers.availability IS 'Horários por dia: {"monday": [{"start": "08:00", "end": "18:00"}], ...}';

CREATE INDEX IF NOT EXISTS idx_caregivers_org ON caregivers(org_id);
CREATE INDEX IF NOT EXISTS idx_caregivers_skills ON caregivers USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_caregivers_active ON caregivers(org_id, is_active);

-- -----------------------------------------------------------------------------
-- TABELA: clients
-- Utentes/Clientes que recebem cuidados
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    location_lat FLOAT,
    location_lng FLOAT,
    care_needs JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    emergency_contact JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE clients IS 'Utentes que recebem cuidados domiciliários';
COMMENT ON COLUMN clients.manager_id IS 'Gestora responsável pelo utente';
COMMENT ON COLUMN clients.care_needs IS 'Necessidades: {"required_skills": [...], "mobility_level": "..."}';
COMMENT ON COLUMN clients.preferences IS 'Preferências: horário, género cuidadora, etc.';
COMMENT ON COLUMN clients.emergency_contact IS 'Contacto de emergência: {"name": "...", "phone": "..."}';

CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(org_id);
CREATE INDEX IF NOT EXISTS idx_clients_manager ON clients(manager_id);
CREATE INDEX IF NOT EXISTS idx_clients_care_needs ON clients USING GIN(care_needs);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(org_id, is_active);

-- -----------------------------------------------------------------------------
-- TABELA: shifts
-- Turnos de trabalho atribuídos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    caregiver_id UUID REFERENCES caregivers(id) ON DELETE SET NULL,
    original_caregiver_id UUID REFERENCES caregivers(id) ON DELETE SET NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status shift_status DEFAULT 'scheduled',
    tasks JSONB DEFAULT '[]',
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    check_in_location JSONB,
    check_out_location JSONB,
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE shifts IS 'Turnos de trabalho agendados';
COMMENT ON COLUMN shifts.original_caregiver_id IS 'Cuidadora original se houve substituição';
COMMENT ON COLUMN shifts.tasks IS 'Lista de tarefas: [{"name": "...", "done": false}, ...]';
COMMENT ON COLUMN shifts.check_in_location IS 'Localização GPS do check-in';

CREATE INDEX IF NOT EXISTS idx_shifts_org ON shifts(org_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_caregiver ON shifts(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_shifts_client ON shifts(client_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_date_status ON shifts(org_id, shift_date, status);

-- -----------------------------------------------------------------------------
-- TABELA: transport_quotes
-- Orçamentos de transporte para substituições
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transport_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    transport_type transport_type NOT NULL,
    distance_km FLOAT NOT NULL,
    is_weekend BOOLEAN DEFAULT FALSE,
    is_round_trip BOOLEAN DEFAULT FALSE,
    base_price DECIMAL(10,2) NOT NULL,
    km_price DECIMAL(10,2) NOT NULL,
    trip_supplement DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE transport_quotes IS 'Orçamentos de transporte para deslocações';
COMMENT ON COLUMN transport_quotes.transport_type IS 'normal ou adapted (adaptado)';
COMMENT ON COLUMN transport_quotes.is_round_trip IS 'Se inclui ida e volta';

CREATE INDEX IF NOT EXISTS idx_transport_quotes_shift ON transport_quotes(shift_id);

-- -----------------------------------------------------------------------------
-- TABELA: audit_log (opcional mas recomendado)
-- Registo de alterações importantes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_log IS 'Registo de auditoria para alterações críticas';

CREATE INDEX IF NOT EXISTS idx_audit_log_org ON audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- -----------------------------------------------------------------------------
-- FUNÇÕES: Triggers para updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_caregivers_updated_at ON caregivers;
CREATE TRIGGER update_caregivers_updated_at
    BEFORE UPDATE ON caregivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Isolamento multi-tenant
-- -----------------------------------------------------------------------------

-- Ativar RLS em todas as tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para obter org_id do utilizador atual
-- Usa auth.uid() que é uma função built-in do Supabase
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS: organizations
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
CREATE POLICY "Users can view their organization"
    ON organizations FOR SELECT
    USING (id = get_user_org_id());

DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;
CREATE POLICY "Admins can update their organization"
    ON organizations FOR UPDATE
    USING (id = get_user_org_id())
    WITH CHECK (id = get_user_org_id());

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS: profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view profiles in their org" ON profiles;
CREATE POLICY "Users can view profiles in their org"
    ON profiles FOR SELECT
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "New users can insert their profile" ON profiles;
CREATE POLICY "New users can insert their profile"
    ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS: caregivers
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view caregivers in their org" ON caregivers;
CREATE POLICY "Users can view caregivers in their org"
    ON caregivers FOR SELECT
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Managers can manage caregivers in their org" ON caregivers;
CREATE POLICY "Managers can manage caregivers in their org"
    ON caregivers FOR ALL
    USING (org_id = get_user_org_id())
    WITH CHECK (org_id = get_user_org_id());

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS: clients
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view clients in their org" ON clients;
CREATE POLICY "Users can view clients in their org"
    ON clients FOR SELECT
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Managers can manage clients in their org" ON clients;
CREATE POLICY "Managers can manage clients in their org"
    ON clients FOR ALL
    USING (org_id = get_user_org_id())
    WITH CHECK (org_id = get_user_org_id());

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS: shifts
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view shifts in their org" ON shifts;
CREATE POLICY "Users can view shifts in their org"
    ON shifts FOR SELECT
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Managers can manage shifts in their org" ON shifts;
CREATE POLICY "Managers can manage shifts in their org"
    ON shifts FOR ALL
    USING (org_id = get_user_org_id())
    WITH CHECK (org_id = get_user_org_id());

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS: transport_quotes
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view transport quotes in their org" ON transport_quotes;
CREATE POLICY "Users can view transport quotes in their org"
    ON transport_quotes FOR SELECT
    USING (
        shift_id IN (
            SELECT id FROM shifts WHERE org_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS "Managers can manage transport quotes in their org" ON transport_quotes;
CREATE POLICY "Managers can manage transport quotes in their org"
    ON transport_quotes FOR ALL
    USING (
        shift_id IN (
            SELECT id FROM shifts WHERE org_id = get_user_org_id()
        )
    );

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS: audit_log
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view audit logs in their org" ON audit_log;
CREATE POLICY "Users can view audit logs in their org"
    ON audit_log FOR SELECT
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_log;
CREATE POLICY "System can insert audit logs"
    ON audit_log FOR INSERT
    WITH CHECK (org_id = get_user_org_id());

-- =============================================================================
-- NOTAS IMPORTANTES
-- =============================================================================
-- 
-- 1. CRIAR PROFILE APÓS SIGNUP:
--    Depois de um user se registar via auth.users, precisas criar o profile
--    correspondente. Existem duas opções:
--    
--    a) Via código na aplicação (recomendado):
--       Após signup, fazer INSERT na tabela profiles com os dados do user
--    
--    b) Via trigger no Dashboard do Supabase:
--       Vai a Database > Functions e cria uma function que insere em profiles
--       Depois vai a Database > Triggers e cria um trigger ON auth.users
--
-- 2. PRIMEIRA ORGANIZAÇÃO:
--    Para começar, cria manualmente uma organização:
--    
--    INSERT INTO organizations (name, slug) 
--    VALUES ('Minha Organização', 'minha-org');
--
-- 3. PRIMEIRO ADMIN:
--    Após criar um user via Auth e a organização:
--    
--    INSERT INTO profiles (id, org_id, name, email, role)
--    VALUES (
--      '<user-id-do-auth>',
--      '<org-id>',
--      'Admin Name',
--      'admin@example.com',
--      'admin'
--    );
--
-- =============================================================================
-- FIM DO SCHEMA
-- =============================================================================
