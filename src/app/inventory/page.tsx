"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  AlertTriangle,
  ArrowUpDown,
  MessageSquare,
  TrendingUp,
  Plus,
  Minus,
  CheckCircle,
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Product,
  getLocalProducts,
  saveLocalProducts,
  adjustLocalStock
} from "@/lib/productsStore";
import { logAudit } from "@/lib/auditStore";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Semua");

  // Load products on mount
  useEffect(() => {
    setProducts(getLocalProducts());
  }, []);

  const refreshProducts = () => {
    setProducts(getLocalProducts());
  };

  const handleStockAdjust = (id: number, amount: number) => {
    const target = products.find(p => p.id === id);
    adjustLocalStock(id, amount);
    if (target) {
      logAudit("STOCK_ADJUST", `Penyesuaian stok ${target.name} (${amount > 0 ? "+" : ""}${amount} ${target.unit})`);
    }
    refreshProducts();
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // 1. Filtered products for the main table
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "Semua" ||
      (selectedFilter === "Stok Kritis" && p.stock <= 2) ||
      (selectedFilter === "Biasa" && p.stock > 2);
    return matchesSearch && matchesFilter;
  });

  // 2. Metrics Calculations
  const totalItems = products.length;
  const totalAssetValue = products.reduce((acc, p) => acc + p.cost * p.stock, 0);
  const totalEstProfit = products.reduce((acc, p) => acc + (p.price - p.cost) * p.stock, 0);

  // 3. Smart Restock Alerts (Stock <= 2)
  const restockNeededProducts = products.filter((p) => p.stock <= 2);

  // 4. Products Almost Out (sorted by lowest stock)
  const lowStockProducts = [...products]
    .filter((p) => p.stock <= 2)
    .sort((a, b) => a.stock - b.stock);

  // 5. Best Sellers (sorted by soldCount)
  const bestSellers = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 3);

  // 6. Handle Smart Restock WhatsApp Message to Supplier
  const handleSendRestockWA = () => {
    if (restockNeededProducts.length === 0) return;
    const supplierPhone = "081299887766"; // Simulated supplier contact
    let text = `*PESANAN RESTOCK BARANG - Warung Berkah Jaya*\n\nHalo Agen/Supplier,\nKami ingin memesan barang-barang berikut yang stoknya sudah menipis:\n\n`;
    restockNeededProducts.forEach((p, idx) => {
      // Recommend restock quantity: Restock to 10 pcs or 2 bags
      const recommendedQty = p.unit === "karung" ? 5 : 20;
      text += `${idx + 1}. *${p.name}* - Jumlah: ${recommendedQty} ${p.unit}\n`;
    });
    text += `\nMohon diinfokan total harga belanjaannya ya. Terima kasih! 🙏`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${supplierPhone}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Stok & Inventori Barang
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Manajemen stok secara cepat, restock otomatis, serta ringkasan aset modal warung Anda.
          </p>
        </div>
      </div>

      {/* Inventory Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Jenis Produk</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{totalItems} Items</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-850 text-slate-600 dark:text-zinc-300">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Nilai Aset Modal</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{formatPrice(totalAssetValue)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <ArrowUpDown className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Estimasi Profit Aset</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{formatPrice(totalEstProfit)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Smart Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Restock Alert */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-amber-500" />
              Smart Restock Alert
            </h3>
            {restockNeededProducts.length > 0 && (
              <button
                onClick={handleSendRestockWA}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-sm"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Kulakan via WA
              </button>
            )}
          </div>

          {restockNeededProducts.length > 0 ? (
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 text-xs space-y-2">
              <p className="font-semibold text-amber-800 dark:text-amber-400">
                Ada {restockNeededProducts.length} barang dengan stok kritis (di bawah 2 pcs):
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-zinc-300 font-medium">
                {restockNeededProducts.map((p) => (
                  <li key={p.id}>
                    {p.name} (Stok: <span className="font-bold text-rose-600 dark:text-rose-400">{p.stock} {p.unit}</span>)
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-400 flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4" />
              Semua stok aman! Tidak ada produk yang di bawah batas kritis.
            </div>
          )}
        </div>

        {/* Best Selling Products */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
            Produk Paling Laku (Best Sellers)
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {bestSellers.map((p, idx) => (
              <div key={p.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{p.name}</h4>
                    <span className="text-[9px] text-slate-400">{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {p.soldCount} Terjual
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Daftar Inventori Barang
          </h3>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["Semua", "Stok Kritis", "Biasa"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border",
                    selectedFilter === filter
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-zinc-800/40 text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama Produk</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Modal</th>
                  <th className="py-3.5 px-4 text-right">Jual</th>
                  <th className="py-3.5 px-4 text-center">Quick Adjust</th>
                  <th className="py-3.5 px-4 text-center">Total Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= 2;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/10">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium">
                        {formatPrice(p.cost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium">
                        {formatPrice(p.price)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleStockAdjust(p.id, -1)}
                            className="p-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                            title="Kurang Stok"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleStockAdjust(p.id, 1)}
                            className="p-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                            title="Tambah Stok"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={cn(
                          "font-bold px-2 py-0.5 rounded-full text-[10px]",
                          isLow
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        )}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
