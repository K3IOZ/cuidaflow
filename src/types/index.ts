export interface Turno {
    id: string;
    cliente: string;
    localizacao: string;
    horario: string;
    duracao: string;
    status: 'confirmado' | 'falta' | 'pendente' | 'critico' | 'no_show'; // Adicionei no_show
    cuidadora?: string | null;
    tipo: 'Normal' | 'Adaptado';
    data: string;
    tarefas: string[];
}

export interface Cuidadora {
    id: string;
    nome: string;
    foto?: string;
    telefone: string;
    skills: string[];
    disponibilidade: string[];
    distancia: number; // km
    matchScore: number; // 0-100
    rating: number; // 0-5
}

export interface Cliente {
    id: string;
    nome: string;
    morada: string;
    coordenadas: {
        lat: number;
        lng: number;
    };
    necessidades: string[];
    tipoAtendimento: 'Normal' | 'Adaptado';
}
