import { supabase } from './supabase';
import { Product, Auction, OrderLog, AdminDevice } from '../types';
import { getLocalDevicesList, saveLocalDevicesList, saveCurrentDeviceId, clearCurrentDeviceId, getCurrentDeviceId } from './device';

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
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn(`[deleteProduct] Supabase notice for id "${id}":`, error);
    }
  } catch (err) {
    console.warn(`[deleteProduct] Could not delete product "${id}" from Supabase:`, err);
  }
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

export async function createAuction(auction: Omit<Auction, 'id'>): Promise<Auction> {
  const { data, error } = await supabase
    .from('auctions')
    .insert({
      title: auction.title,
      description: auction.description,
      image_url: auction.imageUrl,
      current_bid: auction.currentBid,
      min_increment: auction.minIncrement,
      ends_at: auction.endsAt,
      status: auction.status,
      bids_count: auction.bidsCount,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url,
    currentBid: Number(data.current_bid),
    minIncrement: Number(data.min_increment),
    endsAt: data.ends_at,
    status: data.status,
    bidsCount: data.bids_count,
  };
}

export async function updateAuction(id: string, updates: Partial<Auction>): Promise<void> {
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  if (!isUuid) return;

  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.currentBid !== undefined) dbUpdates.current_bid = updates.currentBid;
  if (updates.minIncrement !== undefined) dbUpdates.min_increment = updates.minIncrement;
  if (updates.endsAt !== undefined) dbUpdates.ends_at = updates.endsAt;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.bidsCount !== undefined) dbUpdates.bids_count = updates.bidsCount;

  const { error } = await supabase
    .from('auctions')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAuction(id: string): Promise<void> {
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  if (!isUuid) {
    // ID mock/local não existe na tabela UUID do Supabase
    return;
  }

  try {
    const { error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn(`[deleteAuction] Supabase notice for id "${id}":`, error);
    }
  } catch (err) {
    console.warn(`[deleteAuction] Could not delete auction "${id}" from Supabase:`, err);
  }
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

// ─── ADMIN CONNECTED DEVICES ──────────────────────────────────────────────────

export async function fetchAdminDevices(): Promise<AdminDevice[]> {
  try {
    const { data, error } = await supabase
      .from('admin_devices')
      .select('*')
      .order('last_active_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: AdminDevice[] = data.map(row => ({
        id: row.id,
        userName: row.user_name,
        deviceName: row.device_name,
        deviceType: (row.device_type as AdminDevice['deviceType']) || 'desktop',
        browser: row.browser || 'Navegador Web',
        os: row.os || 'Outro',
        lastActiveAt: row.last_active_at || new Date().toISOString(),
        createdAt: row.created_at || new Date().toISOString(),
      }));
      saveLocalDevicesList(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('[fetchAdminDevices] Using local fallback:', err);
  }

  return getLocalDevicesList();
}

export async function registerAdminDevice(device: AdminDevice): Promise<AdminDevice> {
  const localList = getLocalDevicesList();
  const existingIdx = localList.findIndex(d => d.id === device.id);
  const updatedList = existingIdx >= 0
    ? localList.map(d => (d.id === device.id ? { ...d, ...device, lastActiveAt: new Date().toISOString() } : d))
    : [device, ...localList];

  saveLocalDevicesList(updatedList);
  saveCurrentDeviceId(device.id);

  try {
    const { data, error } = await supabase
      .from('admin_devices')
      .upsert({
        id: device.id,
        user_name: device.userName,
        device_name: device.deviceName,
        device_type: device.deviceType,
        browser: device.browser,
        os: device.os,
        last_active_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        userName: data.user_name,
        deviceName: data.device_name,
        deviceType: data.device_type,
        browser: data.browser,
        os: data.os,
        lastActiveAt: data.last_active_at,
        createdAt: data.created_at,
      };
    }
  } catch (err) {
    console.warn('[registerAdminDevice] Saved to local storage:', err);
  }

  return device;
}

export async function updateAdminDeviceLastActive(id: string): Promise<void> {
  const localList = getLocalDevicesList();
  const updated = localList.map(d => (d.id === id ? { ...d, lastActiveAt: new Date().toISOString() } : d));
  saveLocalDevicesList(updated);

  try {
    await supabase
      .from('admin_devices')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', id);
  } catch {
    // Ignore offline errors
  }
}

export async function revokeAdminDevice(id: string): Promise<void> {
  const localList = getLocalDevicesList().filter(d => d.id !== id);
  saveLocalDevicesList(localList);

  if (getCurrentDeviceId() === id) {
    clearCurrentDeviceId();
  }

  try {
    await supabase
      .from('admin_devices')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn('[revokeAdminDevice] Removed from local storage:', err);
  }
}
