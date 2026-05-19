"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  BookOpen,
  X,
  Edit2,
  Trash2,
  Tag,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Product,
  getLocalProducts,
  addLocalProduct,
  updateLocalProduct,
  deleteLocalProduct
} from "@/lib/productsStore";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua", "Sembako", "Minuman", "Snack", "Kebutuhan Harian"]);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Product Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sembako");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [sku, setSku] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Load products on mount
  useEffect(() => {
    setProducts(getLocalProducts());
    // Load categories from localStorage if present
    const savedCats = localStorage.getItem("warunghub_categories");
    if (savedCats) {
      setCategories(JSON.parse(savedCats));
    }
  }, []);

  const refreshProducts = () => {
    setProducts(getLocalProducts());
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cleanCat = newCategoryName.trim();
    if (!categories.includes(cleanCat)) {
      const updated = [...categories, cleanCat];
      setCategories(updated);
      localStorage.setItem("warunghub_categories", JSON.stringify(updated));
    }
    setNewCategoryName("");
    setIsCategoryModalOpen(false);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !cost || !stock) return;

    addLocalProduct({
      name,
      category,
      price: parseFloat(price),
      cost: parseFloat(cost),
      stock: parseInt(stock),
      unit,
      sku: sku || `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      image: imageUrl.trim() || undefined
    });

    // Reset Form
    setName("");
    setPrice("");
    setCost("");
    setStock("");
    setUnit("pcs");
    setSku("");
    setImageUrl("");
    setIsAddModalOpen(false);
    refreshProducts();
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !name || !price || !cost || !stock) return;

    updateLocalProduct({
      ...editingProduct,
      name,
      category,
      price: parseFloat(price),
      cost: parseFloat(cost),
      stock: parseInt(stock),
      unit,
      sku,
      image: imageUrl.trim() || undefined
    });

    setEditingProduct(null);
    setImageUrl("");
    setIsAddModalOpen(false);
    refreshProducts();
  };

  const handleDeleteProductClick = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini dari katalog?")) {
      deleteLocalProduct(id);
      refreshProducts();
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price.toString());
    setCost(p.cost.toString());
    setStock(p.stock.toString());
    setUnit(p.unit);
    setSku(p.sku);
    setImageUrl(p.image || "");
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setCategory(categories[1] || "Sembako");
    setPrice("");
    setCost("");
    setStock("");
    setUnit("pcs");
    setSku("");
    setImageUrl("");
    setIsAddModalOpen(true);
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedFilterCategory === "Semua" || p.category === selectedFilterCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Katalog Produk Warung
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Daftar komplit barang dagangan beserta harga jual, modal, dan perhitungan laba kotor.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold transition-all"
          >
            <Tag className="h-4 w-4 text-slate-500" />
            Kelola Kategori
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk / kode SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilterCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border",
                selectedFilterCategory === cat
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const margin = p.price - p.cost;
          const marginPct = p.price > 0 ? ((margin / p.price) * 100).toFixed(0) : "0";

          return (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div>
                {/* Product Image */}
                <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 mb-3 border border-slate-100 dark:border-zinc-800/80">
                  {p.image ? (
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-zinc-900 text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="h-8 w-8 opacity-40" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-extrabold bg-white/90 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 shadow-sm backdrop-blur-sm border border-slate-150/50">
                    {p.category}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-mono text-slate-400">SKU: {p.sku}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProductClick(p.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 leading-snug line-clamp-1">
                  {p.name}
                </h4>
              </div>

              <div className="mt-5 border-t border-slate-100 dark:border-zinc-800/80 pt-4 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Harga Modal:</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{formatPrice(p.cost)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Harga Jual:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(p.price)}</span>
                </div>
                <div className="flex justify-between text-[11px] border-t border-dashed border-slate-100 dark:border-zinc-800/50 pt-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Laba (Margin):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(margin)} ({marginPct}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 border border-slate-100 dark:border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-4">
              <BookOpen className="h-4.5 w-4.5 text-emerald-600" />
              {editingProduct ? "Edit Informasi Produk" : "Tambah Produk Baru"}
            </h3>

            <form onSubmit={editingProduct ? handleEditProductSubmit : handleAddProductSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beras Ramos 5kg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Harga Modal (Cost)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 15000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Harga Jual (Price)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 18500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 10"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Satuan Barang
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="pcs, botol, kg, pack"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Kode SKU / Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="Format: SEM-BIM-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                  URL Gambar Produk (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/gambar-produk.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  {editingProduct ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 border border-slate-100 dark:border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-4">
              <Tag className="h-4.5 w-4.5 text-emerald-600" />
              Kelola Kategori Barang
            </h3>

            <div className="space-y-4">
              {/* Existing Categories */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Kategori Aktif</span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.slice(1).map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-100 dark:border-zinc-800"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Add New Category */}
              <form onSubmit={handleAddCategory} className="border-t border-slate-100 dark:border-zinc-800/80 pt-4 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block">
                  Tambah Kategori Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Obat-obatan"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Tambah
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
