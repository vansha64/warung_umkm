"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Send,
  User,
  CheckCircle2,
  Heart,
  X,
  ChevronUp,
  Zap,
  HelpCircle,
  Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Product,
  getLocalProducts,
  adjustLocalStock
} from "@/lib/productsStore";
import { addLocalOrder } from "@/lib/ordersStore";
import { logAudit } from "@/lib/auditStore";
import { printReceipt, generateReceiptHtml } from "@/lib/printUtils";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua", "Favorit", "Sembako", "Minuman", "Snack", "Kebutuhan Harian"]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Quick cashier mode (barcode scanner / fast keyboard input simulation)
  const [isQuickMode, setIsQuickMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProducts(getLocalProducts());
    
    // Load categories
    const savedCats = localStorage.getItem("warunghub_categories");
    if (savedCats) {
      const parsedCats = JSON.parse(savedCats);
      setCategories(["Semua", "Favorit", ...parsedCats.filter((c: string) => c !== "Semua")]);
    }

    // Load favorites
    const savedFavs = localStorage.getItem("warunghub_favorites");
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }

    // Check for Repeat Order auto-fill
    const repeatCartStr = localStorage.getItem("warunghub_repeat_cart");
    if (repeatCartStr) {
      try {
        const repeatCart = JSON.parse(repeatCartStr);
        setCart(repeatCart);
        localStorage.removeItem("warunghub_repeat_cart");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const refreshProducts = () => {
    setProducts(getLocalProducts());
  };

  const toggleFavorite = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem("warunghub_favorites", JSON.stringify(updated));
      return updated;
    });
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === "Favorit") {
      return favorites.includes(p.id) && matchesSearch;
    }
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;
    
    if (product.stock <= currentQtyInCart) {
      alert(`Stok untuk ${product.name} habis! Sisa stok real: ${product.stock}`);
      return;
    }

    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Handle Quick cashier mode input (pressing Enter on search input)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isQuickMode) {
      // Find exact SKU match first
      let match = products.find(p => p.sku.toLowerCase() === searchQuery.toLowerCase());
      
      // If no exact SKU match, find if there is exactly 1 search result in current list
      if (!match && filteredProducts.length === 1) {
        match = filteredProducts[0];
      }

      if (match) {
        addToCart(match);
        setSearchQuery(""); // Clear search input
        e.preventDefault();
      } else {
        alert("Produk tidak ditemukan atau ketik SKU yang lebih spesifik!");
      }
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;

      const newQty = existing.quantity + delta;
      
      if (delta > 0 && product.stock < newQty) {
        alert(`Batas stok terlampaui! Sisa stok: ${product.stock}`);
        return prev;
      }

      return prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: newQty } : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal;
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const processTransaction = (finalCustomerName: string) => {
    // 1. Save to Order History
    addLocalOrder({
      customerName: finalCustomerName,
      items: cart,
      total,
      status: "Hutang"
    });
    
    // Log audit
    logAudit("CHECKOUT", `Penjualan kasir ke pelanggan ${finalCustomerName} senilai ${formatPrice(total)}`);
    
    // 2. Deduct stock in local database
    cart.forEach(item => {
      adjustLocalStock(item.product.id, -item.quantity);
    });

    // 3. Add transaction to finance history
    const savedFinances = localStorage.getItem("warunghub_finances");
    const currentFinances = savedFinances ? JSON.parse(savedFinances) : [];
    const newTransaction = {
      id: Math.random(),
      title: `Penjualan via Kasir - ${finalCustomerName}`,
      type: "in",
      category: "Penjualan",
      amount: total,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    localStorage.setItem("warunghub_finances", JSON.stringify([newTransaction, ...currentFinances]));
  };

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;
    const finalCustomerName = customerName.trim() || "Umum";
    
    processTransaction(finalCustomerName);

    // 4. Professional WhatsApp checkout message
    const storeName = "Warung Berkah Jaya";
    let text = `🏪 *NOTA PESANAN - ${storeName}* 🏪\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 Pelanggan : *${finalCustomerName}*\n`;
    text += `📅 Tanggal   : ${new Date().toLocaleDateString("id-ID")}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `🛍️ *Rincian Belanja:*\n`;
    cart.forEach((item, index) => {
      text += `*${index + 1}. ${item.product.name}*\n`;
      text += `   ${item.quantity} ${item.product.unit} x ${formatPrice(item.product.price)} = *${formatPrice(item.product.price * item.quantity)}*\n`;
    });
    
    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *TOTAL TAGIHAN : ${formatPrice(total)}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `💳 *Instruksi Pembayaran:*\n`;
    text += `Bisa bayar tunai di warung, atau transfer via QRIS / Rekening:\n`;
    text += `BCA: 1234567890 a.n Ibu Sri\n\n`;
    text += `Terima kasih sudah berbelanja! Semoga harinya menyenangkan. 🙏✨`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    window.open(whatsappUrl, "_blank");
    completeCheckoutUI();
  };

  const handleCheckoutPrint = () => {
    if (cart.length === 0) return;
    setShowPrintPreview(true);
  };

  const confirmPrintCheckout = () => {
    const finalCustomerName = customerName.trim() || "Umum";
    
    processTransaction(finalCustomerName);

    // Print receipt
    printReceipt("Warung Berkah Jaya", finalCustomerName, cart, total);

    setShowPrintPreview(false);
    completeCheckoutUI();
  };

  const completeCheckoutUI = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setCart([]);
      setCustomerName("");
      setIsMobileCartOpen(false);
      refreshProducts();
    }, 3000);
  };

  // Shared Cart Content Component
  const CartContent = () => (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4.5 w-4.5 text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Nota Belanja
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-semibold bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
          {totalItems} item
        </span>
      </div>

      <div className="mt-3 flex-shrink-0 relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Nama Pelanggan (Umum)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-thin">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-full text-slate-300 dark:text-zinc-700 mb-3">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">Keranjang Kosong</p>
            <p className="text-[10px] text-slate-400 mt-1">Pilih barang untuk mulai transaksi</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="flex justify-between items-center bg-slate-50/70 dark:bg-zinc-950/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-900 shadow-sm">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.product.name}
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white active:bg-slate-100"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-1 text-xs font-bold text-slate-900 dark:text-white min-w-[24px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white active:bg-slate-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 flex-shrink-0 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Subtotal</span>
          <span className="font-bold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">Total</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{formatPrice(total)}</span>
        </div>

        <AnimatePresence mode="wait">
          {checkoutSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 text-sm font-bold"
            >
              <CheckCircle2 className="h-5 w-5" />
              Pesanan Berhasil!
            </motion.div>
          ) : (
            <div className="flex gap-2 w-full">
              <button
                onClick={handleCheckoutPrint}
                disabled={cart.length === 0}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-[0.98]",
                  cart.length === 0
                    ? "bg-slate-300 dark:bg-zinc-800 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-slate-800 hover:bg-slate-900 shadow-slate-900/20 cursor-pointer"
                )}
                title="Cetak Struk"
              >
                <Printer className="h-4.5 w-4.5" />
                Cetak
              </button>
              <button
                onClick={handleCheckoutWhatsApp}
                disabled={cart.length === 0}
                className={cn(
                  "flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-[0.98]",
                  cart.length === 0
                    ? "bg-slate-300 dark:bg-zinc-800 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 cursor-pointer"
                )}
                title="Kirim Nota via WA"
              >
                <Send className="h-4.5 w-4.5" />
                Kirim via WA
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  return (
    <div className="relative h-[calc(100vh-8.5rem)] md:h-[calc(100vh-10rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Products & Filters */}
        <div className="lg:col-span-2 flex flex-col space-y-4 h-full overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Kasir Penjualan POS
            </h3>
            
            {/* Quick Cashier Mode Toggle */}
            <button
              onClick={() => {
                setIsQuickMode(!isQuickMode);
                // Auto focus on search input
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-extrabold border uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                isQuickMode 
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm" 
                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800"
              )}
            >
              <Zap className={cn("h-3.5 w-3.5", isQuickMode ? "fill-white animate-pulse" : "text-amber-500")} />
              Mode Kasir Cepat {isQuickMode ? "Aktif" : "Nonaktif"}
            </button>
          </div>

          <div className="space-y-3 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={isQuickMode ? "Ketik SKU / scan barcode lalu ketuk [Enter]..." : "Cari produk warung..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
              />
              {isQuickMode && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/30 flex items-center gap-0.5">
                  <span>Enter to Add</span>
                </div>
              )}
            </div>

            {/* Quick Mode Tips */}
            {isQuickMode && (
              <div className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 px-3.5 py-2 rounded-xl border border-amber-100 dark:border-amber-900/20 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                <span>*Tips: Ketika mode kasir cepat aktif, mengetik kode SKU barang lalu menekan <strong>Enter</strong> akan langsung memasukannya ke keranjang belanja.*</span>
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {categories.map((cat) => {
                const isFav = cat === "Favorit";
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm active:scale-95",
                      selectedCategory === cat
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50"
                    )}
                  >
                    {isFav && <Heart className={cn("h-3.5 w-3.5", selectedCategory === cat ? "fill-white" : "text-rose-500 fill-rose-500/20")} />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 pb-20 lg:pb-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((p) => {
                const cartQty = cart.find((item) => item.product.id === p.id)?.quantity || 0;
                const isLowStock = p.stock <= 2;
                const isFav = favorites.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="group relative flex flex-col justify-between p-3.5 md:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 hover:border-emerald-500/50 hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 select-none"
                  >
                    <button 
                      onClick={(e) => toggleFavorite(e, p.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-50/50 dark:bg-zinc-800/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors z-10"
                    >
                      <Heart className={cn("h-4 w-4 transition-colors", isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-500")} />
                    </button>

                    {/* Product Image */}
                    <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 mb-3 border border-slate-100 dark:border-zinc-800/80">
                      {p.image ? (
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-zinc-900 text-emerald-600 dark:text-emerald-400">
                          <ShoppingCart className="h-6 w-6 opacity-40" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/90 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 shadow-sm backdrop-blur-sm border border-slate-150/50">
                        {p.category}
                      </span>
                    </div>

                    <div className="pt-0">
                      <h5 className="text-xs md:text-sm font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 transition-colors line-clamp-1 leading-tight">
                        {p.name}
                      </h5>
                      <span className="text-[8px] font-mono text-slate-400 mt-0.5 block">SKU: {p.sku}</span>
                    </div>

                    <div className="mt-4 md:mt-5">
                      <p className="text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tight">
                        {formatPrice(p.price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                          isLowStock ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        )}>
                          Sisa: {p.stock}
                        </span>
                        {cartQty > 0 && (
                          <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-emerald-600/30 animate-in zoom-in">
                            {cartQty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Cart */}
        <div className="hidden lg:flex lg:col-span-1 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-3xl p-5 flex-col h-full shadow-lg">
          <CartContent />
        </div>
      </div>

      {/* Mobile Cart Floating Action Button */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className={cn(
            "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl shadow-xl transition-all",
            cart.length > 0 
              ? "bg-emerald-600 text-white shadow-emerald-600/20" 
              : "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-slate-900/10"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-sm font-bold">
              {cart.length > 0 ? "Lihat Keranjang" : "Keranjang Kosong"}
            </span>
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">{formatPrice(total)}</span>
              <ChevronUp className="h-4 w-4 opacity-70" />
            </div>
          )}
        </button>
      </div>

      {/* Mobile Cart Bottom Sheet */}
      <AnimatePresence>
        {isMobileCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col h-[85vh]"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full" />
              </div>
              <div className="flex justify-between items-center px-5 py-2 shrink-0">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Keranjang</h3>
                <button 
                  onClick={() => setIsMobileCartOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col px-5 pb-5">
                <CartContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {showPrintPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Preview Struk
                </h3>
                <button 
                  onClick={() => setShowPrintPreview(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden p-4 bg-slate-50 dark:bg-zinc-950 flex justify-center">
                <div className="bg-white shadow-sm border border-slate-200 w-[58mm] h-full overflow-y-auto overflow-x-hidden">
                  <iframe 
                    title="Print Preview"
                    srcDoc={generateReceiptHtml("Warung Berkah Jaya", customerName.trim() || "Umum", cart, total, undefined, undefined, undefined, false)}
                    className="w-[58mm] h-[400px] border-none scale-90 origin-top"
                  />
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
                <p className="text-[10px] text-slate-500 text-center mb-3">Tekan Konfirmasi & Cetak untuk menyelesaikan transaksi.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrintPreview(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmPrintCheckout}
                    className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs flex justify-center items-center gap-1.5 shadow-md transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Selesaikan & Cetak
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
