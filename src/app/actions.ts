"use server";

import { revalidatePath } from "next/cache";

import {
  PaymentMethod,
  SaleStatus,
  StockMovementType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutInput = {
  paymentMethod: "cash" | "qris";
  paidAmount: number;
  items: CheckoutItem[];
};

function createInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `INV-${date}-${now.getTime().toString().slice(-6)}`;
}

export async function checkoutSale(input: CheckoutInput) {
  if (!input.items.length) {
    return { ok: false, message: "Keranjang masih kosong." };
  }

  const normalizedItems = input.items.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity),
  }));

  if (normalizedItems.some((item) => item.quantity <= 0)) {
    return { ok: false, message: "Jumlah item harus lebih dari 0." };
  }

  const paymentMethod =
    input.paymentMethod === "qris" ? PaymentMethod.QRIS : PaymentMethod.CASH;

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const cashier = await tx.user.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });

      if (!cashier) {
        throw new Error("User kasir belum tersedia. Jalankan seed data dulu.");
      }

      const products = await tx.product.findMany({
        where: {
          id: { in: normalizedItems.map((item) => item.productId) },
          isActive: true,
        },
      });

      if (products.length !== normalizedItems.length) {
        throw new Error("Ada produk yang tidak ditemukan atau tidak aktif.");
      }

      const productById = new Map(
        products.map((product) => [product.id, product])
      );

      const saleItems = normalizedItems.map((item) => {
        const product = productById.get(item.productId);

        if (!product) {
          throw new Error("Produk tidak ditemukan.");
        }

        const stock = Number(product.stockQuantity);
        if (stock < item.quantity) {
          throw new Error(`Stok ${product.name} tidak mencukupi.`);
        }

        const unitPrice = Number(product.sellPrice);
        const costPrice = Number(product.costPrice);
        const totalAmount = unitPrice * item.quantity;

        return {
          product,
          quantity: item.quantity,
          unitPrice,
          costPrice,
          totalAmount,
        };
      });

      const subtotal = saleItems.reduce(
        (total, item) => total + item.totalAmount,
        0
      );
      const paidAmount =
        paymentMethod === PaymentMethod.CASH ? Number(input.paidAmount) : subtotal;

      if (paymentMethod === PaymentMethod.CASH && paidAmount < subtotal) {
        throw new Error("Uang diterima kurang dari total pembayaran.");
      }

      const createdSale = await tx.sale.create({
        data: {
          invoiceNumber: createInvoiceNumber(),
          cashierId: cashier.id,
          subtotal,
          totalAmount: subtotal,
          paidAmount,
          changeAmount: paidAmount - subtotal,
          paymentMethod,
          status: SaleStatus.COMPLETED,
          items: {
            create: saleItems.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              sku: item.product.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              costPrice: item.costPrice,
              totalAmount: item.totalAmount,
            })),
          },
        },
      });

      for (const item of saleItems) {
        const beforeQuantity = Number(item.product.stockQuantity);
        const afterQuantity = beforeQuantity - item.quantity;

        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.product.id,
            type: StockMovementType.SALE,
            quantity: item.quantity,
            beforeQuantity,
            afterQuantity,
            referenceType: "sale",
            referenceId: createdSale.id,
            notes: `Penjualan ${createdSale.invoiceNumber}`,
            createdBy: cashier.id,
          },
        });
      }

      return createdSale;
    });

    revalidatePath("/");

    return {
      ok: true,
      message: `Transaksi ${sale.invoiceNumber} berhasil disimpan.`,
      invoiceNumber: sale.invoiceNumber,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Transaksi gagal disimpan.";

    return { ok: false, message };
  }
}
