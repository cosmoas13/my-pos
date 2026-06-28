"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Banknote,
  BarChart3,
  Boxes,
  CookingPot,
  CreditCard,
  Download,
  Droplets,
  Egg,
  Minus,
  Package,
  Plus,
  Printer,
  QrCode,
  Search,
  ShoppingCart,
  Soup,
  Trash2,
  Wheat,
} from "lucide-react";

import { checkoutSale } from "@/app/actions";
import { Button } from "@/components/ui/button";

export type PosCategory = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export type PosProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  unit: string;
  stock: number;
  minStock: number;
  isFavorite: boolean;
  categorySlug: string;
  categoryName: string;
};

export type PosSummary = {
  todaySales: number;
  todayTransactions: number;
};

type CartItem = PosProduct & {
  quantity: number;
};

type PaymentMethod = "cash" | "qris";

type ReceiptItem = {
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
};

type Receipt = {
  invoiceNumber: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  items: ReceiptItem[];
};

const navItems = ["POS", "Produk", "Stok", "Transaksi", "Laporan"];

const iconByCategory = {
  beras: Wheat,
  gula: Package,
  minyak: Droplets,
  telur: Egg,
  "mie-instan": Soup,
  "bumbu-dapur": CookingPot,
};

const toneByCategory: Record<string, string> = {
  beras: "bg-[#DDE8C8]",
  gula: "bg-[#EEF2E3]",
  minyak: "bg-[#E7E0B8]",
  telur: "bg-[#F2E4C9]",
  "mie-instan": "bg-[#F4D7B4]",
  "bumbu-dapur": "bg-[#E9D4B5]",
  minuman: "bg-[#CFE2DA]",
};

const dateLabel = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

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

export function PosScreen({
  categories,
  products,
  summary,
}: {
  categories: PosCategory[];
  products: PosProduct[];
  summary: PosSummary;
}) {
  const [activeCategory, setActiveCategory] = useState("favorit");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [lastInvoice, setLastInvoice] = useState("");
  const [lastReceipt, setLastReceipt] = useState<Receipt | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryTabs = useMemo(() => {
    const favoriteCount = products.filter((product) => product.isFavorite).length;
    return [
      { id: "favorit", name: "Favorit", count: favoriteCount },
      ...categories.map((category) => ({
        id: category.slug,
        name: category.name,
        count: category.count,
      })),
    ];
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchCategory =
        activeCategory === "favorit"
          ? product.isFavorite
          : product.categorySlug === activeCategory;
      const matchQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.sku?.toLowerCase().includes(normalizedQuery) ||
        product.barcode?.toLowerCase().includes(normalizedQuery);

      return matchCategory && matchQuery;
    });
  }, [activeCategory, products, query]);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const paid = Number(paidAmount || 0);
  const changeAmount = paymentMethod === "cash" ? Math.max(paid - subtotal, 0) : 0;
  const cashIsShort = paymentMethod === "cash" && cart.length > 0 && paid < subtotal;

  function addToCart(product: PosProduct) {
    setMessage("");
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity >= product.stock) {
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (product.stock <= 0) {
        return currentCart;
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function decreaseCart(productId: string) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId: string) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  }

  function handleCheckout() {
    setMessage("");

    startTransition(async () => {
      const result = await checkoutSale({
        paymentMethod,
        paidAmount: paymentMethod === "cash" ? paid : subtotal,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      setMessage(result.message);

      if (result.ok) {
        setCart([]);
        setPaidAmount("");
        setLastInvoice(result.invoiceNumber ?? "");
        setLastReceipt(result.receipt ?? null);
      }
    });
  }

  function handlePrint() {
    if (!lastReceipt) {
      setMessage("Belum ada struk transaksi untuk dicetak.");
      return;
    }

    window.print();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen print:hidden">
        <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-white/80 px-4 py-5 lg:block print:hidden">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Toko Sembako</p>
              <h1 className="text-xl font-semibold">My POS</h1>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item}
                className={`flex h-10 w-full items-center rounded-md px-3 text-left text-sm font-medium ${
                  item === "POS"
                    ? "bg-[var(--primary-soft)] text-[#3F542E]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 size={16} />
              Hari ini
            </div>
            <p className="mt-3 text-2xl font-semibold">
              {formatCurrency(summary.todaySales)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {summary.todayTransactions} transaksi selesai
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[var(--border)] bg-white/85 px-4 py-4 backdrop-blur md:px-6 print:hidden">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">
                  {dateLabel}
                </p>
                <h2 className="text-2xl font-semibold tracking-normal">
                  Kasir POS
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 sm:w-80">
                  <Search size={18} className="text-[var(--muted-foreground)]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--subtle-foreground)]"
                    placeholder="Cari produk, SKU, atau barcode"
                  />
                </label>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setMessage("Export laporan akan dibuat di modul laporan.")
                  }
                >
                  <Download size={17} />
                  Export
                </Button>
              </div>
            </div>
          </header>

          <div className="grid flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] print:block">
            <div className="min-w-0 px-4 py-5 md:px-6 print:hidden">
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                {categoryTabs.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`h-10 shrink-0 rounded-md border px-4 text-sm font-medium ${
                      activeCategory === category.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] bg-white text-[var(--muted-foreground)]"
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const Icon =
                    iconByCategory[
                      product.categorySlug as keyof typeof iconByCategory
                    ] ?? Package;
                  const tone = toneByCategory[product.categorySlug] ?? "bg-[#E7E8DE]";
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className="group min-h-44 rounded-lg border border-[var(--border)] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-lg ${tone} text-[#3F542E]`}
                        >
                          <Icon size={26} />
                        </div>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${
                            product.stock <= product.minStock
                              ? "bg-[#F7E8C8] text-[#8A5B12]"
                              : "bg-[var(--surface-muted)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          Stok {product.stock}
                        </span>
                      </div>
                      <div className="mt-5">
                        <h3 className="text-lg font-semibold leading-6">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          per {product.unit}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-semibold text-[var(--primary-hover)]">
                          {formatCurrency(product.price)}
                        </p>
                        <span className="text-sm font-medium text-[var(--primary)]">
                          {isOutOfStock ? "Habis" : "Tambah"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="border-t border-[var(--border)] bg-white px-4 py-5 xl:border-l xl:border-t-0 xl:px-5 print:border-0 print:bg-white">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Keranjang
                  </p>
                  <h2 className="text-xl font-semibold">
                    {lastInvoice || "Invoice baru"}
                  </h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[#3F542E] print:hidden">
                  <Boxes size={20} />
                </div>
              </div>

              <div className="space-y-3">
                {cart.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-5 text-center text-sm text-[var(--muted-foreground)] print:hidden">
                    Pilih produk untuk mulai transaksi.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                            {item.quantity} x {formatCurrency(item.price)}
                          </p>
                          <div className="mt-3 flex items-center gap-2 print:hidden">
                            <button
                              onClick={() => decreaseCart(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-white"
                            >
                              <Minus size={15} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-white"
                            >
                              <Plus size={15} />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-1 flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-white text-[var(--danger)]"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Diskon</span>
                  <span className="font-medium">Rp0</span>
                </div>
                {paymentMethod === "cash" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">
                        Dibayar
                      </span>
                      <span className="font-medium">{formatCurrency(paid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">
                        Kembalian
                      </span>
                      <span className="font-medium">
                        {formatCurrency(changeAmount)}
                      </span>
                    </div>
                  </>
                )}
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="flex items-end justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-semibold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 print:hidden">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex h-20 flex-col items-center justify-center gap-2 rounded-lg border text-sm font-semibold ${
                    paymentMethod === "cash"
                      ? "border-[var(--cash)] bg-[#F3F0D6] text-[#53602E]"
                      : "border-[var(--border)] bg-white text-[var(--muted-foreground)]"
                  }`}
                >
                  <Banknote size={22} />
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex h-20 flex-col items-center justify-center gap-2 rounded-lg border text-sm font-semibold ${
                    paymentMethod === "qris"
                      ? "border-[var(--qris)] bg-[#DCEBE6] text-[var(--qris)]"
                      : "border-[var(--border)] bg-white text-[var(--muted-foreground)]"
                  }`}
                >
                  <QrCode size={22} />
                  QRIS
                </button>
              </div>

              {paymentMethod === "cash" && (
                <label className="mt-4 block print:hidden">
                  <span className="mb-2 block text-sm font-medium">
                    Uang diterima
                  </span>
                  <input
                    value={paidAmount}
                    onChange={(event) => setPaidAmount(event.target.value)}
                    inputMode="numeric"
                    className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]"
                    placeholder="Contoh: 150000"
                  />
                </label>
              )}

              {message && (
                <p
                  className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                    message.includes("berhasil")
                      ? "border-[#BFD6AC] bg-[#EEF7E8] text-[#3F6C2F]"
                      : "border-[#E6C3BC] bg-[#FFF1EE] text-[#A63F31]"
                  }`}
                >
                  {message}
                </p>
              )}

              {lastReceipt && (
                <div className="mt-4 rounded-lg border border-[var(--border)] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Struk terakhir
                      </p>
                      <h3 className="mt-1 font-semibold">
                        {lastReceipt.invoiceNumber}
                      </h3>
                    </div>
                    <span className="rounded-md bg-[var(--primary-soft)] px-2 py-1 text-xs font-semibold uppercase text-[#3F542E]">
                      {lastReceipt.paymentMethod}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    {lastReceipt.items.map((item) => (
                      <div
                        key={`${lastReceipt.invoiceNumber}-${item.productName}-${item.sku}`}
                        className="flex justify-between gap-3"
                      >
                        <span className="min-w-0 truncate">
                          {item.quantity} x {item.productName}
                        </span>
                        <span className="shrink-0 font-medium">
                          {formatCurrency(item.totalAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-[var(--border)] pt-3">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(lastReceipt.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-3 print:hidden">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isPending || cart.length === 0 || cashIsShort}
                >
                  <CreditCard size={18} />
                  {isPending ? "Menyimpan..." : "Bayar"}
                </Button>
                <Button variant="secondary" size="lg" onClick={handlePrint}>
                  <Printer size={18} />
                  Print
                </Button>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {lastReceipt && (
        <section className="hidden bg-white p-6 text-black print:block">
          <div className="mx-auto max-w-sm font-mono text-sm">
            <div className="text-center">
              <h1 className="text-lg font-bold">My POS</h1>
              <p>Toko Sembako</p>
              <p className="mt-2">{lastReceipt.invoiceNumber}</p>
              <p>
                {receiptDateFormatter.format(new Date(lastReceipt.createdAt))}
              </p>
            </div>

            <div className="my-4 border-t border-dashed border-black" />

            <div className="space-y-3">
              {lastReceipt.items.map((item) => (
                <div
                  key={`print-${lastReceipt.invoiceNumber}-${item.productName}-${item.sku}`}
                >
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
                <span>{formatCurrency(lastReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(lastReceipt.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode</span>
                <span>{lastReceipt.paymentMethod.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Dibayar</span>
                <span>{formatCurrency(lastReceipt.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembalian</span>
                <span>{formatCurrency(lastReceipt.changeAmount)}</span>
              </div>
            </div>

            <div className="my-4 border-t border-dashed border-black" />

            <p className="text-center">Terima kasih</p>
          </div>
        </section>
      )}
    </main>
  );
}
