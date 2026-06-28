import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  buildTransactionWhere,
  getTransactionFilters,
} from "@/lib/transactions";

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const filters = getTransactionFilters(request.nextUrl.searchParams);
  const where = buildTransactionWhere(filters);

  const transactions = await prisma.sale.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      cashier: true,
      customer: true,
      items: true,
    },
  });

  const header = [
    "Invoice",
    "Waktu",
    "Kasir",
    "Customer",
    "Metode",
    "Status",
    "Jumlah Item",
    "Subtotal",
    "Diskon",
    "Pajak",
    "Total",
    "Dibayar",
    "Kembalian",
    "Catatan",
  ];

  const rows = transactions.map((transaction) => [
    transaction.invoiceNumber,
    transaction.createdAt.toISOString(),
    transaction.cashier.name,
    transaction.customer?.name ?? "",
    transaction.paymentMethod,
    transaction.status,
    transaction.items.length,
    Number(transaction.subtotal),
    Number(transaction.discountAmount),
    Number(transaction.taxAmount),
    Number(transaction.totalAmount),
    Number(transaction.paidAmount),
    Number(transaction.changeAmount),
    transaction.notes ?? "",
  ]);

  const csv = [
    header.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
