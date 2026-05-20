"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  X,
  Printer,
  RefreshCcw,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Order,
  OrderStatus,
  getLocalOrders,
  updateOrderStatus
} from "@/lib/ordersStore";
import { logAudit } from "@/lib/auditStore";
import { printReceipt } from "@/lib/printUtils";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setOrders(getLocalOrders());
  }, []);

  const refreshOrders = () => {
    setOrders(getLocalOrders());
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === "Semua" || o.status === selectedStatus;
    const matchesSearch = o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleResendWhatsApp = (order: Order) => {
    const storeName = "Warung Berkah Jaya";
    let text = `🏪 *RESEND NOTA - ${storeName}* 🏪\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Nota ID   : #${order.id}\n`;
    text += `Pelanggan : ${order.customerName}\n`;
    text += `Status    : *${order.status.toUpperCase()}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `🛍️ *Rincian Belanja:*\n`;
    order.items.forEach((item, index) => {
      text += `*${index + 1}. ${item.product.name}*\n`;
      text += `   ${item.quantity} ${item.product.unit} x ${formatPrice(item.product.price)} = *${formatPrice(item.product.price * item.quantity)}*\n`;
    });
    
    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *TOTAL : ${formatPrice(order.total)}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `Terima kasih! 🙏`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    logAudit("ORDER_STATUS", `Mengubah status nota ${orderId} menjadi ${newStatus}`);
    refreshOrders();
    // Update local state for modal immediately
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleRepeatOrder = (order: Order) => {
    if (order.items.length === 0) {
      alert("Pesanan ini tidak memiliki rincian barang.");
      return;
    }
    // Save items to repeat cart in localStorage
    localStorage.setItem("warunghub_repeat_cart", JSON.stringify(order.items));
    // Navigate to POS
    router.push("/pos");
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Riwayat Pesanan & Nota
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Daftar seluruh transaksi yang pernah dilakukan. Ubah status hutang menjadi lunas atau ulangi pesanan.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Nota atau nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {["Semua", "Lunas", "Hutang", "Draf"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border shadow-sm",
                selectedStatus === status
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl divide-y divide-slate-100 dark:divide-zinc-800 shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Belum ada pesanan yang sesuai.
          </div>
        ) : (
          filteredOrders.map((o) => {
            const isPaid = o.status === "Lunas";

            return (
              <div
                key={o.id}
                className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => setSelectedOrder(o)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl mt-0.5 shadow-sm",
                    isPaid
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                  )}>
                    {isPaid ? (
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    ) : (
                      <AlertCircle className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {o.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">{o.id}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {o.items?.length || 0} macam item &bull; {o.date} &bull; {o.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6" onClick={(e) => e.stopPropagation()}>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                      {formatPrice(o.total)}
                    </span>
                    <span className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold mt-1",
                      isPaid
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"
                    )}>
                      {o.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); printReceipt("Warung Berkah Jaya", o.customerName, o.items, o.total, o.id, o.date, o.time); }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm bg-white dark:bg-zinc-900"
                      title="Cetak Struk"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleResendWhatsApp(o); }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm bg-white dark:bg-zinc-900"
                      title="Kirim Nota via WA"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm bg-white dark:bg-zinc-900"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md p-6 border border-slate-100 dark:border-zinc-800 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center pb-4 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Detail Transaksi</span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{selectedOrder.id}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{selectedOrder.date} &bull; {selectedOrder.time}</p>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 scrollbar-thin pr-1">
              {/* Status Management */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/50">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Status Pembayaran</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                    className={cn(
                      "mt-1 text-xs font-bold bg-transparent border-none p-0 focus:ring-0 cursor-pointer",
                      selectedOrder.status === "Lunas" ? "text-emerald-600" : "text-amber-600"
                    )}
                  >
                    <option value="Lunas" className="text-slate-900">LUNAS</option>
                    <option value="Hutang" className="text-slate-900">HUTANG</option>
                    <option value="Draf" className="text-slate-900">DRAF</option>
                  </select>
                </div>
                <Edit className="h-4 w-4 text-slate-300" />
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Pelanggan</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">{selectedOrder.customerName}</span>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Rincian Barang</span>
                <ul className="mt-1.5 divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <li key={idx} className="py-2 flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 leading-snug">{item.product.name}</p>
                          <p className="text-[10px] text-slate-400">{item.quantity} {item.product.unit} x {formatPrice(item.product.price)}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="py-2 text-xs text-slate-400 italic">Pesanan ini dibuat di versi sebelumnya dan tidak memiliki detail barang.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="shrink-0 pt-4 pb-2">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Total Tagihan</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatPrice(selectedOrder.total)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleRepeatOrder(selectedOrder)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-xs font-bold shadow-sm"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Ulangi
                </button>
                <button
                  onClick={() => printReceipt("Warung Berkah Jaya", selectedOrder.customerName, selectedOrder.items, selectedOrder.total, selectedOrder.id, selectedOrder.date, selectedOrder.time)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-800 hover:bg-slate-900 text-white transition-all text-xs font-bold shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  Cetak
                </button>
                <button
                  onClick={() => handleResendWhatsApp(selectedOrder)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all text-xs font-bold"
                >
                  <MessageSquare className="h-4 w-4" />
                  Kirim WA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
