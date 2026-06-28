import type React from "react";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react";

const navItems = [
  { label: "POS", href: "/", icon: ShoppingCart },
  { label: "Produk", href: "/products", icon: Package },
  { label: "Kategori", href: "/categories", icon: Tags },
  { label: "Stok", href: "/stock", icon: Boxes },
  { label: "Transaksi", href: "/transactions", icon: ReceiptText },
  { label: "Laporan", href: "/reports", icon: BarChart3 },
  { label: "Pengguna", href: "/users", icon: Users },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

export function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen print:block">
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === active;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium ${
                  isActive
                    ? "bg-[var(--primary-soft)] text-[#3F542E]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ClipboardList size={16} />
            Mode kerja
          </div>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {active}
          </p>
        </div>
      </aside>

      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
