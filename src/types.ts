export interface Product {
  id: string;
  name: string;
  category: 'Funko Pop' | 'Action Figure' | 'Estátua' | 'Acessórios' | 'Outros';
  theme: 'Marvel' | 'Naruto' | 'Jujutsu Kaisen' | 'Dragon Ball' | 'Disney' | 'DC Comics' | 'Outros';
  price: number;
  originalPrice?: number;
  imageUrl: string;
  description: string;
  isAvailable: boolean;
  isFeatured: boolean;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  minIncrement: number;
  endsAt: string; // ISO String or Relative time description
  status: 'active' | 'upcoming' | 'ended';
  bidsCount: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatarUrl: string;
}

export interface OrderLog {
  id: string;
  customerName: string;
  address: string;
  phone?: string;
  items: { productName: string; quantity: number; price: number }[];
  totalValue: number;
  timestamp: string;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
}
