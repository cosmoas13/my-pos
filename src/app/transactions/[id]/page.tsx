import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Banknote,
  Box,
  CalendarClock,
  CreditCard,
  FileText,
  QrCode,
  ReceiptText,
  UserRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SaleReceipt } from "@/components/receipt/sale-receipt";
import { PrintButton } from "@/components/transactions/print-button";
import { TransactionActions } from "@/components/transactions/transaction-actions";
import { SaleStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const detailDateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "2-digit",
  month: "long",
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

function statusLabel(status: SaleStatus) {
  const labels: Record<SaleStatus, string> = {
    COMPLETED: "Selesai",
    VOIDED: "Void",
    REFUNDED: "Refund",
  };

  return labels[status];
}

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transaction = await prisma.sale.findUnique({
    where: { id },
    include: {
      cashier: true,
      customer: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
      receiptPrints: true,
    },
  });

  if (!transaction) {
    notFound();
  }

  const receipt = {
    invoiceNumber: transaction.invoiceNumber,
    createdAt: transaction.createdAt,
    paymentMethod: transaction.paymentMethod,
    subtotal: Number(transaction.subtotal),
    totalAmount: Number(transaction.totalAmount),
    paidAmount: Number(transaction.paidAmount),
    changeAmount: Number(transaction.changeAmount),
    items: transaction.items.map((item) => ({
      productName: item.productName,
      sku: item.sku,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalAmount: Number(item.totalAmount),
    })),
  };

  const grossProfit = transaction.items.reduce(
    (total, item) =>
      total +
      (Number(item.unitPrice) - Number(item.costPrice)) * Number(item.quantity),
    0
  );
  const printCount = transaction.receiptPrints.reduce(
    (total, receiptPrint) => total + receiptPrint.printCount,
    0
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] print:min-h-0 print:bg-white">
      <div className="print:hidden">
        <AppShell active="Transaksi">
        <div className="flex w-full flex-col gap-6 px-4 py-6 md:px-6 print:hidden">
          <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
                <ReceiptText size={21} />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Detail transaksi
                </p>
                <h1 className="text-2xl font-semibold">
                  {transaction.invoiceNumber}
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/transactions"
                className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium hover:bg-[var(--surface-muted)]"
              >
                Kembali ke riwayat
              </Link>
              <PrintButton saleId={transaction.id} />
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border border-[var(--border)] bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <CalendarClock size={16} />
              Waktu
            </div>
            <p className="mt-2 font-semibold">
              {detailDateFormatter.format(transaction.createdAt)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <UserRound size={16} />
              Kasir
            </div>
            <p className="mt-2 font-semibold">{transaction.cashier.name}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <UserRound size={16} />
              Customer
            </div>
            <p className="mt-2 font-semibold">
              {transaction.customer?.name ?? "-"}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              {transaction.paymentMethod === "CASH" ? (
                <Banknote size={16} />
              ) : (
                <QrCode size={16} />
              )}
              Metode
            </div>
            <p className="mt-2 font-semibold">{transaction.paymentMethod}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Box size={16} />
              Status
            </div>
            <p className="mt-2 font-semibold">{statusLabel(transaction.status)}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border)] px-4 py-3">
              <h2 className="font-semibold">Item terjual</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead className="bg-[var(--surface-muted)] text-left text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Produk</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 text-right font-medium">Qty</th>
                    <th className="px-4 py-3 text-right font-medium">Harga</th>
                    <th className="px-4 py-3 text-right font-medium">Modal</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.items.map((item) => (
                    <tr key={item.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 font-semibold">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">
                        {item.sku ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Number(item.quantity)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(Number(item.unitPrice))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(Number(item.costPrice))}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(Number(item.totalAmount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-4">
            <TransactionActions
              saleId={transaction.id}
              status={transaction.status}
              initialNotes={transaction.notes ?? ""}
            />

            <div className="rounded-lg border border-[var(--border)] bg-white p-4">
              <div className="flex items-center gap-2 font-semibold">
                <CreditCard size={17} />
                Pembayaran
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Subtotal</span>
                  <span>{formatCurrency(Number(transaction.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Diskon</span>
                  <span>
                    {formatCurrency(Number(transaction.discountAmount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Pajak</span>
                  <span>{formatCurrency(Number(transaction.taxAmount))}</span>
                </div>
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="flex items-end justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-xl">
                      {formatCurrency(Number(transaction.totalAmount))}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Dibayar</span>
                  <span>{formatCurrency(Number(transaction.paidAmount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">
                    Kembalian
                  </span>
                  <span>{formatCurrency(Number(transaction.changeAmount))}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-white p-4">
              <div className="flex items-center gap-2 font-semibold">
                <FileText size={17} />
                Audit struk
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">
                    Total print
                  </span>
                  <span className="font-semibold">{printCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">
                    Catatan
                  </span>
                  <span className="max-w-44 truncate text-right">
                    {transaction.notes ?? "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Estimasi laba kotor
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCurrency(grossProfit)}
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Dihitung dari harga jual dikurangi harga modal pada item
                transaksi ini.
              </p>
            </div>
          </aside>
        </section>
        </div>
        </AppShell>
      </div>

      <div className="hidden print:block">
        <SaleReceipt receipt={receipt} />
      </div>
    </main>
  );
}
