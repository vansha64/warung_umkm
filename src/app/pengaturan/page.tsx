"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Store,
  Phone,
  MessageSquare,
  Lock,
  User,
  CheckCircle,
  HelpCircle,
  Users,
  Plus,
  Trash2,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuditLogs, logAudit } from "@/lib/auditStore";
import { getAccounts, addAccount, deleteAccount, UserAccount, Role, getSession } from "@/lib/authStore";

export default function PengaturanPage() {
  const [warungName, setWarungName] = useState("Warung Berkah Jaya");
  const [ownerName, setOwnerName] = useState("Bu Sri");
  const [phone, setPhone] = useState("081234567890");
  const [isSaved, setIsSaved] = useState(false);
  const [session, setSession] = useState<{username: string, role: Role} | null>(null);

  // Staff Management State
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("cashier");
  const [staffError, setStaffError] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");

  useEffect(() => {
    setAccounts(getAccounts());
    setSession(getSession());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");
    setStaffSuccess("");

    if (!newUsername || !newPassword) {
      setStaffError("Username dan password harus diisi.");
      return;
    }

    const success = addAccount({
      username: newUsername,
      passwordHash: newPassword,
      role: newRole
    });

    if (success) {
      setStaffSuccess(`Akun ${newUsername} berhasil dibuat!`);
      setNewUsername("");
      setNewPassword("");
      setAccounts(getAccounts());
      logAudit("STAFF_CREATED", `Akun baru dibuat: ${newUsername} (${newRole})`);
      setTimeout(() => setStaffSuccess(""), 3000);
    } else {
      setStaffError("Username sudah digunakan. Pilih yang lain.");
    }
  };

  const handleDeleteStaff = (id: string, username: string) => {
    if (confirm(`Yakin ingin menghapus akun ${username}?`)) {
      const success = deleteAccount(id);
      if (success) {
        setAccounts(getAccounts());
        logAudit("STAFF_DELETED", `Akun dihapus: ${username}`);
      } else {
        alert("Tidak dapat menghapus akun owner terakhir.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pengaturan Aplikasi
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Kelola profil warung, informasi kontak, manajemen staf, dan log sistem.
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

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
            {isSaved && (
              <>
                <CheckCircle className="h-4.5 w-4.5" />
                Pengaturan umum berhasil disimpan!
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

      {/* Staff Management Section (Owner Only) */}
      {session?.role === "owner" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-blue-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Manajemen Staf (Kasir)</h3>
            </div>
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/30 uppercase">
              Owner Only
            </span>
          </div>

          <div className="space-y-4">
            {/* List of current staff */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-2 uppercase">Akun Aktif</h4>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 border border-slate-100 dark:border-zinc-800/80 rounded-xl overflow-hidden">
                {accounts.map(acc => (
                  <div key={acc.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-950">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                        acc.role === "owner" ? "bg-amber-500" : "bg-emerald-500"
                      )}>
                        {acc.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{acc.username}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          {acc.role === "owner" ? <Shield className="h-3 w-3 text-amber-500" /> : <User className="h-3 w-3 text-emerald-500" />}
                          {acc.role === "owner" ? "Pemilik (Owner)" : "Kasir (Cashier)"}
                        </p>
                      </div>
                    </div>
                    {acc.username !== session.username && (
                      <button 
                        onClick={() => handleDeleteStaff(acc.id, acc.username)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Hapus Akun"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add new staff form */}
            <div className="pt-2">
              <h4 className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-2 uppercase">Tambah Akun Baru</h4>
              <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80">
                {staffError && <p className="text-[10px] text-rose-600 mb-2">{staffError}</p>}
                {staffSuccess && <p className="text-[10px] text-emerald-600 mb-2">{staffSuccess}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="cashier">Kasir</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <button
                  onClick={handleAddStaff}
                  className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/10 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Buat Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Section (Owner Only) */}
      {session?.role === "owner" && (
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
      )}
    </div>
  );
}
