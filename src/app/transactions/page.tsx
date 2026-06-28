import Link from "next/link";
import { Banknote, Download, Eye, QrCode, ReceiptText, Search } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PaymentMethod, SaleStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildTransactionWhere,
  getPageParam,
  getQueryString,
  getTransactionFilters,
  PAGE_SIZE,
} from "@/lib/transactions";

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

function statusClass(status: SaleStatus) {
  if (status === SaleStatus.COMPLETED) {
    return "bg-[#EEF7E8] text-[#3F6C2F]";
  }

  if (status === SaleStatus.REFUNDED) {
    return "bg-[#F7E8C8] text-[#8A5B12]";
  }

  return "bg-[#FFF1EE] text-[#A63F31]";
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = getTransactionFilters(params);
  const page = getPageParam(params);
  const where = buildTransactionWhere(filters);

  const [transactions, transactionCount, completedTotal] = await Promise.all([
    prisma.sale.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        cashier: true,
        customer: true,
        items: true,
      },
    }),
    prisma.sale.count({ where }),
    prisma.sale.aggregate({
      where: { ...where, status: SaleStatus.COMPLETED },
      _sum: { totalAmount: true },
    }),
  ]);

  const pageCount = Math.max(Math.ceil(transactionCount / PAGE_SIZE), 1);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < pageCount ? page + 1 : null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] print:bg-white">
      <AppShell active="Transaksi">
        <div className="flex w-full flex-col gap-6 px-4 py-6 md:px-6 print:hidden">
          <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:flex-row md:items-center md:justify-between">
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

            <div className="grid grid-cols-2 gap-3 sm:min-w-80">
              <div className="rounded-lg border border-[var(--border)] bg-white p-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Hasil filter
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {transactionCount}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-white p-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Total selesai
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatCurrency(Number(completedTotal._sum.totalAmount ?? 0))}
                </p>
              </div>
            </div>
          </header>

          <form className="rounded-lg border border-[var(--border)] bg-white p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_150px_150px_150px_150px_auto]">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-[var(--border)] px-3">
                <Search size={16} className="text-[var(--muted-foreground)]" />
                <input
                  name="q"
                  defaultValue={filters.q}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="Invoice, produk, SKU, kasir, customer"
                />
              </label>
              <select
                name="status"
                defaultValue={filters.status}
                className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
              >
                <option value="">Semua status</option>
                {Object.values(SaleStatus).map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
              <select
                name="paymentMethod"
                defaultValue={filters.paymentMethod}
                className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
              >
                <option value="">Semua metode</option>
                {Object.values(PaymentMethod).map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              <input
                name="from"
                type="date"
                defaultValue={filters.from}
                className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
              />
              <input
                name="to"
                type="date"
                defaultValue={filters.to}
                className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
              />
              <div className="flex gap-2">
                <button className="h-10 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-white">
                  Filter
                </button>
                <Link
                  href="/transactions"
                  className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-medium"
                >
                  Reset
                </Link>
              </div>
            </div>
          </form>

          <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold">
                Transaksi halaman {page} dari {pageCount}
              </h2>
              <Link
                href={`/transactions/export${getQueryString(filters)}`}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium hover:bg-[var(--surface-muted)]"
              >
                <Download size={15} />
                Export CSV
              </Link>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">
                Tidak ada transaksi untuk filter ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead className="bg-[var(--surface-muted)] text-left text-[var(--muted-foreground)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Waktu</th>
                      <th className="px-4 py-3 font-medium">Kasir</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
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
                          {transaction.customer?.name ?? "-"}
                        </td>
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
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass(
                              transaction.status
                            )}`}
                          >
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

            <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3 text-sm">
              {previousPage ? (
                <Link
                  href={`/transactions${getQueryString(filters, previousPage)}`}
                  className="rounded-md border border-[var(--border)] px-3 py-2 font-medium"
                >
                  Sebelumnya
                </Link>
              ) : (
                <span className="rounded-md border border-transparent px-3 py-2 text-[var(--subtle-foreground)]">
                  Sebelumnya
                </span>
              )}

              <span className="text-[var(--muted-foreground)]">
                {transactionCount} transaksi
              </span>

              {nextPage ? (
                <Link
                  href={`/transactions${getQueryString(filters, nextPage)}`}
                  className="rounded-md border border-[var(--border)] px-3 py-2 font-medium"
                >
                  Berikutnya
                </Link>
              ) : (
                <span className="rounded-md border border-transparent px-3 py-2 text-[var(--subtle-foreground)]">
                  Berikutnya
                </span>
              )}
            </div>
          </section>
        </div>
      </AppShell>
    </main>
  );
}
