"use client";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  sku: string;
  soldCount: number;
  image?: string;
}

const defaultProducts: Product[] = [
  { id: 1, name: "Minyak Goreng Bimoli 1L", category: "Sembako", price: 18500, cost: 15000, stock: 2, unit: "pcs", sku: "SEM-BIM-01", soldCount: 45, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80" },
  { id: 2, name: "Beras Ramos Cianjur 5kg", category: "Sembako", price: 68000, cost: 58000, stock: 1, unit: "karung", sku: "SEM-RAM-02", soldCount: 12, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80" },
  { id: 3, name: "Gula Pasir Gulaku 1kg", category: "Sembako", price: 16500, cost: 14000, stock: 4, unit: "pcs", sku: "SEM-GUL-05", soldCount: 28, image: "https://images.unsplash.com/photo-1581781870027-04212e231e96?w=200&q=80" },
  { id: 4, name: "Telur Ayam Negeri (1kg)", category: "Sembako", price: 28000, cost: 24500, stock: 10, unit: "kg", sku: "SEM-TEL-08", soldCount: 34, image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200&q=80" },
  { id: 5, name: "Teh Pucuk Harum 350ml", category: "Minuman", price: 4000, cost: 3200, stock: 45, unit: "botol", sku: "MIN-PUC-04", soldCount: 82, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&q=80" },
  { id: 6, name: "Kopi Kapal Api Mix", category: "Minuman", price: 2000, cost: 1650, stock: 80, unit: "sachet", sku: "MIN-KAP-06", soldCount: 150, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80" },
  { id: 7, name: "Chiki Taro Net", category: "Snack", price: 3500, cost: 2800, stock: 22, unit: "pcs", sku: "SNA-TAR-07", soldCount: 60, image: "https://images.unsplash.com/photo-1599490659213-e2b9527b0876?w=200&q=80" },
  { id: 8, name: "Indomie Goreng", category: "Snack", price: 3500, cost: 2800, stock: 120, unit: "pcs", sku: "SNA-IND-03", soldCount: 310, image: "https://images.unsplash.com/photo-1612966608967-302fc3ba8941?w=200&q=80" },
  { id: 9, name: "Sabun Cuci Mama Lemon", category: "Kebutuhan Harian", price: 8000, cost: 6500, stock: 15, unit: "pcs", sku: "HAR-MAM-09", soldCount: 18, image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&q=80" },
  { id: 10, name: "Pewangi Downy Sachet", category: "Kebutuhan Harian", price: 1000, cost: 800, stock: 5, unit: "pcs", sku: "HAR-DOW-10", soldCount: 95, image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=200&q=80" }
];

const STORAGE_KEY = "warunghub_products";

export function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return defaultProducts;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultProducts;
  }
}

export function saveLocalProducts(products: Product[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
}

export function addLocalProduct(product: Omit<Product, "id" | "soldCount">): Product {
  const products = getLocalProducts();
  const newProduct: Product = {
    ...product,
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    soldCount: 0
  };
  const updated = [newProduct, ...products];
  saveLocalProducts(updated);
  return newProduct;
}

export function updateLocalProduct(updatedProduct: Product) {
  const products = getLocalProducts();
  const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
  saveLocalProducts(updated);
}

export function deleteLocalProduct(id: number) {
  const products = getLocalProducts();
  const updated = products.filter(p => p.id !== id);
  saveLocalProducts(updated);
}

export function adjustLocalStock(id: number, amount: number): Product | undefined {
  const products = getLocalProducts();
  let updatedProduct: Product | undefined;
  
  const updated = products.map(p => {
    if (p.id === id) {
      const newStock = Math.max(0, p.stock + amount);
      updatedProduct = { ...p, stock: newStock };
      return updatedProduct;
    }
    return p;
  });
  
  saveLocalProducts(updated);
  return updatedProduct;
}
