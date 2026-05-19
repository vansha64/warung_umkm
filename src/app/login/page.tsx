"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Shield, User, Lock, AlertCircle } from "lucide-react";
import { login, getSession } from "@/lib/authStore";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // If session already active, redirect
    const session = getSession();
    if (session) {
      if (session.role === "owner") {
        router.push("/dashboard");
      } else {
        router.push("/pos");
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple role verification logic for small business
    if (username === "sri" && password === "owner123") {
      login("sri", "owner");
      router.push("/dashboard");
    } else if (username === "kasir" && password === "kasir123") {
      login("kasir", "cashier");
      router.push("/pos");
    } else {
      setError("Username atau password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 mx-auto">
          <Store className="h-6.5 w-6.5" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Masuk ke WarungHub
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-zinc-400">
          Sistem Operasi Operasional UMKM Modern
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 border border-slate-200/60 dark:border-zinc-800 shadow-xl rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Username / Akun
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: sri atau kasir"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 active:scale-95 transition-all cursor-pointer"
              >
                Masuk Sekarang
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 dark:border-zinc-800/80 pt-4 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block">Akun Bawaan Uji Coba:</span>
            <div className="mt-2 text-[10px] text-slate-500 dark:text-zinc-400 space-y-1">
              <p>👤 Owner: <span className="font-bold text-slate-700 dark:text-white">sri</span> &bull; Pass: <span className="font-mono text-slate-700 dark:text-white">owner123</span></p>
              <p>👤 Kasir: <span className="font-bold text-slate-700 dark:text-white">kasir</span> &bull; Pass: <span className="font-mono text-slate-700 dark:text-white">kasir123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
