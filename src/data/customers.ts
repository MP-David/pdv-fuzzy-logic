export interface CustomerProfile {
  id: string;
  name: string;
  description: string;
  engagementScore: number;
}

/** Perfis mockados usados para pré-preencher o slider de engajamento. */
export const CUSTOMER_PROFILES: CustomerProfile[] = [
  { id: 'joao', name: 'João', description: 'Cliente Novo', engagementScore: 10 },
  { id: 'maria', name: 'Maria', description: 'Cliente Frequente', engagementScore: 55 },
  { id: 'carlos', name: 'Carlos', description: 'Cliente VIP', engagementScore: 90 },
];
