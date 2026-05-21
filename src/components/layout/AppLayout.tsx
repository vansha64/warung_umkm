"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  BookOpen,
  ClipboardList,
  Wallet,
  Package,
  Store,
  Menu,
  X,
  Bell,
  ChevronRight,
  User,
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSession, logout, UserSession } from "@/lib/authStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner"] },
  { name: "Kasir (POS)", href: "/pos", icon: ShoppingCart, roles: ["owner", "cashier"] },
  { name: "Katalog Produk", href: "/catalog", icon: BookOpen, roles: ["owner"] },
  { name: "Daftar Pesanan", href: "/orders", icon: ClipboardList, roles: ["owner", "cashier"] },
  { name: "Keuangan", href: "/finance", icon: Wallet, roles: ["owner"] },
  { name: "Inventori", href: "/inventory", icon: Package, roles: ["owner"] },
  { name: "Pengaturan", href: "/pengaturan", icon: Settings, roles: ["owner"] },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const notifications = [
    { id: 1, title: "Stok Menipis", desc: "Minyak Goreng Bimoli sisa 2 pcs", time: "5 mnt lalu", unread: true },
    { id: 2, title: "Laporan Mingguan", desc: "Penjualan naik 15% minggu ini", time: "2 jam lalu", unread: true },
    { id: 3, title: "Update Sistem", desc: "Fitur printer kasir telah aktif", time: "1 hari lalu", unread: false },
  ];

  useEffect(() => {
    // If it is the Landing Page or Login page, skip heavy auth block
    if (pathname === "/" || pathname === "/login") {
      setIsChecking(false);
      return;
    }

    const currentSession = getSession();
    if (!currentSession) {
      router.push("/login");
      return;
    }

    // Role-based route protection
    const currentNav = navigationItems.find((n) => n.href === pathname);
    if (currentNav && !currentNav.roles.includes(currentSession.role)) {
      // If Cashier tries to access unauthorized page, kick them to POS
      router.push("/pos");
      return;
    }

    setSession(currentSession);
    setIsChecking(false);
  }, [pathname, router]);

  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  if (isChecking) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading secure session...</div>;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Warung Name context (realism)
  const warungName = "Warung Berkah Jaya";
  const ownerName = "Bu Sri";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          {/* Brand/Logo */}
          <div className="flex items-center flex-shrink-0 px-6 gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/10">
              <Store className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Warung<span className="text-emerald-600">Hub</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Business OS
              </span>
            </div>
          </div>

          {/* Warung Info Card (Glassmorphism inspired) */}
          <div className="mx-4 mt-6 p-4 rounded-xl bg-slate-100/50 dark:bg-zinc-800/40 border border-slate-200/40 dark:border-zinc-800/40 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                WH
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {warungName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Kasir Aktif
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 mt-6 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative group",
                    isActive
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20 backdrop-blur-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute left-0 w-1 h-6 bg-emerald-600 dark:bg-emerald-500 rounded-r-md"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="flex-shrink-0 flex border-t border-slate-100 dark:border-zinc-800/80 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 font-semibold text-sm">
                {session?.role === "owner" ? "BS" : "KS"}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white capitalize">
                  {session?.username || "Pengguna"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 capitalize">
                  {session?.role === "owner" ? "Pemilik Warung" : "Kasir"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main content wrapper (shifted on desktop) */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-slate-100 dark:border-zinc-900/80 md:px-8">
          {/* Left section: Store branding for mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/10">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {warungName}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                Sistem Operasional
              </p>
            </div>
          </div>

          {/* Left section: Page title indicator for desktop */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
            <span className="font-semibold text-slate-950 dark:text-white">
              {warungName}
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="capitalize">
              {pathname === "/dashboard" ? "Dashboard" : pathname.replace("/", "").replace("-", " ")}
            </span>
          </div>

          {/* Right section: Profile & Notification */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800/50 dark:text-zinc-400 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border border-white dark:border-zinc-950" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsNotificationOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifikasi</h3>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          {notifications.filter(n => n.unread).length} Baru
                        </span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                            {notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                className={cn(
                                  "px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer",
                                  notif.unread ? "bg-white dark:bg-zinc-900" : "bg-slate-50/30 dark:bg-zinc-900/30 opacity-75"
                                )}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className={cn("text-xs font-semibold", notif.unread ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-zinc-400")}>
                                    {notif.title}
                                  </h4>
                                  <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap ml-2">
                                    {notif.time}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                                  {notif.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center text-sm text-slate-500">
                            Tidak ada notifikasi baru
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50">
                        <button 
                          className="w-full py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          onClick={() => setIsNotificationOpen(false)}
                        >
                          Tutup
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile info - Desktop only */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
                S
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                  {ownerName}
                </p>
                <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-medium">
                  ID: WH-291
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 md:p-8 pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="max-w-5xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-slate-200/60 dark:border-zinc-800/60 md:hidden pb-safe">
        <nav className="flex items-center justify-around h-16 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 relative"
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-2xl w-10 py-1 transition-all duration-200",
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                      : "text-slate-500 dark:text-zinc-400"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span
                  className={cn(
                    "text-[8px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "text-emerald-700 dark:text-emerald-400 font-bold"
                      : "text-slate-500 dark:text-zinc-400"
                  )}
                >
                  {item.name === "Kasir (POS)" ? "Kasir" : item.name === "Katalog Produk" ? "Katalog" : item.name === "Daftar Pesanan" ? "Pesanan" : item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
