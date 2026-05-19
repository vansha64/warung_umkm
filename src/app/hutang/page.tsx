"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const initialDebtors = [
  { id: 1, name: "Bu Endang (Tetangga Sebelah)", phone: "081234567890", amount: 150000, lastUpdated: "19 Mei 2026", status: "Belum Lunas", items: "Beras Ramos 5kg, Telur 1kg" },
  { id: 2, name: "Pak Budi (Kontrakan Depan)", phone: "089876543210", amount: 80000, lastUpdated: "18 Mei 2026", status: "Belum Lunas", items: "Rokok Sampoerna, Kopi" },
  { id: 3, name: "Mbak Dian (Kos Putri)", phone: "087711223344", amount: 45000, lastUpdated: "15 Mei 2026", status: "Belum Lunas", items: "Indomie Goreng 10, Mama Lemon" },
  { id: 4, name: "Mas Rian", phone: "085223344556", amount: 145000, lastUpdated: "10 Mei 2026", status: "Terlambat", items: "Minyak Goreng 2L, Gula 1kg" }
];

export default function HutangPage() {
  const [debtors, setDebtors] = useState(initialDebtors);
  const [searchQuery, setSearchQuery] = useState("");

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredDebtors = debtors.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReceivables = debtors.reduce((acc, d) => acc + d.amount, 0);

  const handleSendReminder = (debtor: typeof debtors[0]) => {
    const storeName = "Warung Berkah Jaya";
    const text = `Halo *${debtor.name}*,\n\nKami dari *${storeName}* ingin mengingatkan catatan hutang belanja Anda sebesar *${formatPrice(debtor.amount)}* yang dicatat pada tanggal ${debtor.lastUpdated}.\n\nDetail belanja: ${debtor.items}.\n\nPembayaran dapat dilakukan langsung di warung atau via transfer. Terima kasih banyak atas kerja samanya! 🙏`;
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${debtor.phone}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Buku Hutang / Piutang Pelanggan
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Catat dan pantau tagihan belanja pelanggan warung agar cashflow lancar.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/10 active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" />
          Catat Piutang Baru
        </button>
      </div>

      {/* Debt Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Piutang (Uang di Pelanggan)</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{formatPrice(totalReceivables)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Pelanggan Ngutang</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{debtors.length} Orang</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Hutang Toko ke Supplier</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1 block">Rp 0</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama pelanggan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Debtors List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl divide-y divide-slate-100 dark:divide-zinc-800 shadow-sm">
        {filteredDebtors.map((debtor) => {
          const isOverdue = debtor.status === "Terlambat";
          return (
            <div key={debtor.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2.5 rounded-full mt-0.5",
                  isOverdue
                    ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                    : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                )}>
                  {isOverdue ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {debtor.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Hp: {debtor.phone} &bull; Catatan: <span className="font-medium text-slate-600 dark:text-zinc-300">{debtor.items}</span>
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Terakhir dicatat: {debtor.lastUpdated}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="text-left sm:text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {formatPrice(debtor.amount)}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold mt-1",
                    isOverdue
                      ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400"
                      : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"
                  )}>
                    {debtor.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendReminder(debtor)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-600/20 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 text-[10px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Tagih WA
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Lunasi
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
