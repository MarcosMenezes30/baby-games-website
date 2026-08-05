import { supabase } from './supabase';
import { Product, Auction, OrderLog } from '../types';

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    theme: row.theme,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    imageUrl: row.image_url,
    description: row.description,
    isAvailable: row.is_available,
    isFeatured: row.is_featured,
    stock: row.stock,
  }));
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      category: product.category,
      theme: product.theme,
      price: product.price,
      original_price: product.originalPrice ?? null,
      image_url: product.imageUrl,
      description: product.description,
      is_available: product.isAvailable,
      is_featured: product.isFeatured,
      stock: product.stock,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    theme: data.theme,
    price: Number(data.price),
    originalPrice: data.original_price ? Number(data.original_price) : undefined,
    imageUrl: data.image_url,
    description: data.description,
    isAvailable: data.is_available,
    isFeatured: data.is_featured,
    stock: data.stock,
  };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if ('originalPrice' in updates) dbUpdates.original_price = updates.originalPrice ?? null;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
  if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
  if (updates.stock !== undefined) dbUpdates.stock = updates.stock;

  const { error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── AUCTIONS ────────────────────────────────────────────────────────────────

export async function fetchAuctions(): Promise<Auction[]> {
  const { data, error } = await supabase
    .from('auctions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    currentBid: Number(row.current_bid),
    minIncrement: Number(row.min_increment),
    endsAt: row.ends_at,
    status: row.status,
    bidsCount: row.bids_count,
  }));
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<OrderLog[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    customerName: row.customer_name,
    address: row.address,
    phone: row.phone,
    items: (row.order_items || []).map((it: { product_name: string; quantity: number; price: number }) => ({
      productName: it.product_name,
      quantity: it.quantity,
      price: Number(it.price),
    })),
    totalValue: Number(row.total_value),
    timestamp: row.timestamp,
    status: row.status,
  }));
}

export async function createOrder(order: OrderLog): Promise<void> {
  // Insert order
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: order.id,
      customer_name: order.customerName,
      address: order.address,
      total_value: order.totalValue,
      status: order.status,
      timestamp: order.timestamp,
      phone: order.phone ?? null,
    });

  if (orderError) throw orderError;

  // Insert order items
  if (order.items && order.items.length > 0) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        order.items.map(item => ({
          order_id: order.id,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
        }))
      );

    if (itemsError) throw itemsError;
  }
}

export async function updateOrderStatus(id: string, status: 'Pendente' | 'Concluído' | 'Cancelado'): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}
