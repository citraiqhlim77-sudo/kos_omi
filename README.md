# 🏠 Sistem Manajemen Reservasi, Pembayaran, dan Pengelolaan Kamar Kos Omi

**Sistem Manajemen Reservasi, Pembayaran, dan Pengelolaan Kamar Kos Omi (67 Kamar, Sungai Bangek, Padang — dekat Kampus III UIN Imam Bonjol Padang)** yang berlokasi di **Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586**.

Sistem ini mendigitalisasi seluruh siklus operasional hunian kos mulai dari katalog kamar publik *real-time* (menggunakan foto aset lokal `/rooms/kamar-1.png` s/d `/rooms/kamar-67.png`), registrasi akun calon penghuni, pengajuan reservasi berbasis **NIM & KTM/KRS**, verifikasi dokumen oleh pengelola, **pembayaran otomatis via Transfer Bank / Virtual Account (BCA, BRI, BNI, Mandiri, Permata), QRIS, serta E-Wallet (GoPay, ShopeePay) melalui Midtrans**, manajemen *check-in/check-out*, hingga **Lapisan Analitik Pengambilan Keputusan (*Decision Support System*)** bagi pengelola dan pemilik kos.

---

## ✨ Fitur Utama Sistem

### 1. Portal Pengunjung & Calon Penghuni (`CALON_PENGHUNI`)
- **Katalog 67 Kamar *Real-Time* (`/kamar`):** Menampilkan status ketersediaan kamar di **Lantai 1 (Kamar No. 1–33)** dan **Lantai 2 (Kamar No. 34–67)** beserta spesifikasi 9 fasilitas lengkap dan peta lokasi Google Maps interaktif.
- **Proteksi Akun Sebelum Pemesanan (`/daftar` & `/login`):** Pengunjung publik hanya dapat melihat katalog dan detail kamar dari luar, dan wajib mendaftarkan akun Calon Penghuni terlebih dahulu sebelum dapat mengajukan formulir reservasi kamar.
- **Reservasi Berbasis Privasi Mahasiswi (`/reservasi/[kodeKamar]`):** Menggunakan **NIM** dan unggahan berkas **KTM / KRS** (tanpa KTP/NIK) dengan skema sewa **1 Semester (6 Bulan)** seharga **Rp 5.000.000/semester** (1 kamar penuh) atau **Rp 2.500.000/semester** (1 slot patungan berdua) tanpa biaya deposit tambahan.
- **Dasbor Status & *Payment Gateway* Midtrans (`/calon/dashboard`):** Memantau *progress timeline* verifikasi berkas serta menyelesaikan pembayaran otomatis via **Transfer Bank / Virtual Account (`bca_va`, `bri_va`, `bni_va`, `echannel`, `permata_va`), QRIS (`qris`), serta E-Wallet (`gopay`, `shopeepay`) melalui Midtrans**.

### 2. Portal Pengelola Kos (`PENGELOLA`)
- **Dasbor Operasional & Analitik Lantai (`/pengelola/dashboard`):** Ringkasan tingkat keterisian 67 kamar, perbandingan okupansi **Lantai 1 (Kamar No. 1–33) vs Lantai 2 (Kamar No. 34–67)** beserta rekomendasi keputusan operasional, antrean verifikasi reservasi baru, dan kandidat siap *check-in*.
- **Manajemen Master Kamar (`/pengelola/kamar`):** Pembaruan status kamar (*Tersedia*, *Dipesan*, *Terisi*, *Dalam Perawatan*), tarif sewa semesteran, fasilitas, serta riwayat penghuni per kamar.
- **Verifikasi Berkas KTM/KRS (`/pengelola/reservasi`):** Pemeriksaan kelengkapan berkas mahasiswi untuk menyetujui reservasi (otomatis mengunci kamar menjadi *Dipesan* dan menerbitkan *Invoice* 24 jam) atau menolak dengan catatan resmi.
- **Operasional *Check-In*, Penghuni Aktif & *Check-Out* (`/pengelola/checkin`, `/pengelola/penghuni`, `/pengelola/checkout`):** Konfirmasi serah terima kunci kamar, pencatatan masa kontrak semester, hingga pelepasan kamar kembali ke status *Tersedia*.

### 3. Portal Staf Keuangan (`KEUANGAN`)
- **Dasbor Keuangan & Rekonsiliasi (`/keuangan/dashboard`):** Pemantauan pendapatan *real-time*, grafik tren tahun berjalan (2026), komposisi pemasukan **Sewa Semesteran (Rp 5.000.000/semester)**, distribusi saluran pembayaran, serta panel analitik pengambilan keputusan.
- **Monitoring Transaksi Gateway & Webhook (`/keuangan/transaksi`):** Pencatatan transaksi *settlement*, *pending*, dan *expire* beserta *payload* verifikasi tanda tangan SHA-512 Midtrans Snap.
- **Monitoring Tagihan & Pengingat WhatsApp (`/keuangan/tagihan`):** Pemantauan tagihan penghuni dan pengiriman pengingat tagihan otomatis via WhatsApp.
- **Rekap Laporan Harian/Bulanan & Ekspor CSV (`/keuangan/laporan`):** Agregasi laporan berzona waktu `Asia/Jakarta (WIB)` pada periode aktif **2026** dengan fitur ekspor **CSV (UTF-8 BOM Excel Compatible)**.

### 4. Portal Penghuni Aktif (`PENGHUNI`)
- **Dasbor & Informasi Kamar (`/penghuni/dashboard` & `/penghuni/kamar`):** Informasi masa kontrak sewa semester aktif, daftar inventaris fasilitas kamar, dan kontak pengelola.
- **Tagihan, Riwayat & Kuitansi PDF Resmi (`/penghuni/tagihan` & `/penghuni/riwayat`):** Pembayaran perpanjangan sewa semester serta pengunduhan/pencetakan **Kuitansi Resmi (PDF)** untuk setiap transaksi lunas.

### 5. Portal Administrator (`ADMIN`)
- **Pusat Kendali Sistem (`/admin/dashboard`):** Pemantauan menyeluruh 67 kamar, akun pengguna, pemasukan kas, dan status infrastruktur layanan.
- **Manajemen Pengguna & Hak Akses RBAC (`/admin/pengguna`):** Pengelolaan akun staf (*Pengelola*, *Staf Keuangan*, *Admin*) serta akun *Calon Penghuni* & *Penghuni Aktif*.
- **Pengaturan Kos, Log Audit & Monitoring Notifikasi (`/admin/pengaturan`, `/admin/log-aktivitas`, `/admin/notifikasi`):** Konfigurasi profil & rekening kos, rekam jejak audit (*audit trail*), serta pemantauan pengiriman notifikasi WhatsApp (Fonnte) dan Email (Resend).

### 6. Lapisan Analitik Pengambilan Keputusan (*Decision Support System*)
Modul analitik di `src/lib/reports/revenue.ts` menyediakan 3 fungsi indikator strategis beserta teks rekomendasi keputusan otomatis yang divisualisasikan di `/keuangan/dashboard`, `/keuangan/laporan`, dan `/pengelola/dashboard`:
1. **`getOccupancyAnalytics()`:** Menghitung persentase okupansi kamar secara total serta perbandingan tingkat hunian **Lantai 1 (Kamar No. 1–33)** vs **Lantai 2 (Kamar No. 34–67)**.
2. **`getCollectionRateAnalytics()`:** Menghitung rasio tagihan berstatus **`LUNAS`** dibandingkan **`TERLAMBAT` / `BELUM_BAYAR`** (*Collection Rate %*).
3. **`getReservationConversionAnalytics()`:** Menghitung rasio reservasi yang berhasil mencapai **`LUNAS` / `CHECKIN`** dibandingkan **`DITOLAK` / `KEDALUWARSA` / `DIBATALKAN`**.

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Dynamic Rendering) |
| **Bahasa Pemrograman** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS 3.4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/) |
| **Autentikasi & Otorisasi** | [Auth.js / NextAuth v5](https://authjs.dev/) (Role-Based Access Control 5 Peran & BcryptJS) |
| **Database & ORM** | [PostgreSQL (Neon Serverless)](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/) (dilengkapi *In-Memory Store Fallback* untuk demo instan) |
| **Payment Gateway** | [Midtrans Snap Sandbox](https://midtrans.com/) (`bca_va`, `bri_va`, `bni_va`, `echannel`, `permata_va`, `qris`, `gopay`, `shopeepay`) |
| **Notifikasi & Keamanan** | WhatsApp Gateway (Fonnte), Email (Resend), Rate Limiting (Upstash Redis), CSRF & Security Headers |
| **Testing** | [Vitest](https://vitest.dev/) (Unit Test) & [Playwright](https://playwright.dev/) (End-to-End Test) |

---

## 🚀 Petunjuk Instalasi & Menjalankan Proyek Secara Lokal

### 1. Prasyarat
- **Node.js** versi `18.18+` atau `20+`
- **npm** (bawaan Node.js)

### 2. Instalasi Dependensi
Clone repositori ini dan instal seluruh paket dependensi:

```bash
git clone <url-repositori-anda>
cd kos_omi
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Salin berkas `.env.example` menjadi `.env.local` di root proyek:

```bash
cp .env.example .env.local
```

Isi variabel pada `.env.local` mengacu pada `.env.example` (sistem tetap dapat berjalan 100% dalam mode *In-Memory Demo Sandbox* meskipun kredensial database/pihak ketiga dikosongkan):

```env
# URL Aplikasi & Secret Autentikasi Auth.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_SECRET="kos-omi-sungai-bangek-padang-secret-key-2026"

# Database PostgreSQL Neon / Lokal (Opsional - otomatis fallback ke In-Memory Store)
DATABASE_URL="postgresql://user:password@ep-example.ap-southeast-1.aws.neon.tech/kos_omi?sslmode=require"

# Midtrans Sandbox Payment Gateway
MIDTRANS_SERVER_KEY="SB-Mid-server-sample-key"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-sample-key"
MIDTRANS_IS_PRODUCTION="false"
```

### 4. Migrasi & Seed Database (Opsional untuk PostgreSQL)
Jika Anda menghubungkan `DATABASE_URL` ke PostgreSQL/Neon, jalankan skema dan *seeder* awal (apabila tanpa PostgreSQL, data 67 kamar dan studi kasus 2026 sudah otomatis di-seed ke *In-Memory Store* saat server berjalan):

```bash
npx drizzle-kit push
```

### 5. Menjalankan Aplikasi
Jalankan server pengembangan Next.js:

```bash
npm run dev
```

Buka browser dan akses **[http://localhost:3000](http://localhost:3000)**.

Untuk menjalankan pengujian unit test dan build produksi:

```bash
npm test
npm run build
```

---

## 🔐 Otorisasi & Peran Pengguna Sistem (RBAC)

Sistem menerapkan kontrol akses berbasis peran (*Role-Based Access Control*) untuk 5 peran pengguna melalui halaman `/login` (kredensial akun staf internal dikelola secara privat oleh Administrator Kos Omi):

| No | Peran (Role) | Deskripsi Akses | Rute Dasbor Utama |
| :-: | :--- | :--- | :--- |
| 1 | **Admin Utama (`ADMIN`)** | Manajemen pengguna lintas role, pengaturan sistem, & audit log | `/admin/dashboard` |
| 2 | **Pengelola Kos (`PENGELOLA`)** | Verifikasi reservasi, validasi pembayaran, kamar 1–67, & check-in/out | `/pengelola/dashboard` |
| 3 | **Staf Keuangan (`KEUANGAN`)** | Rekap pemasukan, analitik keputusan, & ekspor laporan Excel/CSV | `/keuangan/dashboard` |
| 4 | **Calon Penghuni (`CALON_PENGHUNI`)** | Pendaftaran mandiri (`/daftar`), pengajuan reservasi, & konfirmasi bayar | `/calon/dashboard` |
| 5 | **Penghuni Aktif (`PENGHUNI`)** | Informasi kamar aktif, tagihan semesteran, & cetak kuitansi resmi | `/penghuni/dashboard` |

---

## 👥 Tabel Kontribusi Anggota Kelompok 1

| No | Nama Anggota | NIM | Peran (Role) | Tanggung Jawab & Kontribusi Utama |
| :-: | :--- | :---: | :--- | :--- |
| 1 | **Muhammad Iqbal Alfares** | `2317020144` | **Project Manager** | Perencanaan arsitektur sistem, penyusunan kebutuhan bisnis & PRD Kos Omi 67 Kamar, manajemen jadwal proyek, serta perancangan modul analitik pendukung keputusan (*Decision Support System*). |
| 2 | **Suci Fitria Nurin** | `2317020062` | **UI/UX Designer** | Perancangan antarmuka responsif untuk 5 peran pengguna, desain visual katalog 67 kamar & alur reservasi berbasis KTM/KRS, serta desain pengalaman pembayaran (*Payment Gateway*). |
| 3 | **Citra Iqhlima** | `2317020041` | **Programmer** | Implementasi autentikasi & otorisasi multi-peran (RBAC), pengembangan portal Calon Penghuni & Pengelola Kos (Katalog, Reservasi, Verifikasi KTM/KRS, Check-in/Check-out), serta skema Drizzle ORM. |
| 4 | **Patmi Gusina** | `2317020040` | **Programmer & QA** | Implementasi portal Staf Keuangan, Penghuni Aktif & Administrator, integrasi Midtrans Snap & rekonsiliasi webhook SHA-512, ekspor laporan CSV UTF-8 BOM, serta pengujian kualitas sistem (*Unit & E2E Testing*). |

---

**Kos Putri Omi Sungai Bangek, Padang** — *Hunian Nyaman, Aman, dan Terintegrasi Digital dekat Kampus III UIN Imam Bonjol Padang.*
