"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Store,
  ArrowRight,
  ShoppingCart,
  BookOpen,
  ClipboardList,
  Wallet,
  Package,
  CheckCircle,
  MessageSquare,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 20 } }
  } as const;


  const features = [
    {
      icon: ShoppingCart,
      title: "Kasir Digital (POS)",
      desc: "Transaksi kasir sangat cepat dan praktis, bisa langsung dari HP. Lengkap dengan sistem cetak/kirim nota belanja.",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      icon: Package,
      title: "Manajemen Stok",
      desc: "Catat stok masuk/keluar dengan akurat. Lengkap dengan peringatan otomatis jika stok barang mulai kritis.",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
    },
    {
      icon: Wallet,
      title: "Buku Kas & Keuangan",
      desc: "Pantau laba rugi, kas masuk, dan pengeluaran operasional harian secara otomatis tanpa coretan kertas.",
      color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30"
    },
    {
      icon: MessageSquare,
      title: "Checkout WhatsApp",
      desc: "Kirim ringkasan nota dan pesanan belanja pelanggan secara rapi langsung ke WhatsApp dengan satu klik.",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
    },
    {
      icon: BookOpen,
      title: "Buku Piutang & Hutang",
      desc: "Catat utang belanja pelanggan. Kirim pesan pengingat tagihan otomatis via WA untuk menagih dengan sopan.",
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
    },
    {
      icon: ShieldCheck,
      title: "Aman & Ringan",
      desc: "Data tersinkronisasi aman. Aplikasi ringan dan didesain ramah pengguna, bahkan untuk yang gaptek teknologi.",
      color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30"
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 min-h-screen flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/10">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-md font-bold tracking-tight text-slate-900 dark:text-white">
              Warung<span className="text-emerald-600">Hub</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-zinc-400">
            <a href="#fitur" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Fitur Utama</a>
            <a href="#testimoni" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Testimoni</a>
            <a href="#tentang" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Tentang Kami</a>
          </nav>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all shadow-sm active:scale-[0.98]"
          >
            Masuk Aplikasi
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Ambient Blur Backgrounds */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50">
            <Zap className="h-3 w-3 fill-emerald-600 animate-pulse" />
            Modern Business OS untuk UMKM Indonesia
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight"
          >
            Kelola Warung Jadi Lebih <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Modern, Praktis, & Untung
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Tinggalkan pencatatan manual di kertas. Pantau stok barang, rekam penjualan kasir, kirim nota belanja via WhatsApp, dan catat utang pelanggan dengan sistem digital premium yang didesain khusus bagi pemilik toko kecil di Indonesia.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 active:scale-[0.98] transition-all"
            >
              Coba Dashboard Sekarang
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <a
              href="#fitur"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-all active:scale-[0.98]"
            >
              Lihat Fitur Lengkap
            </a>
          </motion.div>

          {/* Interactive Screen Preview Container (Glassmorphism Mockup) */}
          <motion.div
            variants={itemVariants}
            className="pt-10 max-w-3xl mx-auto"
          >
            <div className="relative rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/30 p-2 shadow-2xl backdrop-blur-md">
              <div className="rounded-xl border border-slate-200/40 dark:border-zinc-800/50 overflow-hidden bg-slate-100 dark:bg-zinc-950 aspect-video flex flex-col items-center justify-center p-8 text-center">
                <Store className="h-10 w-10 text-emerald-600 mb-3 animate-bounce" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Aplikasi Kasir Warung Berkah Jaya</h3>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm">Tampilan antarmuka sangat responsif, minimalis, dan dirancang khusus agar nyaman digunakan lewat layar handphone.</p>
                <Link
                  href="/dashboard"
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  Buka Demo Aplikasi
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Features Section */}
      <section id="fitur" className="py-20 bg-white dark:bg-zinc-900/40 border-y border-slate-200/50 dark:border-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Satu Aplikasi, Segudang Solusi Operasional
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              WarungHub menyediakan semua alat yang Anda butuhkan untuk mendigitalisasi operasional harian warung sembako maupun toko kelontong Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50/50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:border-emerald-500/20 transition-all hover:scale-[1.01]"
                >
                  <div className={`p-3 rounded-xl w-fit ${feat.color}`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4">{feat.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Testimonials (Realism/Indonesian context) */}
      <section id="testimoni" className="py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Dicurahkan Oleh Pemilik Toko
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Berikut adalah kisah sukses bagaimana WarungHub mengubah operasional toko kecil mereka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm relative space-y-4">
              <span className="text-4xl text-emerald-200 dark:text-emerald-950 font-serif absolute top-3 right-4 select-none pointer-events-none">“</span>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed italic">
                “Dulu tiap kali ada tetangga belanja ngutang, saya selalu catat di buku tulis kecil yang sering terselip atau hilang. Sejak pakai Buku Piutang WarungHub, catatan utang tertata rapi, dan tinggal klik langsung bisa tagih lewat WhatsApp pelanggan. Sangat membantu!”
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">BS</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bu Sri</h4>
                  <p className="text-[9px] text-slate-400">Pemilik Warung Kelontong Berkah (Depok)</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm relative space-y-4">
              <span className="text-4xl text-emerald-200 dark:text-emerald-950 font-serif absolute top-3 right-4 select-none pointer-events-none">“</span>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed italic">
                “Aplikasi kasirnya sangat enteng dan gampang diajarkan ke anak saya yang bantu jaga toko. Fitur peringatan stok kritis juga sangat membantu saya tahu kapan harus restock minyak goreng atau telur ke agen kulakan.”
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">PB</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pak Bambang</h4>
                  <p className="text-[9px] text-slate-400">Toko Sembako Berkah Jaya (Semarang)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto py-10 bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Store className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Warung<span className="text-emerald-500">Hub</span>
            </span>
          </div>

          <p className="text-[10px]">
            &copy; 2026 WarungHub. Dibuat dengan cinta untuk kemajuan UMKM Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
