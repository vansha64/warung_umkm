"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  DollarSign,
  User,
  PlusCircle,
  Trash
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Transaction,
  HutangSupplier,
  PiutangPelanggan,
  getLocalTransactions,
  addLocalTransaction,
  getLocalHutang,
  addLocalHutang,
  payHutang,
  getLocalPiutang,
  addLocalPiutang,
  collectPiutang
} from "@/lib/financeStore";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"kas" | "hutang" | "piutang">("kas");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hutangList, setHutangList] = useState<HutangSupplier[]>([]);
  const [piutangList, setPiutangList] = useState<PiutangPelanggan[]>([]);

  // Modal forms states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txTitle, setTxTitle] = useState("");
  const [txType, setTxType] = useState<"in" | "out">("in");
  const [txCategory, setTxCategory] = useState("Penjualan");
  const [txAmount, setTxAmount] = useState("");

  const [isHutangModalOpen, setIsHutangModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [hutangAmount, setHutangAmount] = useState("");
  const [hutangDueDate, setHutangDueDate] = useState("");
  const [hutangDesc, setHutangDesc] = useState("");

  const [isPiutangModalOpen, setIsPiutangModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [piutangAmount, setPiutangAmount] = useState("");
  const [piutangDueDate, setPiutangDueDate] = useState("");

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setTransactions(getLocalTransactions());
    setHutangList(getLocalHutang());
    setPiutangList(getLocalPiutang());
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Calculations
  const totalIn = transactions
    .filter((t) => t.type === "in")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = transactions
    .filter((t) => t.type === "out")
    .reduce((sum, t) => sum + t.amount, 0);

  const cashBalance = totalIn - totalOut;

  // Expense Categories Analytics
  const expenseTransactions = transactions.filter((t) => t.type === "out");
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const expenseCategories = Array.from(new Set(expenseTransactions.map((t) => t.category)));
  const expenseAnalytics = expenseCategories.map((cat) => {
    const amount = expenseTransactions.filter((t) => t.category === cat).reduce((sum, t) => sum + t.amount, 0);
    const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
    return { name: cat, amount, percentage };
  }).sort((a, b) => b.amount - a.amount);

  // Forms Submits
  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;

    addLocalTransaction({
      title: txTitle,
      type: txType,
      category: txCategory,
      amount: parseFloat(txAmount)
    });

    setTxTitle("");
    setTxAmount("");
    setIsTxModalOpen(false);
    refreshData();
  };

  const handleHutangSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || !hutangAmount || !hutangDueDate) return;

    const formattedDate = new Date(hutangDueDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    addLocalHutang({
      supplierName,
      amount: parseFloat(hutangAmount),
      dueDate: formattedDate,
      description: hutangDesc
    });

    setSupplierName("");
    setHutangAmount("");
    setHutangDueDate("");
    setHutangDesc("");
    setIsHutangModalOpen(false);
    refreshData();
  };

  const handlePiutangSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !piutangAmount || !piutangDueDate) return;

    const formattedDate = new Date(piutangDueDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    addLocalPiutang({
      customerName,
      amount: parseFloat(piutangAmount),
      dueDate: formattedDate
    });

    setCustomerName("");
    setPiutangAmount("");
    setPiutangDueDate("");
    setIsPiutangModalOpen(false);
    refreshData();
  };

  const handlePayHutang = (id: string) => {
    if (confirm("Apakah Anda yakin telah melunasi tagihan supplier ini? Transaksi pengeluaran akan otomatis tercatat.")) {
      payHutang(id);
      refreshData();
    }
  };

  const handleCollectPiutang = (id: string) => {
    if (confirm("Apakah pelanggan telah membayar lunas bon ini? Transaksi pemasukan akan otomatis terekam.")) {
      collectPiutang(id);
      refreshData();
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pembukuan & Kas Warung
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Catat transaksi masuk/keluar, pantau tagihan supplier (Hutang), dan kelola bon pelanggan (Piutang).
        </p>
      </div>

      {/* Cashflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo Kas Bersih</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(cashBalance)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Total In Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pemasukan</span>
              <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatPrice(totalIn)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Total Out Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
              <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{formatPrice(totalOut)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tab Registers */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs Selector */}
          <div className="flex border-b border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("kas")}
              className={cn(
                "pb-3 px-4 text-xs font-bold transition-all relative",
                activeTab === "kas"
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              )}
            >
              Buku Kas Harian
            </button>
            <button
              onClick={() => setActiveTab("hutang")}
              className={cn(
                "pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-1.5",
                activeTab === "hutang"
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              )}
            >
              Hutang Supplier
              {hutangList.filter(h => h.status === "Belum Lunas").length > 0 && (
                <span className="h-2 w-2 rounded-full bg-rose-500 block animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("piutang")}
              className={cn(
                "pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-1.5",
                activeTab === "piutang"
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              )}
            >
              Piutang Pelanggan
            </button>
          </div>

          {/* Buku Kas */}
          {activeTab === "kas" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-300">Aliran Arus Kas</h4>
                <button
                  onClick={() => {
                    setTxType("in");
                    setTxCategory("Penjualan");
                    setIsTxModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Transaksi
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {transactions.map((tx) => {
                    const isIn = tx.type === "in";
                    return (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl mt-0.5",
                            isIn
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                          )}>
                            {isIn ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                              <span className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">{tx.category}</span>
                              <span>&bull;</span>
                              <span>{tx.date} - {tx.time}</span>
                            </div>
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-extrabold tracking-tight",
                          isIn ? "text-emerald-600 dark:text-emerald-455" : "text-rose-600 dark:text-rose-455"
                        )}>
                          {isIn ? "+" : "-"}{formatPrice(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Hutang Supplier */}
          {activeTab === "hutang" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-300">Tagihan Supplier / Agen</h4>
                <button
                  onClick={() => setIsHutangModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Catat Hutang Agen
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {hutangList.map((h) => {
                    const isUnpaid = h.status === "Belum Lunas";
                    return (
                      <div key={h.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{h.supplierName}</span>
                            <span className={cn(
                              "text-[8px] font-bold px-1.5 py-0.5 rounded-md",
                              isUnpaid ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                            )}>
                              {h.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{h.description}</p>
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-semibold">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Jatuh Tempo: {h.dueDate}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{formatPrice(h.amount)}</span>
                          {isUnpaid && (
                            <button
                              onClick={() => handlePayHutang(h.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                            >
                              Tandai Lunas
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Piutang Pelanggan */}
          {activeTab === "piutang" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-300">Daftar Bon Pelanggan</h4>
                <button
                  onClick={() => setIsPiutangModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Catat Piutang Pelanggan
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {piutangList.map((p) => {
                    const isUnpaid = p.status === "Belum Lunas";
                    return (
                      <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{p.customerName}</span>
                            <span className={cn(
                              "text-[8px] font-bold px-1.5 py-0.5 rounded-md",
                              isUnpaid ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                            )}>
                              {p.status}
                            </span>
                          </div>
                          {p.orderId && <p className="text-[10px] text-slate-400 font-mono mt-1">Order Ref: {p.orderId}</p>}
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-semibold">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Jatuh Tempo: {p.dueDate}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{formatPrice(p.amount)}</span>
                          {isUnpaid && (
                            <button
                              onClick={() => handleCollectPiutang(p.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                            >
                              Tandai Lunas
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Analisis Pengeluaran</h4>
            <div className="space-y-4">
              {expenseAnalytics.length > 0 ? (
                expenseAnalytics.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500">{cat.name}</span>
                      <span className="text-slate-800 dark:text-white">{formatPrice(cat.amount)} ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${cat.percentage}%` }}
                        className="bg-emerald-600 h-full rounded-full transition-all"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Belum ada pengeluaran belanja modal dicatat.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 border border-slate-100 dark:border-zinc-800 shadow-2xl relative">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4">Catat Transaksi Buku Kas</h3>
            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Judul / Keterangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Minyak Goreng"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tipe Arus Kas</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as "in" | "out")}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:outline-none"
                  >
                    <option value="in">MASUK</option>
                    <option value="out">KELUAR</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Kategori</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:outline-none"
                  >
                    <option value="Penjualan">Penjualan</option>
                    <option value="Belanja Modal">Belanja Modal</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nominal (Rupiah)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 50000"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hutang Modal */}
      {isHutangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 border border-slate-100 dark:border-zinc-800 shadow-2xl relative">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4">Catat Hutang Supplier</h3>
            <form onSubmit={handleHutangSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nama Supplier / Agen</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Agen Beras Ramos Jaya"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nominal (Rupiah)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 150000"
                    value={hutangAmount}
                    onChange={(e) => setHutangAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Batas Jatuh Tempo</label>
                  <input
                    type="date"
                    required
                    value={hutangDueDate}
                    onChange={(e) => setHutangDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-[10px] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Detail Barang / Deskripsi</label>
                <textarea
                  placeholder="Contoh: Kulakan kopi kapal api sachet 5 dus"
                  value={hutangDesc}
                  onChange={(e) => setHutangDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:outline-none h-16 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsHutangModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Piutang Modal */}
      {isPiutangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 border border-slate-100 dark:border-zinc-800 shadow-2xl relative">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4">Catat Bon Pelanggan (Piutang)</h3>
            <form onSubmit={handlePiutangSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak Budi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nominal Bon (Rupiah)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 35000"
                    value={piutangAmount}
                    onChange={(e) => setPiutangAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Janji Bayar (Jatuh Tempo)</label>
                  <input
                    type="date"
                    required
                    value={piutangDueDate}
                    onChange={(e) => setPiutangDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-[10px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsPiutangModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
