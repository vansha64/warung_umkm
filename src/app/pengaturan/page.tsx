"use client";

import React, { useState } from "react";
import {
  Settings,
  Store,
  Phone,
  MessageSquare,
  Lock,
  User,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuditLogs } from "@/lib/auditStore";

export default function PengaturanPage() {
  const [warungName, setWarungName] = useState("Warung Berkah Jaya");
  const [ownerName, setOwnerName] = useState("Bu Sri");
  const [phone, setPhone] = useState("081234567890");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pengaturan Aplikasi
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Kelola profil warung, informasi kontak, dan sistem WhatsApp Checkout Anda.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Profile Settings card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Store className="h-4.5 w-4.5 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Profil & Kontak Warung</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                Nama Warung / Toko
              </label>
              <input
                type="text"
                value={warungName}
                onChange={(e) => setWarungName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                Nama Pemilik / Kasir Utama
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                Nomor WhatsApp untuk Checkout/Tagihan
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[9px] text-slate-400 mt-1 block">
                Nomor ini akan digunakan sebagai penerima order otomatis via link WA.
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Checkout Settings card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <MessageSquare className="h-4.5 w-4.5 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Format Checkout WhatsApp</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Kirim Detail Transaksi Otomatis</p>
                <p className="text-[10px] text-slate-400">Kirim daftar barang belanjaan, jumlah, subtotal, dan total harga.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Sertakan Link Pembayaran QRIS</p>
                <p className="text-[10px] text-slate-400">Sertakan instruksi pembayaran digital / QRIS di bagian bawah chat.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs Section (Owner Only) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Log Aktivitas & Audit Keamanan</h3>
            </div>
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/30 uppercase">
              Owner Only
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {getAuditLogs().length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-4">Belum ada aktivitas tercatat.</p>
            ) : (
              getAuditLogs().map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/60 rounded-xl text-left flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 mt-1.5">
                      {log.details}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">
                      Oleh: <span className="font-semibold text-slate-600 dark:text-zinc-300 capitalize">{log.user} ({log.role})</span>
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
            {isSaved && (
              <>
                <CheckCircle className="h-4.5 w-4.5" />
                Pengaturan berhasil disimpan!
              </>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 active:scale-[0.98] transition-all"
          >
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
}
