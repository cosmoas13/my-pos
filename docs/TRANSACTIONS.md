# Transaction Flow

Dokumen ini menjelaskan cara memakai fitur transaksi di aplikasi POS.

## 1. Membuat Transaksi dari POS

1. Buka halaman POS:

```txt
http://localhost:3000
```

2. Pilih produk dari grid produk.
3. Produk akan masuk ke keranjang di sisi kanan.
4. Atur jumlah produk dengan tombol `+` dan `-`.
5. Isi `Customer opsional` jika ingin menyimpan nama customer.
6. Isi `Catatan opsional` jika ada catatan kasir.
7. Pilih metode pembayaran:
   - `Cash`
   - `QRIS`
8. Jika metode `Cash`, isi nominal `Uang diterima`.
9. Klik `Bayar`.

Saat checkout berhasil, sistem akan:

- menyimpan transaksi ke tabel `sales`;
- menyimpan item transaksi ke tabel `sale_items`;
- mengurangi stok produk;
- mencatat pergerakan stok tipe `SALE`;
- menampilkan ringkasan struk terakhir;
- memperbarui ringkasan penjualan hari ini.

## 2. Mencetak Struk Setelah Checkout

Setelah transaksi berhasil, panel `Struk terakhir` akan muncul di sisi kanan.

Klik `Print` untuk mencetak struk transaksi terakhir.

Saat tombol print dipakai, sistem juga mencatat print ke tabel `receipt_prints`.

## 3. Membuka Riwayat Transaksi

Buka halaman:

```txt
http://localhost:3000/transactions
```

Atau klik menu `Transaksi` di sidebar.

Halaman ini menampilkan daftar transaksi dengan informasi:

- invoice;
- waktu transaksi;
- kasir;
- customer;
- metode pembayaran;
- jumlah item;
- total;
- status;
- tombol detail.

## 4. Filter dan Search Transaksi

Di halaman riwayat transaksi, gunakan filter:

- search invoice, produk, SKU, kasir, atau customer;
- status transaksi;
- metode pembayaran;
- tanggal mulai;
- tanggal akhir.

Klik `Filter` untuk menerapkan filter.

Klik `Reset` untuk menghapus semua filter.

Daftar transaksi menggunakan pagination 20 transaksi per halaman.

## 5. Melihat Detail Transaksi

Dari halaman riwayat, klik `Detail`.

Halaman detail menampilkan:

- invoice;
- waktu;
- kasir;
- customer;
- metode bayar;
- status;
- item terjual;
- harga jual;
- harga modal;
- subtotal;
- diskon;
- pajak;
- total;
- uang dibayar;
- kembalian;
- estimasi laba kotor;
- catatan;
- total print struk.

## 6. Print Ulang Struk

Di halaman detail transaksi, klik:

```txt
Print ulang struk
```

Sistem akan:

- mencatat print ulang ke tabel `receipt_prints`;
- membuka dialog print browser;
- mencetak format struk khusus, bukan seluruh halaman detail.

## 7. Menyimpan Catatan Transaksi

Di halaman detail, gunakan panel `Catatan & status`.

1. Isi atau ubah catatan.
2. Klik `Simpan catatan`.

Catatan tersimpan ke kolom `notes` pada tabel `sales`.

## 8. Void Transaksi

Void digunakan untuk membatalkan transaksi yang sudah selesai.

1. Buka detail transaksi.
2. Isi alasan void di catatan.
3. Klik `Void transaksi`.

Saat transaksi di-void, sistem akan:

- mengubah status transaksi menjadi `VOIDED`;
- mengembalikan stok produk;
- mencatat pergerakan stok tipe `RETURN`;
- menyimpan catatan alasan void.

Transaksi yang sudah `VOIDED` tidak bisa diubah status lagi dari UI.

## 9. Refund Transaksi

Refund digunakan saat transaksi perlu dikembalikan.

1. Buka detail transaksi.
2. Isi alasan refund di catatan.
3. Klik `Refund`.

Saat transaksi di-refund, sistem akan:

- mengubah status transaksi menjadi `REFUNDED`;
- mengembalikan stok produk;
- mencatat pergerakan stok tipe `RETURN`;
- menyimpan catatan alasan refund.

Transaksi yang sudah `REFUNDED` tidak bisa diubah status lagi dari UI.

## 10. Export Transaksi

Di halaman riwayat transaksi, klik:

```txt
Export CSV
```

Export mengikuti filter yang sedang aktif.

File CSV berisi:

- invoice;
- waktu;
- kasir;
- customer;
- metode;
- status;
- jumlah item;
- subtotal;
- diskon;
- pajak;
- total;
- dibayar;
- kembalian;
- catatan.

CSV bisa dibuka menggunakan Excel atau spreadsheet lain.

## 11. Status Transaksi

Status yang dipakai:

- `COMPLETED`: transaksi berhasil dan stok sudah berkurang.
- `VOIDED`: transaksi dibatalkan dan stok sudah dikembalikan.
- `REFUNDED`: transaksi direfund dan stok sudah dikembalikan.

## 12. Catatan Penting

- Void dan refund hanya tersedia untuk transaksi berstatus `COMPLETED`.
- Void/refund mengembalikan stok penuh sesuai item transaksi.
- Saat ini refund belum mendukung refund parsial.
- Export transaksi saat ini memakai CSV. Export Excel `.xlsx` akan lebih cocok dikerjakan di modul laporan.
