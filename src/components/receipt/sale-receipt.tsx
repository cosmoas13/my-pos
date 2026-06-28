type SaleReceiptItem = {
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
};

export type SaleReceiptData = {
  invoiceNumber: string;
  createdAt: Date | string;
  paymentMethod: string;
  subtotal: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  items: SaleReceiptItem[];
};

const receiptDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SaleReceipt({ receipt }: { receipt: SaleReceiptData }) {
  return (
    <section className="bg-white p-6 text-black">
      <div className="mx-auto max-w-sm font-mono text-sm">
        <div className="text-center">
          <h1 className="text-lg font-bold">My POS</h1>
          <p>Toko Sembako</p>
          <p className="mt-2">{receipt.invoiceNumber}</p>
          <p>{receiptDateFormatter.format(new Date(receipt.createdAt))}</p>
        </div>

        <div className="my-4 border-t border-dashed border-black" />

        <div className="space-y-3">
          {receipt.items.map((item) => (
            <div key={`${receipt.invoiceNumber}-${item.productName}-${item.sku}`}>
              <div className="font-semibold">{item.productName}</div>
              {item.sku && <div>SKU: {item.sku}</div>}
              <div className="flex justify-between">
                <span>
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </span>
                <span>{formatCurrency(item.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-black" />

        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(receipt.subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(receipt.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Metode</span>
            <span>{receipt.paymentMethod.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Dibayar</span>
            <span>{formatCurrency(receipt.paidAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembalian</span>
            <span>{formatCurrency(receipt.changeAmount)}</span>
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-black" />

        <p className="text-center">Terima kasih</p>
      </div>
    </section>
  );
}
