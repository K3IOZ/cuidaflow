-- =============================================================================
-- CuidaFlow Seed Data
-- Versão: 1.0
-- Descrição: Dados iniciais para desenvolvimento e testes
-- Inclui: 1 organização, 1 gestora, 5 utentes, 5 cuidadoras, 10 turnos
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ORGANIZAÇÃO
-- -----------------------------------------------------------------------------
INSERT INTO organizations (id, name, slug, settings) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'CuidaFlow Demo',
    'cuidaflow-demo',
    '{"timezone": "Europe/Lisbon", "currency": "EUR"}'
);

-- -----------------------------------------------------------------------------
-- PERFIL DA GESTORA (Profile)
-- Nota: Em produção, o ID seria o mesmo do auth.users
-- Para testes, usamos um UUID fixo
-- -----------------------------------------------------------------------------
INSERT INTO profiles (id, org_id, role, name, email, phone, is_active) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'manager',
    'Sara Oliveira',
    'sara.oliveira@cuidaflow.pt',
    '+351 910 000 001',
    true
);

-- -----------------------------------------------------------------------------
-- CUIDADORAS (5)
-- -----------------------------------------------------------------------------
INSERT INTO caregivers (id, org_id, name, phone, email, skills, availability, location_lat, location_lng, address, is_active) VALUES
-- Ana Paula Ribeiro (matchScore: 95)
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Ana Paula Ribeiro',
    '+351 912 345 678',
    'ana.ribeiro@email.pt',
    '["Mobilidade", "Demência", "Fisioterapia"]',
    '{"monday": [{"start": "07:00", "end": "20:00"}], "tuesday": [{"start": "07:00", "end": "20:00"}], "wednesday": [{"start": "07:00", "end": "20:00"}], "thursday": [{"start": "07:00", "end": "20:00"}], "friday": [{"start": "07:00", "end": "20:00"}]}',
    38.7223,
    -9.1393,
    'Rua da Prata, 100, Lisboa',
    true
),
-- Sofia Martins (matchScore: 88)
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Sofia Martins',
    '+351 923 456 789',
    'sofia.martins@email.pt',
    '["Higiene", "Medicação", "Cozinha"]',
    '{"monday": [{"start": "12:00", "end": "22:00"}], "tuesday": [{"start": "12:00", "end": "22:00"}], "wednesday": [{"start": "12:00", "end": "22:00"}], "thursday": [{"start": "12:00", "end": "22:00"}], "friday": [{"start": "12:00", "end": "22:00"}]}',
    38.7167,
    -9.1390,
    'Avenida da Liberdade, 50, Lisboa',
    true
),
-- Cristina Ferreira (matchScore: 92)
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Cristina Ferreira',
    '+351 934 567 890',
    'cristina.ferreira@email.pt',
    '["Cuidados especiais", "Demência", "Mobilidade"]',
    '{"monday": [{"start": "07:00", "end": "22:00"}], "tuesday": [{"start": "07:00", "end": "22:00"}], "wednesday": [{"start": "07:00", "end": "22:00"}], "thursday": [{"start": "07:00", "end": "22:00"}], "friday": [{"start": "07:00", "end": "22:00"}], "saturday": [{"start": "08:00", "end": "18:00"}]}',
    38.7290,
    -9.1500,
    'Rua de São Bento, 20, Lisboa',
    true
),
-- Diana Santos (matchScore: 85)
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Diana Santos',
    '+351 945 678 901',
    'diana.santos@email.pt',
    '["Companhia", "Passeios", "Medicação"]',
    '{"monday": [{"start": "07:00", "end": "13:00"}], "tuesday": [{"start": "07:00", "end": "13:00"}], "wednesday": [{"start": "07:00", "end": "13:00"}], "thursday": [{"start": "07:00", "end": "13:00"}], "friday": [{"start": "07:00", "end": "13:00"}]}',
    38.7100,
    -9.1350,
    'Rua Augusta, 200, Lisboa',
    true
),
-- Elena Ferreira (matchScore: 79)
(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'Elena Ferreira',
    '+351 956 789 012',
    'elena.ferreira@email.pt',
    '["Higiene", "Alimentação", "Noite"]',
    '{"monday": [{"start": "12:00", "end": "20:00"}], "tuesday": [{"start": "12:00", "end": "20:00"}], "wednesday": [{"start": "12:00", "end": "20:00"}], "thursday": [{"start": "12:00", "end": "20:00"}], "friday": [{"start": "12:00", "end": "20:00"}]}',
    38.7050,
    -9.1420,
    'Largo do Chiado, 5, Lisboa',
    true
);

-- -----------------------------------------------------------------------------
-- UTENTES / CLIENTES (5)
-- Baseados nos nomes do mockData
-- -----------------------------------------------------------------------------
INSERT INTO clients (id, org_id, manager_id, name, phone, address, location_lat, location_lng, care_needs, preferences, emergency_contact, is_active) VALUES
-- Maria José Santos
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Maria José Santos',
    '+351 911 111 111',
    'Rua das Flores, 45, Lisboa',
    38.7180,
    -9.1400,
    '{"required_skills": ["Higiene pessoal", "Medicação"], "mobility_level": "limited"}',
    '{"preferred_gender": "female", "preferred_time": "morning"}',
    '{"name": "Carlos Santos", "phone": "+351 911 111 112", "relation": "filho"}',
    true
),
-- António Ferreira
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'António Ferreira',
    '+351 922 222 222',
    'Avenida da Liberdade, 120, Lisboa',
    38.7200,
    -9.1450,
    '{"required_skills": ["Mobilidade", "Fisioterapia"], "mobility_level": "wheelchair"}',
    '{"preferred_time": "morning", "requires_adapted_transport": true}',
    '{"name": "Luísa Ferreira", "phone": "+351 922 222 223", "relation": "esposa"}',
    true
),
-- Carmen Silva
(
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Carmen Silva',
    '+351 933 333 333',
    'Rua do Ouro, 78, Lisboa',
    38.7120,
    -9.1380,
    '{"required_skills": ["Limpeza", "Cozinha", "Medicação"], "mobility_level": "normal"}',
    '{"preferred_time": "morning"}',
    '{"name": "Pedro Silva", "phone": "+351 933 333 334", "relation": "filho"}',
    true
),
-- Manuel Oliveira
(
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Manuel Oliveira',
    '+351 944 444 444',
    'Rua de São Bento, 34, Lisboa',
    38.7280,
    -9.1480,
    '{"required_skills": ["Banho", "Medicação"], "mobility_level": "limited"}',
    '{"preferred_time": "afternoon"}',
    '{"name": "Teresa Oliveira", "phone": "+351 944 444 445", "relation": "filha"}',
    true
),
-- Isabel Costa
(
    'd0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Isabel Costa',
    '+351 955 555 555',
    'Rua Augusta, 156, Lisboa',
    38.7090,
    -9.1370,
    '{"required_skills": ["Cuidados especiais", "Alimentação assistida"], "mobility_level": "wheelchair"}',
    '{"preferred_time": "morning", "requires_adapted_transport": true}',
    '{"name": "João Costa", "phone": "+351 955 555 556", "relation": "marido"}',
    true
);

-- -----------------------------------------------------------------------------
-- TURNOS (10)
-- Inclui 3 faltas (no_show) conforme mockData: turnos 1, 3, 8
-- Status mapeados: 
--   falta/critico -> no_show
--   confirmado -> confirmed  
--   pendente -> pending_acceptance
-- -----------------------------------------------------------------------------
INSERT INTO shifts (id, org_id, client_id, caregiver_id, original_caregiver_id, shift_date, start_time, end_time, status, tasks, notes) VALUES
-- Turno 1: Maria José Santos - FALTA (08:00-14:00)
(
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001', -- Maria José Santos
    NULL, -- sem cuidadora atribuída (falta)
    'c0000000-0000-0000-0000-000000000001', -- Ana Paula era a original
    '2026-02-08',
    '08:00',
    '14:00',
    'no_show',
    '[{"name": "Higiene pessoal", "done": false}, {"name": "Preparar refeições", "done": false}, {"name": "Medicação", "done": false}]',
    'Cuidadora não compareceu. Precisa substituição urgente.'
),
-- Turno 2: António Ferreira - CONFIRMADO (09:00-13:00)
(
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002', -- António Ferreira
    'c0000000-0000-0000-0000-000000000001', -- Ana Paula Ribeiro
    NULL,
    '2026-02-08',
    '09:00',
    '13:00',
    'confirmed',
    '[{"name": "Mobilidade", "done": false}, {"name": "Fisioterapia", "done": false}, {"name": "Companhia", "done": false}]',
    'Transporte adaptado necessário.'
),
-- Turno 3: Carmen Silva - FALTA (10:00-16:00)
(
    'e0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003', -- Carmen Silva
    NULL, -- sem cuidadora (falta)
    'c0000000-0000-0000-0000-000000000002', -- Sofia era a original
    '2026-02-08',
    '10:00',
    '16:00',
    'no_show',
    '[{"name": "Limpeza", "done": false}, {"name": "Cozinhar", "done": false}, {"name": "Medicação", "done": false}]',
    'Cuidadora avisou de manhã que não podia ir.'
),
-- Turno 4: Manuel Oliveira - CONFIRMADO (14:00-20:00)
(
    'e0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000004', -- Manuel Oliveira
    'c0000000-0000-0000-0000-000000000002', -- Sofia Martins
    NULL,
    '2026-02-08',
    '14:00',
    '20:00',
    'confirmed',
    '[{"name": "Banho", "done": false}, {"name": "Medicação", "done": false}, {"name": "Passeio", "done": false}]',
    NULL
),
-- Turno 5: Isabel Costa - PENDENTE (08:00-12:00)
(
    'e0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000005', -- Isabel Costa
    'c0000000-0000-0000-0000-000000000003', -- Cristina Ferreira (proposta)
    NULL,
    '2026-02-08',
    '08:00',
    '12:00',
    'pending_acceptance',
    '[{"name": "Cuidados especiais", "done": false}, {"name": "Alimentação assistida", "done": false}]',
    'Aguardando confirmação da cuidadora. Requer transporte adaptado.'
),
-- Turno 6: Fernando Lopes (usando Isabel Costa como utente extra) - CRÍTICO (15:00-19:00)
-- Vou adicionar Fernando Lopes como utente extra in-line
(
    'e0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001', -- reutilizando Maria José para este demo
    NULL,
    'c0000000-0000-0000-0000-000000000004', -- Diana era a original
    '2026-02-08',
    '15:00',
    '19:00',
    'no_show',
    '[{"name": "Medicação urgente", "done": false}, {"name": "Acompanhamento", "done": false}]',
    'CRÍTICO: Medicação urgente não administrada!'
),
-- Turno 7: Rosa Maria Pereira (usando Manuel) - CONFIRMADO para amanhã (09:00-17:00)
(
    'e0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000004', -- Manuel Oliveira
    'c0000000-0000-0000-0000-000000000003', -- Cristina Ferreira
    NULL,
    '2026-02-09',
    '09:00',
    '17:00',
    'confirmed',
    '[{"name": "Dia completo", "done": false}, {"name": "Atividades", "done": false}, {"name": "Medicação", "done": false}]',
    'Turno prolongado - trazer almoço.'
),
-- Turno 8: Joaquim Alberto (usando António) - FALTA para amanhã (08:30-14:30)
(
    'e0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002', -- António Ferreira
    NULL, -- falta
    'c0000000-0000-0000-0000-000000000001', -- Ana Paula era a original
    '2026-02-09',
    '08:30',
    '14:30',
    'no_show',
    '[{"name": "Mobilidade", "done": false}, {"name": "Fisioterapia", "done": false}, {"name": "Higiene", "done": false}]',
    'Transporte adaptado. Cuidadora ficou doente.'
),
-- Turno 9: Teresa Gonçalves (usando Carmen) - CONFIRMADO para amanhã (10:00-14:00)
(
    'e0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003', -- Carmen Silva
    'c0000000-0000-0000-0000-000000000004', -- Diana Santos
    NULL,
    '2026-02-09',
    '10:00',
    '14:00',
    'confirmed',
    '[{"name": "Companhia", "done": false}, {"name": "Caminhada", "done": false}, {"name": "Medicação", "done": false}]',
    NULL
),
-- Turno 10: Carlos Mendes (usando Isabel) - CONFIRMADO para amanhã (13:00-19:00)
(
    'e0000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000005', -- Isabel Costa
    'c0000000-0000-0000-0000-000000000005', -- Elena Ferreira
    NULL,
    '2026-02-09',
    '13:00',
    '19:00',
    'confirmed',
    '[{"name": "Almoço", "done": false}, {"name": "Sesta", "done": false}, {"name": "Atividades", "done": false}]',
    NULL
);

-- =============================================================================
-- VERIFICAÇÃO
-- =============================================================================
-- Após executar, podes verificar os dados com:
--
-- SELECT COUNT(*) as total_org FROM organizations;
-- SELECT COUNT(*) as total_profiles FROM profiles;
-- SELECT COUNT(*) as total_caregivers FROM caregivers;
-- SELECT COUNT(*) as total_clients FROM clients;
-- SELECT COUNT(*) as total_shifts FROM shifts;
-- SELECT status, COUNT(*) FROM shifts GROUP BY status;
--
-- =============================================================================
