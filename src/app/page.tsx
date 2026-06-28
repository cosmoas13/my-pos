import { PosScreen, type PosCategory, type PosProduct } from "@/components/pos/pos-screen";
import { SaleStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function Home() {
  const [categories, products, todaySales, todayTransactions] =
    await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: true,
          unit: true,
        },
        orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
      }),
      prisma.sale.aggregate({
        where: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: startOfToday() },
        },
        _sum: { totalAmount: true },
      }),
      prisma.sale.count({
        where: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: startOfToday() },
        },
      }),
    ]);

  const productCounts = products.reduce<Record<string, number>>((counts, product) => {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    return counts;
  }, {});

  const posCategories: PosCategory[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    count: productCounts[category.id] ?? 0,
  }));

  const posProducts: PosProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    price: Number(product.sellPrice),
    unit: product.unit.code,
    stock: Number(product.stockQuantity),
    minStock: Number(product.minStockQuantity),
    isFavorite: product.isFavorite,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
  }));

  return (
    <PosScreen
      categories={posCategories}
      products={posProducts}
      summary={{
        todaySales: Number(todaySales._sum.totalAmount ?? 0),
        todayTransactions,
      }}
    />
  );
}
