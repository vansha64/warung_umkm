import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "WarungHub - Modern Business OS untuk UMKM Indonesia",
  description: "Kelola POS, Stok, Keuangan, Hutang, dan WhatsApp Checkout dalam satu platform digital operasional modern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-slate-50/50 dark:bg-zinc-950 text-foreground font-sans">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
