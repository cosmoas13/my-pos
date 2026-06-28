import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Eye,
  QrCode,
  ReceiptText,
} from "lucide-react";

import { SaleStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const transactionDateFormatter = new Intl.DateTimeFormat("id-ID", {
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

function statusLabel(status: SaleStatus) {
  const labels: Record<SaleStatus, string> = {
    COMPLETED: "Selesai",
    VOIDED: "Void",
    REFUNDED: "Refund",
  };

  return labels[status];
}

export default async function TransactionsPage() {
  const transactions = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      cashier: true,
      items: true,
    },
  });

  const completedTotal = transactions.reduce(
    (total, transaction) =>
      transaction.status === SaleStatus.COMPLETED
        ? total + Number(transaction.totalAmount)
        : total,
    0
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] print:bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 print:hidden">
        <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <ArrowLeft size={16} />
              Kembali ke POS
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
                <ReceiptText size={21} />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Transaksi
                </p>
                <h1 className="text-2xl font-semibold">Riwayat Transaksi</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-lg border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted-foreground)]">Transaksi</p>
              <p className="mt-1 text-2xl font-semibold">
                {transactions.length}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted-foreground)]">Total</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCurrency(completedTotal)}
              </p>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h2 className="font-semibold">50 transaksi terakhir</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">
              Belum ada transaksi tersimpan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead className="bg-[var(--surface-muted)] text-left text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Waktu</th>
                    <th className="px-4 py-3 font-medium">Kasir</th>
                    <th className="px-4 py-3 font-medium">Metode</th>
                    <th className="px-4 py-3 text-right font-medium">Item</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {transaction.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">
                        {transactionDateFormatter.format(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-3">{transaction.cashier.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface-muted)] px-2 py-1 text-xs font-semibold">
                          {transaction.paymentMethod === "CASH" ? (
                            <Banknote size={14} />
                          ) : (
                            <QrCode size={14} />
                          )}
                          {transaction.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {transaction.items.length}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(Number(transaction.totalAmount))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-[#EEF7E8] px-2 py-1 text-xs font-semibold text-[#3F6C2F]">
                          {statusLabel(transaction.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/transactions/${transaction.id}`}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium hover:bg-[var(--surface-muted)]"
                        >
                          <Eye size={15} />
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
