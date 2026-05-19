"use client";

export interface Transaction {
  id: string;
  title: string;
  type: "in" | "out";
  category: string;
  amount: number;
  date: string;
  time: string;
}

export interface HutangSupplier {
  id: string;
  supplierName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Belum Lunas" | "Lunas";
  description: string;
}

export interface PiutangPelanggan {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Belum Lunas" | "Lunas";
  orderId?: string;
}

const TX_KEY = "warunghub_tx";
const HUTANG_KEY = "warunghub_hutang";
const PIUTANG_KEY = "warunghub_piutang";

// Initial mock data
const mockTransactions = (): Transaction[] => [
  {
    id: "tx-1",
    title: "Penjualan Sembako Harian",
    type: "in",
    category: "Penjualan",
    amount: 325000,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    time: "10:30"
  },
  {
    id: "tx-2",
    title: "Bayar Tagihan Listrik Warung",
    type: "out",
    category: "Operasional",
    amount: 150000,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    time: "11:15"
  },
  {
    id: "tx-3",
    title: "Kulakan Mie Instan & Kopi",
    type: "out",
    category: "Belanja Modal",
    amount: 240000,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    time: "14:00"
  }
];

const mockHutang = (): HutangSupplier[] => {
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  
  return [
    {
      id: "ht-1",
      supplierName: "Agen Sembako Makmur",
      amount: 450000,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      dueDate: threeDaysLater.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      status: "Belum Lunas",
      description: "Sisa tagihan belanja beras ramos 10 karung"
    }
  ];
};

const mockPiutang = (): PiutangPelanggan[] => {
  const fiveDaysLater = new Date();
  fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

  return [
    {
      id: "pt-1",
      customerName: "Pak Budi",
      amount: 85000,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      dueDate: fiveDaysLater.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      status: "Belum Lunas",
      orderId: "WH-1048"
    }
  ];
};

export function getLocalTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(TX_KEY);
  if (!stored) {
    // Migrate old finance data if exists
    const oldFinances = localStorage.getItem("warunghub_finances");
    if (oldFinances) {
      try {
        const parsed = JSON.parse(oldFinances);
        localStorage.setItem(TX_KEY, JSON.stringify(parsed));
        return parsed;
      } catch (e) {}
    }
    const mocks = mockTransactions();
    localStorage.setItem(TX_KEY, JSON.stringify(mocks));
    return mocks;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveLocalTransactions(txs: Transaction[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TX_KEY, JSON.stringify(txs));
  }
}

export function addLocalTransaction(tx: Omit<Transaction, "id" | "date" | "time">): Transaction {
  const txs = getLocalTransactions();
  const newTx: Transaction = {
    ...tx,
    id: `tx-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  };
  const updated = [newTx, ...txs];
  saveLocalTransactions(updated);
  return newTx;
}

export function getLocalHutang(): HutangSupplier[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(HUTANG_KEY);
  if (!stored) {
    const mocks = mockHutang();
    localStorage.setItem(HUTANG_KEY, JSON.stringify(mocks));
    return mocks;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveLocalHutang(hutangs: HutangSupplier[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(HUTANG_KEY, JSON.stringify(hutangs));
  }
}

export function addLocalHutang(h: Omit<HutangSupplier, "id" | "date" | "status">): HutangSupplier {
  const hutangs = getLocalHutang();
  const newH: HutangSupplier = {
    ...h,
    id: `ht-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    status: "Belum Lunas"
  };
  const updated = [newH, ...hutangs];
  saveLocalHutang(updated);
  return newH;
}

export function payHutang(id: string) {
  const hutangs = getLocalHutang();
  const target = hutangs.find(h => h.id === id);
  if (!target) return;

  // Mark as Lunas
  const updated = hutangs.map(h => h.id === id ? { ...h, status: "Lunas" as const } : h);
  saveLocalHutang(updated);

  // Record as an expense transaction
  addLocalTransaction({
    title: `Pelunasan Hutang: ${target.supplierName}`,
    type: "out",
    category: "Belanja Modal",
    amount: target.amount
  });
}

export function getLocalPiutang(): PiutangPelanggan[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(PIUTANG_KEY);
  if (!stored) {
    const mocks = mockPiutang();
    localStorage.setItem(PIUTANG_KEY, JSON.stringify(mocks));
    return mocks;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveLocalPiutang(piutangs: PiutangPelanggan[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PIUTANG_KEY, JSON.stringify(piutangs));
  }
}

export function addLocalPiutang(p: Omit<PiutangPelanggan, "id" | "date" | "status">): PiutangPelanggan {
  const piutangs = getLocalPiutang();
  const newP: PiutangPelanggan = {
    ...p,
    id: `pt-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    status: "Belum Lunas"
  };
  const updated = [newP, ...piutangs];
  saveLocalPiutang(updated);
  return newP;
}

export function collectPiutang(id: string) {
  const piutangs = getLocalPiutang();
  const target = piutangs.find(p => p.id === id);
  if (!target) return;

  // Mark as Lunas
  const updated = piutangs.map(p => p.id === id ? { ...p, status: "Lunas" as const } : p);
  saveLocalPiutang(updated);

  // Record as income transaction
  addLocalTransaction({
    title: `Pelunasan Piutang: ${target.customerName}`,
    type: "in",
    category: "Penjualan",
    amount: target.amount
  });

  // Sync back to orders history if orderId is present
  if (target.orderId) {
    const ordersStr = localStorage.getItem("warunghub_orders");
    if (ordersStr) {
      try {
        const orders = JSON.parse(ordersStr);
        const updatedOrders = orders.map((o: any) => o.id === target.orderId ? { ...o, status: "Lunas" } : o);
        localStorage.setItem("warunghub_orders", JSON.stringify(updatedOrders));
      } catch (e) {}
    }
  }
}
