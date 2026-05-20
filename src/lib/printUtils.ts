import { Order } from "./ordersStore";
import { Product } from "./productsStore";

const formatPrice = (num: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(num);
};

export const generateReceiptHtml = (
  storeName: string,
  customerName: string,
  items: { product: Product; quantity: number }[],
  total: number,
  orderId?: string,
  orderDate?: string,
  orderTime?: string,
  autoPrint: boolean = true
) => {
  const currentDate = new Date();
  const dateStr = orderDate || currentDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = orderTime || currentDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const receiptId = orderId || `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Cetak Struk - ${receiptId}</title>
      <style>
        @page {
          margin: 0;
          size: 58mm 100%; /* Thermal paper standard size */
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          line-height: 1.2;
          width: 58mm;
          margin: 0 auto;
          padding: 10px 5px;
          color: #000;
          background: #fff;
        }
        h1 {
          font-size: 16px;
          text-align: center;
          margin: 0 0 5px 0;
          font-weight: bold;
        }
        p {
          margin: 0 0 5px 0;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .divider {
          border-top: 1px dashed #000;
          margin: 5px 0;
        }
        .header-info {
          font-size: 10px;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        th, td {
          padding: 2px 0;
          vertical-align: top;
        }
        .qty-col { width: 15%; }
        .item-col { width: 50%; }
        .price-col { width: 35%; text-align: right; }
        .total-section {
          margin-top: 5px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 12px;
          margin: 3px 0;
        }
        .footer {
          margin-top: 15px;
          text-align: center;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <h1>${storeName}</h1>
      <div class="text-center header-info">
        <p>Kasir Pintar WarungHub</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="header-info">
        <p>No     : ${receiptId}</p>
        <p>Tanggal: ${dateStr} ${timeStr}</p>
        <p>Nama   : ${customerName || "Umum"}</p>
      </div>
      
      <div class="divider"></div>
      
      <table>
        ${items.map(item => `
          <tr>
            <td colspan="3">${item.product.name}</td>
          </tr>
          <tr>
            <td class="qty-col">${item.quantity}x</td>
            <td class="item-col">@ ${formatPrice(item.product.price).replace('Rp', '')}</td>
            <td class="price-col">${formatPrice(item.product.price * item.quantity).replace('Rp', '')}</td>
          </tr>
        `).join('')}
      </table>
      
      <div class="divider"></div>
      
      <div class="total-section">
        <div class="total-row">
          <span>TOTAL</span>
          <span>${formatPrice(total)}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="footer">
        <p>Terima Kasih</p>
        <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
      </div>
      ${autoPrint ? `
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
      ` : ''}
    </body>
    </html>
  `;
};

export const printReceipt = (
  storeName: string,
  customerName: string,
  items: { product: Product; quantity: number }[],
  total: number,
  orderId?: string,
  orderDate?: string,
  orderTime?: string
) => {
  const html = generateReceiptHtml(storeName, customerName, items, total, orderId, orderDate, orderTime, true);
  const printWindow = window.open('', '_blank', 'width=400,height=600,left=200,top=200');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert("Popup diblokir oleh browser. Izinkan popup untuk mencetak struk.");
  }
};
