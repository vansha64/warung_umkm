"use client";

import { Product } from "./productsStore";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = "Lunas" | "Hutang" | "Draf";

export interface Order {
  id: string; // e.g., WH-1050
  customerName: string;
  items: CartItem[];
  total: number;
  date: string;
  time: string;
  status: OrderStatus;
}

const STORAGE_KEY = "warunghub_orders";

// Mock initial order history if empty
const generateMockOrders = (): Order[] => [
  {
    id: "WH-1049",
    customerName: "Umum",
    items: [], // We'll leave mock items empty or basic, real ones will have products
    total: 124000,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    time: "19:15",
    status: "Lunas"
  },
  {
    id: "WH-1048",
    customerName: "Pak Budi",
    items: [],
    total: 85000,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    time: "17:10",
    status: "Hutang"
  }
];

export function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const mocks = generateMockOrders();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mocks));
    return mocks;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveLocalOrders(orders: Order[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
}

export function addLocalOrder(orderData: Omit<Order, "id" | "date" | "time">): Order {
  const orders = getLocalOrders();
  
  // Generate ID based on previous max or random
  const lastIdNum = orders.length > 0 
    ? parseInt(orders[0].id.replace("WH-", "")) 
    : 1049;
  
  const newOrder: Order = {
    ...orderData,
    id: `WH-${lastIdNum + 1}`,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  };
  
  const updated = [newOrder, ...orders];
  saveLocalOrders(updated);
  return newOrder;
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const orders = getLocalOrders();
  const updated = orders.map(o => 
    o.id === orderId ? { ...o, status: newStatus } : o
  );
  saveLocalOrders(updated);
}

export function deleteLocalOrder(orderId: string) {
  const orders = getLocalOrders();
  const updated = orders.filter(o => o.id !== orderId);
  saveLocalOrders(updated);
}
