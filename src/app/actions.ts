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
  customerName?: string;
  notes?: string;
  items: CheckoutItem[];
};

type CheckoutReceiptItem = {
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
};

type CheckoutReceipt = {
  saleId: string;
  invoiceNumber: string;
  createdAt: string;
  paymentMethod: "cash" | "qris";
  subtotal: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  items: CheckoutReceiptItem[];
};

function createInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `INV-${date}-${now.getTime().toString().slice(-6)}`;
}

function cleanOptionalText(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
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
    const receipt = await prisma.$transaction(async (tx) => {
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

      const customerName = cleanOptionalText(input.customerName);
      const customer = customerName
        ? await tx.customer.create({
            data: {
              name: customerName,
            },
          })
        : null;

      const createdSale = await tx.sale.create({
        data: {
          invoiceNumber: createInvoiceNumber(),
          cashierId: cashier.id,
          customerId: customer?.id,
          subtotal,
          totalAmount: subtotal,
          paidAmount,
          changeAmount: paidAmount - subtotal,
          paymentMethod,
          status: SaleStatus.COMPLETED,
          notes: cleanOptionalText(input.notes),
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

      return {
        saleId: createdSale.id,
        invoiceNumber: createdSale.invoiceNumber,
        createdAt: createdSale.createdAt.toISOString(),
        paymentMethod: input.paymentMethod,
        subtotal,
        totalAmount: subtotal,
        paidAmount,
        changeAmount: paidAmount - subtotal,
        items: saleItems.map((item) => ({
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount,
        })),
      } satisfies CheckoutReceipt;
    });

    revalidatePath("/");

    return {
      ok: true,
      message: `Transaksi ${receipt.invoiceNumber} berhasil disimpan.`,
      invoiceNumber: receipt.invoiceNumber,
      receipt,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Transaksi gagal disimpan.";

    return { ok: false, message };
  }
}

export async function updateSaleNotes(input: { saleId: string; notes: string }) {
  try {
    await prisma.sale.update({
      where: { id: input.saleId },
      data: {
        notes: cleanOptionalText(input.notes),
      },
    });

    revalidatePath("/transactions");
    revalidatePath(`/transactions/${input.saleId}`);

    return { ok: true, message: "Catatan transaksi berhasil disimpan." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Catatan gagal disimpan.";
    return { ok: false, message };
  }
}

export async function changeSaleStatus(input: {
  saleId: string;
  status: "VOIDED" | "REFUNDED";
  notes: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const actor = await tx.user.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });

      if (!actor) {
        throw new Error("User aktif belum tersedia.");
      }

      const sale = await tx.sale.findUnique({
        where: { id: input.saleId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!sale) {
        throw new Error("Transaksi tidak ditemukan.");
      }

      if (sale.status !== SaleStatus.COMPLETED) {
        throw new Error("Hanya transaksi selesai yang bisa diubah statusnya.");
      }

      const nextStatus =
        input.status === "REFUNDED" ? SaleStatus.REFUNDED : SaleStatus.VOIDED;
      const reason = cleanOptionalText(input.notes);

      for (const item of sale.items) {
        const beforeQuantity = Number(item.product.stockQuantity);
        const quantity = Number(item.quantity);
        const afterQuantity = beforeQuantity + quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: StockMovementType.RETURN,
            quantity,
            beforeQuantity,
            afterQuantity,
            referenceType: nextStatus === SaleStatus.REFUNDED ? "refund" : "void",
            referenceId: sale.id,
            notes:
              reason ??
              `${nextStatus === SaleStatus.REFUNDED ? "Refund" : "Void"} ${
                sale.invoiceNumber
              }`,
            createdBy: actor.id,
          },
        });
      }

      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: nextStatus,
          notes: reason ?? sale.notes,
        },
      });

      return updatedSale;
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath(`/transactions/${input.saleId}`);

    return {
      ok: true,
      message: `Transaksi ${result.invoiceNumber} berhasil diubah menjadi ${result.status}.`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Status transaksi gagal diubah.";
    return { ok: false, message };
  }
}

export async function recordReceiptPrint(input: { saleId: string }) {
  try {
    const actor = await prisma.user.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    if (!actor) {
      throw new Error("User aktif belum tersedia.");
    }

    const existingPrint = await prisma.receiptPrint.findFirst({
      where: {
        saleId: input.saleId,
        printedBy: actor.id,
      },
      orderBy: { printedAt: "desc" },
    });

    if (existingPrint) {
      await prisma.receiptPrint.update({
        where: { id: existingPrint.id },
        data: {
          printCount: {
            increment: 1,
          },
        },
      });
    } else {
      await prisma.receiptPrint.create({
        data: {
          saleId: input.saleId,
          printedBy: actor.id,
          printCount: 1,
        },
      });
    }

    revalidatePath(`/transactions/${input.saleId}`);

    return { ok: true, message: "Print struk tercatat." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Print struk gagal dicatat.";
    return { ok: false, message };
  }
}
