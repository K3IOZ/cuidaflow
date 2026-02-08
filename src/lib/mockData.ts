import { Turno, Cuidadora } from '../types';

export const mockTurnos: Turno[] = [
    {
        id: '1',
        cliente: 'Maria José Santos',
        localizacao: 'Rua das Flores, 45, Lisboa',
        horario: '08:00 - 14:00',
        duracao: '6h',
        status: 'falta',
        tipo: 'Normal',
        data: '2026-02-08',
        tarefas: ['Higiene pessoal', 'Preparar refeições', 'Medicação']
    },
    {
        id: '2',
        cliente: 'António Ferreira',
        localizacao: 'Avenida da Liberdade, 120, Lisboa',
        horario: '09:00 - 13:00',
        duracao: '4h',
        status: 'confirmado',
        cuidadora: 'Ana Paula Ribeiro',
        tipo: 'Adaptado',
        data: '2026-02-08',
        tarefas: ['Mobilidade', 'Fisioterapia', 'Companhia']
    },
    {
        id: '3',
        cliente: 'Carmen Silva',
        localizacao: 'Rua do Ouro, 78, Lisboa',
        horario: '10:00 - 16:00',
        duracao: '6h',
        status: 'falta',
        tipo: 'Normal',
        data: '2026-02-08',
        tarefas: ['Limpeza', 'Cozinhar', 'Medicação']
    },
    {
        id: '4',
        cliente: 'Manuel Oliveira',
        localizacao: 'Rua de São Bento, 34, Lisboa',
        horario: '14:00 - 20:00',
        duracao: '6h',
        status: 'confirmado',
        cuidadora: 'Sofia Martins',
        tipo: 'Normal',
        data: '2026-02-08',
        tarefas: ['Banho', 'Medicação', 'Passeio']
    },
    {
        id: '5',
        cliente: 'Isabel Costa',
        localizacao: 'Rua Augusta, 156, Lisboa',
        horario: '08:00 - 12:00',
        duracao: '4h',
        status: 'pendente',
        tipo: 'Adaptado',
        data: '2026-02-08',
        tarefas: ['Cuidados especiais', 'Alimentação assistida']
    },
    {
        id: '6',
        cliente: 'Fernando Lopes',
        localizacao: 'Rua Garrett, 89, Lisboa',
        horario: '15:00 - 19:00',
        duracao: '4h',
        status: 'critico',
        tipo: 'Normal',
        data: '2026-02-08',
        tarefas: ['Medicação urgente', 'Acompanhamento']
    },
    {
        id: '7',
        cliente: 'Rosa Maria Pereira',
        localizacao: 'Avenida 24 de Julho, 200, Lisboa',
        horario: '09:00 - 17:00',
        duracao: '8h',
        status: 'confirmado',
        cuidadora: 'Cristina Ferreira',
        tipo: 'Normal',
        data: '2026-02-09',
        tarefas: ['Dia completo', 'Atividades', 'Medicação']
    },
    {
        id: '8',
        cliente: 'Joaquim Alberto',
        localizacao: 'Rua da Prata, 67, Lisboa',
        horario: '08:30 - 14:30',
        duracao: '6h',
        status: 'falta',
        tipo: 'Adaptado',
        data: '2026-02-09',
        tarefas: ['Mobilidade', 'Fisioterapia', 'Higiene']
    },
    {
        id: '9',
        cliente: 'Teresa Gonçalves',
        localizacao: 'Rua do Carmo, 45, Lisboa',
        horario: '10:00 - 14:00',
        duracao: '4h',
        status: 'confirmado',
        cuidadora: 'Diana Santos',
        tipo: 'Normal',
        data: '2026-02-09',
        tarefas: ['Companhia', 'Caminhada', 'Medicação']
    },
    {
        id: '10',
        cliente: 'Carlos Mendes',
        localizacao: 'Largo do Chiado, 12, Lisboa',
        horario: '13:00 - 19:00',
        duracao: '6h',
        status: 'confirmado',
        cuidadora: 'Elena Ferreira',
        tipo: 'Normal',
        data: '2026-02-09',
        tarefas: ['Almoço', 'Sesta', 'Atividades']
    }
];

export const mockCuidadoras: Cuidadora[] = [
    {
        id: 'c1',
        nome: 'Ana Paula Ribeiro',
        telefone: '+351 912 345 678',
        skills: ['Mobilidade', 'Demência', 'Fisioterapia'],
        disponibilidade: ['Manhã', 'Tarde'],
        distancia: 2.5,
        matchScore: 95,
        rating: 4.8
    },
    {
        id: 'c2',
        nome: 'Sofia Martins',
        telefone: '+351 923 456 789',
        skills: ['Higiene', 'Medicação', 'Cozinha'],
        disponibilidade: ['Tarde', 'Noite'],
        distancia: 1.2,
        matchScore: 88,
        rating: 4.9
    },
    {
        id: 'c3',
        nome: 'Cristina Ferreira',
        telefone: '+351 934 567 890',
        skills: ['Cuidados especiais', 'Demência', 'Mobilidade'],
        disponibilidade: ['Manhã', 'Tarde', 'Noite'],
        distancia: 3.8,
        matchScore: 92,
        rating: 4.7
    },
    {
        id: 'c4',
        nome: 'Diana Santos',
        telefone: '+351 945 678 901',
        skills: ['Companhia', 'Passeios', 'Medicação'],
        disponibilidade: ['Manhã'],
        distancia: 0.9,
        matchScore: 85,
        rating: 4.6
    },
    {
        id: 'c5',
        nome: 'Elena Ferreira',
        telefone: '+351 956 789 012',
        skills: ['Higiene', 'Alimentação', 'Noite'],
        disponibilidade: ['Tarde'],
        distancia: 4.2,
        matchScore: 79,
        rating: 4.5
    }
];
