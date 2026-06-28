import {
  PrismaClient,
  UserRole,
  StockMovementType,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Beras", slug: "beras", color: "#DDE8C8", icon: "wheat", sortOrder: 1 },
  { name: "Gula", slug: "gula", color: "#EEF2E3", icon: "package", sortOrder: 2 },
  { name: "Minyak", slug: "minyak", color: "#E7E0B8", icon: "droplets", sortOrder: 3 },
  { name: "Telur", slug: "telur", color: "#F2E4C9", icon: "egg", sortOrder: 4 },
  { name: "Mie Instan", slug: "mie-instan", color: "#F4D7B4", icon: "soup", sortOrder: 5 },
  { name: "Minuman", slug: "minuman", color: "#CFE2DA", icon: "cup-soda", sortOrder: 6 },
  { name: "Bumbu Dapur", slug: "bumbu-dapur", color: "#E9D4B5", icon: "cooking-pot", sortOrder: 7 },
  { name: "Snack", slug: "snack", color: "#EAD9C1", icon: "cookie", sortOrder: 8 },
  { name: "Perawatan Rumah", slug: "perawatan-rumah", color: "#D9E0D0", icon: "sparkles", sortOrder: 9 },
  { name: "Lainnya", slug: "lainnya", color: "#E7E8DE", icon: "boxes", sortOrder: 10 },
];

const units = [
  { name: "Pcs", code: "pcs" },
  { name: "Kilogram", code: "kg" },
  { name: "Gram", code: "gram" },
  { name: "Liter", code: "liter" },
  { name: "Mililiter", code: "ml" },
  { name: "Pack", code: "pack" },
  { name: "Dus", code: "dus" },
  { name: "Karung", code: "karung" },
];

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "owner@mypos.local" },
    update: {},
    create: {
      name: "Owner Toko",
      email: "owner@mypos.local",
      passwordHash: "change-this-password-hash",
      role: UserRole.OWNER,
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: unit,
      create: unit,
    });
  }

  const categoryBySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((category) => [category.slug, category])
  );
  const unitByCode = Object.fromEntries(
    (await prisma.unit.findMany()).map((unit) => [unit.code, unit])
  );

  const products = [
    {
      sku: "BR-RAMOS-5KG",
      name: "Beras Ramos 5kg",
      categorySlug: "beras",
      unitCode: "karung",
      costPrice: 62000,
      sellPrice: 69000,
      stockQuantity: 24,
      minStockQuantity: 5,
      isFavorite: true,
    },
    {
      sku: "GL-PASIR-1KG",
      name: "Gula Pasir 1kg",
      categorySlug: "gula",
      unitCode: "kg",
      costPrice: 15500,
      sellPrice: 17500,
      stockQuantity: 40,
      minStockQuantity: 8,
      isFavorite: true,
    },
    {
      sku: "MYK-GORENG-1L",
      name: "Minyak Goreng 1L",
      categorySlug: "minyak",
      unitCode: "liter",
      costPrice: 16500,
      sellPrice: 18500,
      stockQuantity: 36,
      minStockQuantity: 6,
      isFavorite: true,
    },
    {
      sku: "TLR-AYAM-1KG",
      name: "Telur Ayam / kg",
      categorySlug: "telur",
      unitCode: "kg",
      costPrice: 27000,
      sellPrice: 31000,
      stockQuantity: 18,
      minStockQuantity: 4,
      isFavorite: true,
    },
    {
      sku: "MIE-INDOMIE-GRG",
      name: "Indomie Goreng",
      categorySlug: "mie-instan",
      unitCode: "pcs",
      costPrice: 2900,
      sellPrice: 3500,
      stockQuantity: 120,
      minStockQuantity: 24,
      isFavorite: true,
    },
    {
      sku: "AM-600ML",
      name: "Air Mineral 600ml",
      categorySlug: "minuman",
      unitCode: "pcs",
      costPrice: 2400,
      sellPrice: 3500,
      stockQuantity: 96,
      minStockQuantity: 24,
      isFavorite: false,
    },
  ];

  for (const product of products) {
    const category = categoryBySlug[product.categorySlug];
    const unit = unitByCode[product.unitCode];

    if (!category || !unit) {
      throw new Error(`Missing category or unit for ${product.name}`);
    }

    const savedProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        categoryId: category.id,
        unitId: unit.id,
        costPrice: product.costPrice,
        sellPrice: product.sellPrice,
        stockQuantity: product.stockQuantity,
        minStockQuantity: product.minStockQuantity,
        isFavorite: product.isFavorite,
      },
      create: {
        sku: product.sku,
        name: product.name,
        categoryId: category.id,
        unitId: unit.id,
        costPrice: product.costPrice,
        sellPrice: product.sellPrice,
        stockQuantity: product.stockQuantity,
        minStockQuantity: product.minStockQuantity,
        isFavorite: product.isFavorite,
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId: savedProduct.id,
        type: StockMovementType.IN,
        quantity: product.stockQuantity,
        beforeQuantity: 0,
        afterQuantity: product.stockQuantity,
        referenceType: "seed",
        notes: "Initial seed stock",
        createdBy: admin.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
