# PRD Aplikasi POS Toko Sembako

## 1. Ringkasan Produk

Aplikasi POS ini ditujukan untuk toko sembako yang menjual produk harian seperti beras, gula, minyak, telur, makanan ringan, minuman, bumbu dapur, dan kebutuhan rumah tangga. Fokus utama aplikasi adalah membantu kasir melakukan transaksi dengan cepat, pemilik toko memantau stok dan penjualan, serta menjaga data produk tetap rapi.

Produk awal akan dibuat sebagai aplikasi fullstack menggunakan Next.js, database PostgreSQL lokal, dan nantinya mudah dipindahkan ke Supabase.

## 2. Tujuan

- Mempercepat proses transaksi kasir.
- Membuat tampilan produk mudah dikenali melalui nama, kategori, warna, dan gambar.
- Mengelola stok barang toko sembako secara sederhana.
- Menyimpan riwayat transaksi dan detail item yang terjual.
- Menyediakan dasar data yang cocok untuk PostgreSQL dan Supabase.
- Menjadi aplikasi yang nyaman dipakai di desktop, laptop, dan tablet kasir.

## 3. Target Pengguna

- Kasir toko sembako.
- Pemilik toko.
- Admin yang mengelola produk, stok, dan laporan.

## 4. Rekomendasi Teknologi

### Frontend dan Backend

Rekomendasi utama:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma ORM atau Drizzle ORM

### Tailwind atau shadcn/ui?

Rekomendasi: gunakan keduanya.

Tailwind CSS cocok sebagai dasar styling karena fleksibel, ringan, dan mudah disesuaikan dengan desain toko sembako. shadcn/ui cocok untuk komponen siap pakai seperti button, dialog, table, dropdown, form, tabs, toast, dan modal.

Untuk aplikasi POS, shadcn/ui sangat membantu karena tampilannya bersih dan profesional, tetapi tetap bisa dikustom dengan Tailwind. Jadi pendekatan terbaik adalah:

- Tailwind CSS untuk layout, warna, spacing, responsive design, dan kartu produk.
- shadcn/ui untuk komponen interaktif seperti form, modal, table, drawer, tabs, alert, dan dialog.

## 5. Ruang Lingkup MVP

### Fitur Kasir

- Melihat daftar produk.
- Mencari produk berdasarkan nama, SKU, barcode, atau kategori.
- Menambahkan produk ke keranjang transaksi.
- Mengubah jumlah item di keranjang.
- Menghapus item dari keranjang.
- Menghitung subtotal, diskon, pajak opsional, dan total pembayaran.
- Memilih metode pembayaran cash atau QRIS.
- Menyelesaikan transaksi.
- Melihat struk sederhana setelah transaksi selesai.
- Mencetak struk pembayaran dari browser.

### Fitur Produk

- Menambah produk.
- Mengubah produk.
- Menghapus atau menonaktifkan produk.
- Mengatur harga jual.
- Mengatur harga modal.
- Mengatur stok.
- Mengatur satuan produk, contoh: pcs, kg, liter, dus, pack, karung.
- Mengatur kategori.
- Menyimpan URL gambar produk opsional tanpa upload file.
- Jika URL gambar kosong, produk memakai ikon bawaan berdasarkan kategori.

### Fitur Stok

- Melihat stok tersedia.
- Menandai stok minimum.
- Peringatan stok rendah.
- Mencatat perubahan stok masuk dan stok keluar.

### Fitur Laporan Dasar

- Total penjualan harian.
- Jumlah transaksi harian.
- Total penjualan mingguan.
- Total penjualan bulanan.
- Produk terlaris.
- Estimasi laba kotor dari harga jual dikurangi harga modal.
- Export laporan harian, mingguan, dan bulanan ke Excel.

### Fitur User

- Login.
- Role admin, owner, dan cashier.
- Admin/owner dapat mengelola produk dan laporan.
- Cashier fokus ke transaksi.

## 6. Di Luar Scope MVP

Fitur berikut bisa dibuat setelah MVP stabil:

- Multi cabang.
- Manajemen supplier lengkap.
- Hutang/piutang pelanggan.
- Cetak struk thermal printer dengan format khusus 58mm/80mm.
- Barcode scanner fisik.
- Pembayaran transfer bank dan debit.
- Integrasi payment gateway.
- Offline mode.
- Sinkronisasi cloud otomatis.
- Akuntansi lengkap.

## 7. Alur Utama Kasir

1. Kasir membuka halaman POS.
2. Kasir mencari atau memilih produk.
3. Produk masuk ke keranjang.
4. Kasir mengatur jumlah barang.
5. Sistem menghitung total.
6. Kasir memilih metode pembayaran.
7. Kasir memasukkan nominal uang diterima jika pembayaran tunai.
8. Sistem menghitung kembalian.
9. Kasir menyelesaikan transaksi.
10. Stok produk otomatis berkurang.
11. Transaksi tersimpan ke database.
12. Kasir dapat mencetak struk pembayaran.

## 8. Rekomendasi Tampilan

### Prinsip UI

Tampilan POS harus cepat dibaca, tidak terlalu dekoratif, dan nyaman dipakai berulang kali. Karena targetnya toko sembako, UI sebaiknya terasa bersih, hangat, praktis, dan punya nuansa matcha yang sedikit gelap tetapi tetap terang di area kerja utama.

Rekomendasi karakter visual:

- Produk ditampilkan dalam grid dengan nama besar dan gambar.
- Kategori mudah dipilih lewat tab atau sidebar.
- Keranjang selalu terlihat di sisi kanan pada desktop.
- Tombol pembayaran dibuat menonjol.
- Warna stok rendah harus jelas.
- Hindari tampilan terlalu gelap karena kasir biasanya bekerja lama di layar.

### Layout Halaman POS

Desktop/tablet landscape:

- Kiri: kategori dan daftar produk.
- Tengah: grid produk.
- Kanan: keranjang transaksi dan tombol checkout.

Tablet/mobile:

- Produk menjadi layar utama.
- Keranjang dibuka melalui drawer bawah atau tombol cart.
- Checkout tetap mudah dijangkau.

### Metode Pembayaran MVP

Metode pembayaran awal dibuat sederhana agar proses kasir cepat dan implementasi tidak terlalu melebar.

Aktif di MVP:

- Cash
- QRIS

Ditahan untuk fase berikutnya:

- Transfer bank
- Debit
- Metode pembayaran lain

Aturan tampilan:

- Pada halaman POS, pilihan pembayaran hanya menampilkan Cash dan QRIS.
- Jika memilih Cash, kasir memasukkan uang diterima dan sistem menghitung kembalian.
- Jika memilih QRIS, kasir cukup menandai pembayaran sebagai diterima.
- Transfer bank dan debit tetap dicatat di PRD sebagai roadmap, tetapi belum muncul di UI MVP.

### Kartu Produk

Setiap kartu produk sebaiknya memuat:

- Gambar produk dari URL atau ikon fallback.
- Nama produk.
- Harga jual.
- Satuan.
- Indikator stok.

Contoh label:

- Beras Ramos 5kg
- Gula Pasir 1kg
- Minyak Goreng 1L
- Telur Ayam / kg
- Indomie Goreng

## 9. Rekomendasi Warna

Palet yang direkomendasikan: matcha retail palette. Nuansanya hijau matcha yang sedikit gelap, tetapi keseluruhan UI tetap terang, bersih, dan nyaman dilihat lama oleh kasir.

### Warna Utama

- Primary: `#5E7C45` Matcha Olive
- Primary hover: `#4D6538` Deep Matcha
- Primary soft: `#DDE8C8` Soft Matcha
- Background: `#F7F8F1` Warm Matcha White
- Surface/card: `#FFFFFF`
- Surface muted: `#EEF2E3` Pale Sage
- Border: `#D8DEC8` Sage Border
- Text utama: `#25311D` Dark Olive
- Text sekunder: `#66735A` Muted Olive
- Text subtle: `#8A947D` Soft Olive Gray

### Warna Aksen

- Success: `#4F8A3D` Fresh Leaf
- Warning: `#D99A27` Honey Amber
- Danger: `#C94A3A` Soft Red
- Info/category: `#4C8C7A` Sage Teal
- QRIS accent: `#2F6F5E` Deep Teal
- Cash accent: `#6F7F3F` Olive Gold

### Penggunaan Warna

- Matcha olive untuk aksi utama seperti checkout, simpan, dan bayar.
- Deep matcha untuk hover, active state, dan emphasis kecil.
- Dark olive untuk warna font utama agar tetap terbaca jelas.
- Muted olive untuk teks sekunder seperti SKU, satuan, catatan, dan metadata.
- Soft matcha atau pale sage untuk highlight kategori, selected tab, dan background area ringan.
- Fresh leaf untuk status sukses dan stok aman.
- Honey amber untuk stok rendah.
- Soft red untuk stok habis, hapus item, atau transaksi gagal.
- Deep teal untuk status pembayaran QRIS.
- Olive gold untuk status pembayaran cash.

### Panduan Warna Font

- Heading utama menggunakan `#25311D`.
- Body text menggunakan `#33412A` atau `#25311D`.
- Teks sekunder menggunakan `#66735A`.
- Placeholder dan hint menggunakan `#8A947D`.
- Teks pada tombol primary menggunakan `#FFFFFF`.
- Teks pada badge soft matcha menggunakan `#3F542E`.
- Hindari teks abu-abu murni yang terlalu dingin; gunakan olive-gray agar tetap menyatu dengan tema matcha.

Catatan: Palet matcha harus terasa eyecatching, tetapi tidak boleh membuat aplikasi terlalu gelap. Area kerja utama tetap memakai background terang, sedangkan warna matcha yang lebih gelap dipakai untuk teks, tombol utama, badge, tab aktif, dan aksen status.

## 10. Rekomendasi Navigasi

Menu utama:

- POS
- Produk
- Kategori
- Stok
- Transaksi
- Laporan
- Pengguna
- Pengaturan

Untuk MVP, menu yang paling penting:

- POS
- Produk
- Stok
- Transaksi
- Laporan

## 11. Schema Backend PostgreSQL

Schema ini dirancang agar cocok untuk PostgreSQL lokal dan mudah dipindah ke Supabase.

### users

Menyimpan user aplikasi.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| name | varchar(120) | Nama user |
| email | varchar(160) | Unique |
| password_hash | text | Untuk auth lokal jika belum pakai Supabase Auth |
| role | user_role | owner, admin, cashier |
| is_active | boolean | Default true |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

### categories

Menyimpan kategori produk.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| name | varchar(120) | Contoh: Beras, Minyak, Makanan |
| slug | varchar(140) | Unique |
| color | varchar(20) | Optional, untuk warna kategori |
| icon | varchar(80) | Optional |
| sort_order | integer | Default 0 |
| is_active | boolean | Default true |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

### units

Menyimpan satuan produk.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| name | varchar(80) | Contoh: Kilogram, Liter, Pcs |
| code | varchar(20) | Contoh: kg, l, pcs |
| created_at | timestamptz | Default now |

### products

Menyimpan data produk.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| category_id | uuid | FK ke categories |
| unit_id | uuid | FK ke units |
| sku | varchar(80) | Unique, optional |
| barcode | varchar(120) | Unique, optional |
| name | varchar(180) | Nama produk |
| description | text | Optional |
| image_url | text | Optional |
| cost_price | numeric(14,2) | Harga modal |
| sell_price | numeric(14,2) | Harga jual |
| stock_quantity | numeric(14,3) | Mendukung kg/liter |
| min_stock_quantity | numeric(14,3) | Batas stok rendah |
| is_active | boolean | Default true |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

Catatan: `stock_quantity` memakai numeric agar bisa menyimpan stok pecahan seperti 0.5 kg.

### customers

Opsional untuk MVP, tetapi disiapkan jika nanti toko ingin mencatat pelanggan.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| name | varchar(140) | Nama pelanggan |
| phone | varchar(40) | Optional |
| address | text | Optional |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

### sales

Menyimpan transaksi utama.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| invoice_number | varchar(60) | Unique |
| cashier_id | uuid | FK ke users |
| customer_id | uuid | FK ke customers, optional |
| subtotal | numeric(14,2) | Total sebelum diskon/pajak |
| discount_amount | numeric(14,2) | Default 0 |
| tax_amount | numeric(14,2) | Default 0 |
| total_amount | numeric(14,2) | Total akhir |
| paid_amount | numeric(14,2) | Uang diterima |
| change_amount | numeric(14,2) | Kembalian |
| payment_method | payment_method | MVP: cash, qris. Future: transfer, debit, other |
| status | sale_status | completed, voided, refunded |
| notes | text | Optional |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

### receipt_prints

Mencatat aktivitas cetak struk. Ini berguna untuk audit jika kasir mencetak ulang struk.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| sale_id | uuid | FK ke sales |
| printed_by | uuid | FK ke users |
| print_count | integer | Default 1 |
| paper_size | varchar(20) | Contoh: a4, 58mm, 80mm |
| printed_at | timestamptz | Default now |

### sale_items

Menyimpan detail produk dalam transaksi.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| sale_id | uuid | FK ke sales |
| product_id | uuid | FK ke products |
| product_name | varchar(180) | Snapshot nama saat transaksi |
| sku | varchar(80) | Snapshot SKU |
| quantity | numeric(14,3) | Jumlah dibeli |
| unit_price | numeric(14,2) | Harga jual saat transaksi |
| cost_price | numeric(14,2) | Harga modal saat transaksi |
| discount_amount | numeric(14,2) | Diskon per item |
| total_amount | numeric(14,2) | Total item |
| created_at | timestamptz | Default now |

Catatan: `product_name`, `unit_price`, dan `cost_price` disimpan sebagai snapshot agar laporan transaksi lama tidak berubah jika data produk diubah.

### stock_movements

Mencatat semua perubahan stok.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| product_id | uuid | FK ke products |
| type | stock_movement_type | in, out, adjustment, sale, return |
| quantity | numeric(14,3) | Jumlah perubahan |
| before_quantity | numeric(14,3) | Stok sebelum |
| after_quantity | numeric(14,3) | Stok sesudah |
| reference_type | varchar(60) | Contoh: sale, manual_adjustment |
| reference_id | uuid | ID transaksi/referensi |
| notes | text | Optional |
| created_by | uuid | FK ke users |
| created_at | timestamptz | Default now |

### suppliers

Opsional untuk MVP lanjutan.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| name | varchar(160) | Nama supplier |
| phone | varchar(40) | Optional |
| address | text | Optional |
| notes | text | Optional |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

### purchases

Opsional untuk mencatat pembelian stok dari supplier.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| supplier_id | uuid | FK ke suppliers |
| invoice_number | varchar(80) | Optional |
| total_amount | numeric(14,2) | Total pembelian |
| notes | text | Optional |
| created_by | uuid | FK ke users |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |

### purchase_items

Opsional untuk detail pembelian stok.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| purchase_id | uuid | FK ke purchases |
| product_id | uuid | FK ke products |
| quantity | numeric(14,3) | Jumlah |
| unit_cost | numeric(14,2) | Harga modal |
| total_amount | numeric(14,2) | Total |
| created_at | timestamptz | Default now |

### report_exports

Mencatat riwayat export laporan agar owner/admin bisa melihat siapa yang pernah mengambil data.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| report_type | varchar(60) | daily_sales, weekly_sales, monthly_sales, stock, products |
| date_from | date | Tanggal awal laporan |
| date_to | date | Tanggal akhir laporan |
| file_format | varchar(20) | xlsx atau csv |
| exported_by | uuid | FK ke users |
| created_at | timestamptz | Default now |

## 12. Enum Database

### user_role

- owner
- admin
- cashier

### payment_method

- cash
- qris
- transfer
- debit
- other

Catatan MVP:

- Metode pembayaran yang aktif di aplikasi awal hanya `cash` dan `qris`.
- `transfer`, `debit`, dan `other` disiapkan di PRD untuk pengembangan berikutnya, tetapi belum ditampilkan sebagai pilihan pembayaran pada MVP.

### sale_status

- completed
- voided
- refunded

### stock_movement_type

- in
- out
- adjustment
- sale
- return

## 13. Relasi Utama

- Satu kategori memiliki banyak produk.
- Satu satuan memiliki banyak produk.
- Satu transaksi memiliki banyak item transaksi.
- Satu produk bisa muncul di banyak item transaksi.
- Satu transaksi dibuat oleh satu kasir.
- Satu produk memiliki banyak catatan pergerakan stok.
- Satu user dapat membuat banyak stock movement.

## 14. Index yang Direkomendasikan

- `products.name`
- `products.sku`
- `products.barcode`
- `products.category_id`
- `sales.invoice_number`
- `sales.cashier_id`
- `sales.created_at`
- `sale_items.sale_id`
- `sale_items.product_id`
- `receipt_prints.sale_id`
- `stock_movements.product_id`
- `stock_movements.created_at`
- `report_exports.report_type`
- `report_exports.created_at`

## 15. Validasi Bisnis

- Produk tidak boleh dijual jika `is_active = false`.
- Stok tidak boleh minus untuk produk stok fisik.
- Harga jual tidak boleh kurang dari 0.
- Quantity transaksi harus lebih dari 0.
- Transaksi tunai harus menghitung kembalian dari `paid_amount - total_amount`.
- Setelah transaksi selesai, stok produk otomatis berkurang.
- Setiap perubahan stok harus tercatat di `stock_movements`.
- Invoice number harus unik.
- Struk hanya dapat dicetak untuk transaksi yang sudah selesai.
- Cetak ulang struk harus tercatat di `receipt_prints`.
- Export laporan hanya dapat dilakukan oleh role owner atau admin.
- Rentang tanggal export laporan wajib valid dan tidak boleh kosong.

## 16. Rekomendasi Data Awal

Kategori awal:

- Beras
- Gula
- Minyak
- Telur
- Mie Instan
- Minuman
- Bumbu Dapur
- Snack
- Perawatan Rumah
- Lainnya

Satuan awal:

- pcs
- kg
- gram
- liter
- ml
- pack
- dus
- karung

## 17. Halaman Aplikasi

### POS

Halaman utama transaksi kasir.

Komponen:

- Search produk.
- Filter kategori.
- Grid produk.
- Keranjang.
- Ringkasan total.
- Pilihan metode pembayaran cash dan QRIS.
- Tombol checkout.
- Preview struk setelah transaksi selesai.
- Tombol print struk.

### Produk

Halaman pengelolaan produk.

Komponen:

- Tabel produk.
- Filter kategori.
- Search produk.
- Form tambah/edit produk.
- Indikator stok rendah.

### Stok

Halaman monitoring stok.

Komponen:

- Daftar stok produk.
- Filter stok rendah.
- Form penyesuaian stok.
- Riwayat perubahan stok.

### Transaksi

Halaman riwayat transaksi.

Komponen:

- Tabel transaksi.
- Filter tanggal.
- Detail transaksi.
- Status transaksi.
- Cetak ulang struk transaksi.

### Laporan

Halaman ringkasan performa toko.

Komponen:

- Total penjualan hari ini.
- Total penjualan minggu ini.
- Total penjualan bulan ini.
- Jumlah transaksi.
- Produk terlaris.
- Laba kotor.
- Grafik penjualan sederhana.
- Filter tanggal custom.
- Export Excel untuk laporan harian, mingguan, dan bulanan.
- Export Excel untuk daftar produk dan stok.

### Struk Pembayaran

Struk pembayaran harus ringkas dan mudah dibaca.

Isi struk:

- Nama toko.
- Alamat atau nomor kontak toko.
- Nomor invoice.
- Tanggal dan jam transaksi.
- Nama kasir.
- Daftar produk, jumlah, harga, dan subtotal.
- Diskon jika ada.
- Total pembayaran.
- Metode pembayaran.
- Uang diterima dan kembalian untuk pembayaran tunai.
- Catatan terima kasih.

Format print awal:

- Browser print biasa untuk MVP.
- Layout thermal 58mm/80mm disiapkan sebagai fase lanjutan.
- Struk dapat dicetak ulang dari halaman transaksi.

### Export Laporan

Format export yang direkomendasikan:

- Excel `.xlsx` sebagai format utama.
- CSV sebagai opsi tambahan jika dibutuhkan.

Jenis export:

- Laporan penjualan harian.
- Laporan penjualan mingguan.
- Laporan penjualan bulanan.
- Laporan produk terlaris.
- Laporan stok rendah.
- Laporan pergerakan stok.

Kolom minimal laporan penjualan:

- Tanggal transaksi.
- Nomor invoice.
- Nama kasir.
- Metode pembayaran cash atau QRIS.
- Jumlah item.
- Subtotal.
- Diskon.
- Pajak.
- Total.
- Estimasi laba kotor.

## 18. Pertimbangan Supabase

Jika nanti pindah ke Supabase:

- Gunakan PostgreSQL schema yang sama.
- Pertimbangkan Supabase Auth untuk menggantikan `password_hash`.
- Gunakan Row Level Security setelah role dan akses sudah jelas.
- Gambar produk dapat disimpan di Supabase Storage.
- Local development bisa tetap pakai PostgreSQL Docker atau database lokal.

## 19. Ide Tambahan yang Direkomendasikan

Fitur berikut menurutku layak dipertimbangkan karena sangat berguna untuk operasional toko sembako.

### Rekap Shift Kasir

Kasir membuka dan menutup shift kerja. Saat tutup shift, sistem mencatat total transaksi, total tunai, total non-tunai, dan selisih uang kas.

Manfaat:

- Pemilik toko lebih mudah mengecek uang kas.
- Cocok jika toko punya lebih dari satu kasir.
- Membantu audit transaksi harian.

### Retur atau Pembatalan Transaksi

Transaksi yang salah bisa dibatalkan atau diretur dengan alasan yang jelas.

Manfaat:

- Stok dapat dikembalikan otomatis.
- Riwayat transaksi tetap rapi.
- Mengurangi risiko transaksi dihapus tanpa jejak.

### Stok Opname

Admin dapat menghitung stok fisik lalu mencocokkannya dengan stok sistem.

Manfaat:

- Berguna untuk toko sembako karena stok barang bisa cepat berubah.
- Membantu menemukan selisih stok.
- Cocok dilakukan mingguan atau bulanan.

### Harga Grosir dan Eceran

Produk tertentu bisa punya harga berbeda, misalnya harga per pcs, per pack, atau per dus.

Manfaat:

- Cocok untuk sembako yang sering dijual satuan dan grosir.
- Kasir tidak perlu menghafal harga berbeda.

### Produk Favorit

Produk yang sering dibeli bisa ditampilkan di area khusus pada halaman POS.

Manfaat:

- Mempercepat transaksi barang populer seperti beras, gula, minyak, telur, mie instan, dan air mineral.

### Backup dan Export Data

Selain export laporan, owner bisa export data penting seperti produk, stok, dan transaksi.

Manfaat:

- Data toko lebih aman.
- Memudahkan migrasi dari lokal ke Supabase.

## 20. Pertanyaan Lanjutan

Beberapa keputusan yang perlu dikunci sebelum coding:

- Apakah aplikasi hanya untuk satu toko atau nantinya multi cabang?
- Apakah produk wajib punya barcode?
- Apakah stok boleh minus dalam kondisi tertentu?
- Apakah harga bisa diubah saat transaksi oleh kasir?
- Apakah diskon dibutuhkan di MVP?
- Apakah QRIS pada MVP cukup dicatat manual, atau perlu upload bukti pembayaran?
- Kapan pembayaran transfer bank dan debit mulai diaktifkan?
- Apakah struk perlu dicetak langsung ke thermal printer?
- Apakah cetak struk MVP cukup lewat browser print dulu?
- Apakah laporan export cukup Excel `.xlsx`, atau perlu CSV juga?
- Apakah perlu rekap shift kasir sejak MVP?
- Apakah retur transaksi perlu masuk MVP?
- Apakah auth awal mau pakai custom login atau langsung Supabase Auth?

## 21. Rekomendasi Tahap Implementasi

Tahap 1:

- Setup Next.js, Tailwind CSS, shadcn/ui, PostgreSQL, ORM.
- Buat schema database.
- Buat seed kategori, satuan, dan produk contoh.

Tahap 2:

- Buat halaman POS.
- Buat transaksi dan pengurangan stok.
- Buat riwayat transaksi.
- Buat preview dan print struk dari browser.

Tahap 3:

- Buat manajemen produk.
- Buat manajemen stok.
- Buat laporan dasar.
- Buat export Excel laporan harian, mingguan, dan bulanan.

Tahap 4:

- Tambahkan role user.
- Tambahkan auth.
- Siapkan migrasi ke Supabase.
- Tambahkan fitur lanjutan seperti rekap shift, retur transaksi, dan stok opname.
