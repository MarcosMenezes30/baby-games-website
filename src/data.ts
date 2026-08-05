import { Product, Auction, Testimonial, OrderLog } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Funko Pop! Iron Man - Avengers EndGame (Glow in the Dark)',
    category: 'Funko Pop',
    theme: 'Marvel',
    price: 189.90,
    originalPrice: 220.00,
    imageUrl: '/images/iron_man.png',
    description: 'Edição especial exclusiva Glow in the Dark do Homem de Ferro em seu momento épico com as Joias do Infinito. Um item indispensável para qualquer fã da Marvel.',
    isAvailable: true,
    isFeatured: true,
    stock: 5
  },
  {
    id: '2',
    name: 'Action Figure Uzumaki Naruto - Modo Sábio dos Seis Caminhos',
    category: 'Action Figure',
    theme: 'Naruto',
    price: 349.90,
    imageUrl: 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?auto=format&fit=crop&q=80&w=600',
    description: 'Action Figure altamente detalhada do Naruto em sua forma mais poderosa de Seis Caminhos. Acompanha duas esferas da busca da verdade e pose de batalha clássica.',
    isAvailable: true,
    isFeatured: true,
    stock: 3
  },
  {
    id: '3',
    name: 'Action Figure Gojo Satoru - Unlimited Void Especial',
    category: 'Action Figure',
    theme: 'Jujutsu Kaisen',
    price: 399.90,
    originalPrice: 450.00,
    imageUrl: 'https://images.unsplash.com/photo-1608889174636-4074f7626960?auto=format&fit=crop&q=80&w=600',
    description: 'Estátua premium do feiticeiro mais forte, Gojo Satoru, executando sua Expansão de Domínio: Vazio Ilimitado. Efeito de energia translúcida em resina azul e roxa.',
    isAvailable: true,
    isFeatured: true,
    stock: 2
  },
  {
    id: '4',
    name: 'Funko Pop! Goku Super Saiyajin Deus (Blue Aura)',
    category: 'Funko Pop',
    theme: 'Dragon Ball',
    price: 159.90,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
    description: 'Goku em sua forma Super Saiyajin Deus com aura translúcida azul metálica. Altura aproximada de 10cm. Coleção Dragon Ball Super.',
    isAvailable: true,
    isFeatured: false,
    stock: 8
  },
  {
    id: '5',
    name: 'Funko Pop! Mickey Mouse - Fantasia Edição 80 Anos',
    category: 'Funko Pop',
    theme: 'Disney',
    price: 179.90,
    originalPrice: 199.90,
    imageUrl: 'https://images.unsplash.com/photo-1592188657297-c6473609e988?auto=format&fit=crop&q=80&w=600',
    description: 'Edição comemorativa histórica do Mickey Mouse Feiticeiro no clássico filme Fantasia. Toques metalizados e acabamento premium de colecionador.',
    isAvailable: true,
    isFeatured: false,
    stock: 12
  },
  {
    id: '6',
    name: 'Estátua Batman Noir - The Dark Knight Deluxe',
    category: 'Estátua',
    theme: 'DC Comics',
    price: 799.90,
    imageUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=600',
    description: 'Estátua de colecionador com escala 1:10 em resina maciça. Pintura em tons de cinza inspirada nas HQs de Frank Miller. Base detalhada imitando gárgula de Gotham.',
    isAvailable: true,
    isFeatured: true,
    stock: 1
  },
  {
    id: '7',
    name: 'Funko Pop! Kakashi Hatake com Susanoo (Exclusivo)',
    category: 'Funko Pop',
    theme: 'Naruto',
    price: 199.90,
    originalPrice: 240.00,
    imageUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&q=80&w=600',
    description: 'O ninja copiador Kakashi invocando seu Susanoo perfeito. Uma das peças mais procuradas do universo de Naruto Shippuden.',
    isAvailable: false,
    isFeatured: false,
    stock: 0
  },
  {
    id: '8',
    name: 'Luminária de Neon LED Gamepad Control',
    category: 'Acessórios',
    theme: 'Outros',
    price: 129.90,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600',
    description: 'Luminária de acrílico com iluminação neon em LED azul e rosa. Formato de controle de videogame de última geração. Perfeita para decorar seu setup gamer.',
    isAvailable: true,
    isFeatured: false,
    stock: 15
  }
];

export const INITIAL_AUCTIONS: Auction[] = [
  {
    id: 'auc-1',
    title: 'Estátua Vegeta Super Saiyajin Blue - Escala 1/8 RARA',
    description: 'Peça sensacional de colecionador, com pintura cromada e LEDs internos na base. Item de leilão exclusivo da comunidade WhatsApp Baby Games!',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600',
    currentBid: 520.00,
    minIncrement: 20.00,
    endsAt: 'Hoje às 22:00',
    status: 'active',
    bidsCount: 14
  },
  {
    id: 'auc-2',
    title: 'Lote Premium: 3 Funkos Pops Originais Marvel Zombies',
    description: 'Lote contendo Zombie Captain America, Zombie Iron Man e Zombie Deadpool. Todos lacrados na caixa com selo de autenticidade.',
    imageUrl: '/images/marvel_zombies.png',
    currentBid: 280.00,
    minIncrement: 15.00,
    endsAt: 'Amanhã às 20:00',
    status: 'active',
    bidsCount: 9
  },
  {
    id: 'auc-3',
    title: 'Funko Pop! Luffy Gear 5 - Edição Limitada Chrome',
    description: 'Leilão já encerrado com enorme engajamento de nossa comunidade. Veja um exemplo de raridade arrematada!',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600',
    currentBid: 420.00,
    minIncrement: 10.00,
    endsAt: 'Encerrado ontem',
    status: 'ended',
    bidsCount: 23
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Carlos Henrique (Kael)',
    role: 'Colecionador de Funkos (200+ peças)',
    rating: 5,
    comment: 'Os leilões no WhatsApp da Baby Games são viciantes! Já arrematei 8 Funkos raríssimos com preços inacreditáveis. O envio é mega rápido e a embalagem vem super protegida, nunca amassa a caixa.',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=carlos'
  },
  {
    id: 't-2',
    name: 'Mariana Costa',
    role: 'Fã de Anime & Naruto',
    rating: 5,
    comment: 'Eu tinha muito receio de comprar figures na internet devido às falsificações, mas a Baby Games só trabalha com produtos 100% originais. O catálogo no site facilita muito ver o que está disponível antes de chamar no Whats!',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=mariana'
  },
  {
    id: 't-3',
    name: 'Rodrigo "Gamer" Santos',
    role: 'Membro da Comunidade Baby Games',
    rating: 5,
    comment: 'Atendimento nota mil. Comprei um Gojo e chegou impecável. O suporte deles pelo WhatsApp é muito humanizado, você se sente parte de um clube de amigos geek de verdade.',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=rodrigo'
  }
];

export const INITIAL_ORDER_LOGS: OrderLog[] = [
  {
    id: 'ped-1012',
    customerName: 'Marcus Vinícius',
    address: 'Rua das Flores, 123, São Paulo, SP',
    items: [
      { productName: 'Funko Pop! Iron Man - Avengers EndGame (Glow in the Dark)', quantity: 1, price: 189.90 },
      { productName: 'Luminária de Neon LED Gamepad Control', quantity: 1, price: 129.90 }
    ],
    totalValue: 319.80,
    timestamp: 'Hoje, 15:42',
    status: 'Concluído'
  },
  {
    id: 'ped-1013',
    customerName: 'Amanda Silveira',
    address: 'Av. Paulista, 1000, Apto 50, São Paulo, SP',
    items: [
      { productName: 'Action Figure Gojo Satoru - Unlimited Void Especial', quantity: 1, price: 399.90 }
    ],
    totalValue: 399.90,
    timestamp: 'Hoje, 16:15',
    status: 'Pendente'
  },
  {
    id: 'ped-1014',
    customerName: 'Thiago Neves',
    address: 'Rua da Praia, 45, Rio de Janeiro, RJ',
    items: [
      { productName: 'Funko Pop! Mickey Mouse - Fantasia Edição 80 Anos', quantity: 2, price: 179.90 }
    ],
    totalValue: 359.80,
    timestamp: 'Ontem, 19:30',
    status: 'Concluído'
  }
];

export const MOCK_STATS = {
  totalSales: 84350.50,
  totalOrders: 312,
  activeLeiloes: 2,
  uniqueCustomers: 189,
  viewsCount: 4230
};
