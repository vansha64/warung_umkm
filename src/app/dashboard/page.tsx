"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  UserCheck,
  TrendingDown,
  ChevronRight,
  Calendar,
  Wallet,
  Clock,
  Sparkles,
  BookOpen,
  Send,
  X,
  Store
} from "lucide-react";
import Link from "next/link";
import { getLocalProducts, Product } from "@/lib/productsStore";
import { getLocalOrders, Order } from "@/lib/ordersStore";
import {
  getLocalTransactions,
  getLocalHutang,
  getLocalPiutang,
  Transaction,
  HutangSupplier,
  PiutangPelanggan
} from "@/lib/financeStore";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
} as const;

export default function DashboardPage() {
  const ownerName = "Bu Sri";
  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hutangList, setHutangList] = useState<HutangSupplier[]>([]);
  const [piutangList, setPiutangList] = useState<PiutangPelanggan[]>([]);

  // Daily Closing Modal state
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  useEffect(() => {
    setProducts(getLocalProducts());
    setOrders(getLocalOrders());
    setTransactions(getLocalTransactions());
    setHutangList(getLocalHutang());
    setPiutangList(getLocalPiutang());
  }, []);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const todayDateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  
  // 1. Sales & Transactions Today
  const todayOrders = orders.filter((o) => o.date === todayDateStr);
  const totalSalesToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const transactionCountToday = todayOrders.length;

  // 2. Daily Profit (Calculated from sales cost vs price)
  const dailyProfitToday = todayOrders.reduce((sum, o) => {
    const orderProfit = o.items ? o.items.reduce((itemSum, item) => {
      const margin = item.product.price - item.product.cost;
      return itemSum + margin * item.quantity;
    }, 0) : 0;
    return sum + orderProfit;
  }, 0);

  // 3. Cash balance
  const totalIn = transactions.filter((t) => t.type === "in").reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === "out").reduce((sum, t) => sum + t.amount, 0);
  const cashBalance = totalIn - totalOut;

  // 4. Receivables (Piutang)
  const unpaidPiutangTotal = piutangList.filter((p) => p.status === "Belum Lunas").reduce((sum, p) => sum + p.amount, 0);
  const unpaidHutangTotal = hutangList.filter((h) => h.status === "Belum Lunas").reduce((sum, h) => sum + h.amount, 0);

  // 5. Smart UMKM Analytics: Peak Sales Time Calculation
  const getPeakSalesTime = () => {
    if (orders.length === 0) return "Sore Hari (15:00 - 18:00)";
    let morning = 0; // 06 - 11
    let afternoon = 0; // 12 - 14
    let evening = 0; // 15 - 17
    let night = 0; // 18 - 23

    orders.forEach((o) => {
      if (!o.time) return;
      const hour = parseInt(o.time.split(":")[0]);
      if (hour >= 6 && hour < 12) morning++;
      else if (hour >= 12 && hour < 15) afternoon++;
      else if (hour >= 15 && hour < 18) evening++;
      else night++;
    });

    const max = Math.max(morning, afternoon, evening, night);
    if (max === morning) return "Pagi Hari (06:00 - 12:00)";
    if (max === afternoon) return "Siang Hari (12:00 - 15:00)";
    if (max === evening) return "Sore Hari (15:00 - 18:00)";
    return "Malam Hari (18:00 - 24:00)";
  };

  const peakSalesTime = getPeakSalesTime();

  // 6. Smart UMKM Analytics: Customer Langganan (Top Customer)
  const getTopCustomer = () => {
    const customerCounts: Record<string, number> = {};
    orders.forEach((o) => {
      const name = o.customerName || "Umum";
      if (name === "Umum") return;
      customerCounts[name] = (customerCounts[name] || 0) + 1;
    });

    const sorted = Object.entries(customerCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? `${sorted[0][0]} (${sorted[0][1]}x Order)` : "Pak Budi (2x Order)";
  };

  const topCustomer = getTopCustomer();

  // 7. Dynamic AI Insight / Recommendations
  const getAIRecommendation = () => {
    const criticallyLow = products.filter(p => p.stock <= 2);
    if (criticallyLow.length > 0) {
      const p = criticallyLow[0];
      return `Restock ${p.name} segera. Barang ini berstok kritis (${p.stock} sisa) sedangkan tingkat permintaan pelanggan tinggi.`;
    }
    return "Semua stok produk utama aman. Pertahankan penjualan dengan mempromosikan kategori Snack di sore hari.";
  };

  const aiRecommendation = getAIRecommendation();

  // Stats Card data
  const stats = [
    {
      title: "Penjualan Hari Ini",
      value: formatPrice(totalSalesToday),
      desc: `${transactionCountToday} Nota belanja`,
      icon: TrendingUp,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Laba Bersih Hari Ini",
      value: formatPrice(dailyProfitToday),
      desc: "Estimasi laba bersih",
      icon: Wallet,
      iconBg: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Saldo Kas Bersih",
      value: formatPrice(cashBalance),
      desc: "Uang tunai di buku kas",
      icon: ArrowUpRight,
      iconBg: "bg-violet-50 dark:bg-violet-950/30",
      iconColor: "text-violet-600 dark:text-violet-400"
    },
    {
      title: "Bon Pelanggan (Piutang)",
      value: formatPrice(unpaidPiutangTotal),
      desc: "Belum tertagih",
      icon: UserCheck,
      iconBg: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400"
    }
  ];

  const quickActions = [
    { name: "POS / Kasir Baru", desc: "Mulai transaksi baru", href: "/pos", icon: ShoppingCart, color: "bg-emerald-600 shadow-emerald-600/20" },
    { name: "Katalog Produk", desc: "Atur harga modal & jual", href: "/catalog", icon: Plus, color: "bg-blue-600 shadow-blue-600/20" },
    { name: "Catat Pengeluaran", desc: "Input biaya operasional", href: "/finance", icon: TrendingDown, color: "bg-rose-600 shadow-rose-600/20" },
    { name: "Buku Kas & Hutang", desc: "Catatan hutang piutang", href: "/finance", icon: FileText, color: "bg-amber-600 shadow-amber-600/20" }
  ];

  // Critical Low Stock Items
  const lowStockItems = products.filter((p) => p.stock <= 2).slice(0, 3);

  // Due Soon debts alerts
  const upcomingDebts = hutangList.filter((h) => h.status === "Belum Lunas").slice(0, 2);

  // Daily Closing WhatsApp text generator
  const handleSendClosingReport = () => {
    const storeName = "Warung Berkah Jaya";
    let text = `📝 *LAPORAN TUTUP BUKU HARIAN - ${storeName}* 📝\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📅 Tanggal     : ${todayDateStr}\n`;
    text += `👤 Penanggung  : ${ownerName}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `💰 *RINGKASAN KEUANGAN:*\n`;
    text += `• Total Omset    : *${formatPrice(totalSalesToday)}*\n`;
    text += `• Laba Bersih    : *${formatPrice(dailyProfitToday)}*\n`;
    text += `• Transaksi      : *${transactionCountToday} Nota*\n`;
    text += `• Sisa Kas Aktif : *${formatPrice(cashBalance)}*\n`;
    text += `• Piutang Bon    : *${formatPrice(unpaidPiutangTotal)}*\n`;
    text += `• Hutang Supplier: *${formatPrice(unpaidHutangTotal)}*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💡 Laporan tutup buku harian ini digenerate secara otomatis oleh *WarungHub* OS.`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20 md:pb-0"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Selamat Pagi, {ownerName}! 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {dateStr} &bull; Dasbor operasional digital WarungHub terpantau aktif.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsClosingModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-all cursor-pointer active:scale-95"
          >
            <Store className="h-4 w-4" />
            Tutup Buku Harian
          </button>
        </div>
      </motion.div>

      {/* Due Alerts Section */}
      {upcomingDebts.length > 0 && (
        <motion.div variants={itemVariants} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-amber-800 dark:text-amber-400">Peringatan Jatuh Tempo Hutang Supplier!</p>
            <p className="text-amber-700 dark:text-amber-400/80 mt-0.5">
              Anda memiliki tagihan supplier belum lunas sebesar <span className="font-bold">{formatPrice(unpaidHutangTotal)}</span>. 
              Segera selesaikan tagihan sebelum melewati tanggal kesepakatan agen.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                  <Icon className={`h-4.5 w-4.5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {stat.value}
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                  {stat.desc}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Smart Dashboard Insights Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peak Hours Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Jam Paling Ramai (Peak Time)</span>
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{peakSalesTime}</span>
          </div>
        </div>

        {/* Loyal Customer Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Pelanggan Terloyal</span>
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{topCustomer}</span>
          </div>
        </div>

        {/* AI Recommendation / Recommendation Section */}
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase block">Rekomendasi Cerdas</span>
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400/80 mt-0.5 leading-snug">{aiRecommendation}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Grid */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-400 uppercase tracking-wider">
          Akses Cepat Operasional
        </h4>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                href={action.href}
                className="group p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/65 dark:border-zinc-800 hover:border-emerald-500/40 transition-all duration-200 text-left hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between min-h-[110px] shadow-sm"
              >
                <div className={`p-2.5 rounded-xl w-fit text-white ${action.color} shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {action.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Secondary Dashboard Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Low Stock Warning */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-4.5 w-4.5 text-slate-700 dark:text-zinc-300" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Peringatan Stok Kritis
              </h4>
            </div>
            <Link
              href="/inventory"
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center hover:underline uppercase tracking-wider"
            >
              Cek Semua Stok
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Kategori: {item.category}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-455">
                      Stok: {item.stock} {item.unit}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4">Semua stok barang aman dan tercukupi.</p>
            )}
          </div>
        </div>

        {/* Cash Flow Logs */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Mutasi Buku Kas Terbaru
              </h4>
              <Link
                href="/finance"
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-wider"
              >
                Detail Kas
              </Link>
            </div>

            <div className="space-y-4">
              {transactions.slice(0, 3).map((log, i) => {
                const isIn = log.type === "in";
                return (
                  <div key={i} className="flex justify-between items-start">
                    <div className="flex gap-2.5">
                      <div className={`mt-0.5 p-1 rounded-lg ${
                        isIn
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                      }`}>
                        {isIn ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {log.title}
                        </p>
                        <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                          {log.date} - {log.time}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-extrabold ${
                        isIn
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-455"
                      }`}>
                        {isIn ? "+" : "-"} {formatPrice(log.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Closing Summary Modal */}
      <AnimatePresence>
        {isClosingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md p-6 border border-slate-100 dark:border-zinc-800 shadow-2xl relative"
            >
              <button
                onClick={() => setIsClosingModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="text-center pb-4 border-b border-slate-100 dark:border-zinc-800/80">
                <Store className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Tutup Buku Kas Harian</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{todayDateStr}</p>
              </div>

              <div className="py-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Omset</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white mt-1 block">{formatPrice(totalSalesToday)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Estimasi Laba</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 mt-1 block">{formatPrice(dailyProfitToday)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Jumlah Transaksi (Nota)</span>
                    <span className="font-bold text-slate-900 dark:text-white">{transactionCountToday} Nota</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Total Sisa Kas Aktif</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(cashBalance)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Total Piutang Bon Baru</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(unpaidPiutangTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Total Hutang Supplier Baru</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(unpaidHutangTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex gap-2">
                <button
                  onClick={() => setIsClosingModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSendClosingReport}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10"
                >
                  <Send className="h-4.5 w-4.5" />
                  Kirim Laporan WA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
