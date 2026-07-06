export interface Product {
  id: string;
  name: string;
  emoji: string;
  price: number;
}

/** Preços calibrados para cair claramente em cada faixa do conjunto Ticket. */
export const PRODUCTS: Product[] = [
  { id: 'headphones', name: 'Fone de Ouvido', emoji: '🎧', price: 39.9 },
  { id: 'sneakers', name: 'Tênis Esportivo', emoji: '👟', price: 149.9 },
  { id: 'notebook', name: 'Notebook', emoji: '💻', price: 349.9 },
];
