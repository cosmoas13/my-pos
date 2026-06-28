import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My POS",
  description: "Aplikasi POS toko sembako berbasis Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
