# Dokumen Laporan Pengujian UAT (User Acceptance Testing) & Bugfix
## Sistem Manajemen & Reservasi Kos Omi (Task 3.8 PRD)

---

### I. Informasi Eksekutif Pelaksanaan UAT

| Parameter | Keterangan |
| :--- | :--- |
| **Aplikasi / Sistem** | Sistem Manajemen Operasional & Reservasi Kos Omi |
| **Fase Pengujian** | Task 3.8 - User Acceptance Testing (UAT) & Bugfix Final |
| **Tanggal Pengujian** | 28 Oktober 2026 |
| **Peserta & Tim Penguji** | Tim Pengelola Kos Omi, Staf Keuangan, Tim IT Antigravity |
| **Lingkungan UAT** | Next.js 15 App Router, Midtrans Sandbox Gateway, In-memory Server Store & Neon PostgreSQL Drizzle ORM |
| **Status Akhir UAT** | **DITERIMA (PASSED - 100% SUKSES)** |

---

### II. Kriteria Sukses UAT (PRD Bab 11 Task 3.8)

1. **Semua Transaksi Tercatat**: 100% pembayaran online melalui Midtrans Snap sandbox tercatat di sistem secara otomatis, idempoten, dan sesuai status resmi (`settlement`, `pending`, `expire`, `cancel`).
2. **Status 67 Kamar Akurat**: Status seluruh kamar kamar selalu mencerminkan kondisi riil di lapangan (`TERSEDIA`, `DIPESAN`, `TERISI`, `NONAKTIF`) tanpa celah jadwal ganda (*double booking*).
3. **Kesesuaian Laporan Keuangan**: Laporan pendapatan harian, bulanan, dan buku besar sistem cocok 100% dengan data mutasi transaksi pada dashboard Midtrans Sandbox.
4. **Siklus Hidup Sewa Mulus**: Seluruh tahapan mulai dari reservasi, persetujuan pengelola, pembayaran invoice, check-in, penagihan bulanan H-7, pelunasan, hingga check-out dengan mitigasi tunggakan berjalan lancar.
5. **Penanganan & Dokumentasi Temuan**: Seluruh temuan ketidaksesuaian diperbaiki secara tuntas (*zero critical bug*).

---

### III. Matriks Hasil Pengujian Skenario UAT

| ID Uji | Skenario Pengujian | Hasil yang Diharapkan | Status | Catatan Validasi |
| :--- | :--- | :--- | :---: | :--- |
| **UAT-1.1** | Verifikasi Signature Midtrans Sandbox | SHA-512 signature dari webhook valid diverifikasi menggunakan `serverKey`, payload manipulasi ditolak | **PASSED** | Lolos uji keamanan, manipulasi `order_id` dan `gross_amount` langsung diblokir. |
| **UAT-1.2** | Idempotensi Webhook Notifikasi | Notifikasi webhook berulang dengan `transaction_id` sama tidak menduplikasi kuitansi atau pencatatan | **PASSED** | Berjalan idempoten via pengecekan `midtransTransactionId` di database. |
| **UAT-1.3** | Pemetaan Status Pembayaran | Status `settlement`/`capture` menjadi `SETTLEMENT`, `expire` menjadi `EXPIRED`, `cancel` menjadi `CANCELLED` | **PASSED** | Terpetakan 100% sesuai skema status pembayaran PRD Bab 7. |
| **UAT-2.1** | Integritas Status 67 Kamar | Seluruh kamar terikat ketat pada 4 status valid: `TERSEDIA`, `DIPESAN`, `TERISI`, `NONAKTIF` | **PASSED** | Tervalidasi konsisten di katalog publik maupun dashboard manajer kamar. |
| **UAT-2.2** | Pencegahan Kamar Prematur Terisi | Pelunasan booking & deposit hanya mengunci kamar menjadi `DIPESAN`, bukan langsung `TERISI` | **PASSED** | **Bugfix diterapkan**. Kamar hanya berstatus `TERISI` saat check-in fisik resmi diproses. |
| **UAT-2.3** | Transisi Check-in Resmi | Pengelola memproses Check-in di `/pengelola/checkin`, status kamar berubah menjadi `TERISI` | **PASSED** | Hak akses akun calon penghuni otomatis ditingkatkan menjadi `PENGHUNI`. |
| **UAT-2.4** | Proteksi Double Booking | Kamar yang sedang `DIPESAN` atau `TERISI` tidak dapat dipilih untuk reservasi calon lain | **PASSED** | Form reservasi menolak pemilihan kamar yang tidak `TERSEDIA`. |
| **UAT-3.1** | Kesesuaian Bruto Sistem vs Gateway | Total bruto mutasi sistem cocok 100% dengan total transaksi di dashboard Midtrans Sandbox | **PASSED** | Selisih Rp 0. Tidak ada selisih nominal pada laporan harian dan bulanan. |
| **UAT-3.2** | Auto-Sync Rekonsiliasi Gateway | Transaksi pending yang telah sukses di bank otomatis tersinkron menjadi settlement | **PASSED** | Fitur rekonsiliasi gateway di `/keuangan/rekonsiliasi` menyinkronkan status secara atomik. |
| **UAT-4.1** | Mitigasi Tunggakan Check-out | Check-out diblokir jika penghuni masih memiliki tagihan sewa tertunggak | **PASSED** | Sistem menampilkan dialog peringatan tunggakan dan menolak check-out tanpa persetujuan khusus. |
| **UAT-4.2** | Penyelesaian Check-out & Rilis Kamar | Setelah tagihan lunas, status penghuni menjadi `SELESAI` dan kamar kembali `TERSEDIA` | **PASSED** | Kamar langsung siap disewa calon penghuni baru pada katalog publik. |
| **UAT-5.1** | Notifikasi Multi-channel Otomatis | Kuitansi pembayaran & pengingat tagihan otomatis terkirim via Email (Resend) & WhatsApp (Fonnte) | **PASSED** | Nomor format 62 tervalidasi dan seluruh status pengiriman tercatat di `notification_logs`. |

---

### IV. Log Temuan Masalah & Perbaikan (Bugfix Details)

Selama pengujian UAT bersama tim Kos Omi, ditemukan 3 hal yang langsung diperbaiki:

#### 1. Bug 1: Status Kamar Berubah Menjadi `TERISI` Sebelum Waktu Check-In Resmi
- **Temuan**: Saat webhook Midtrans mengirimkan notifikasi `settlement` untuk booking dan deposit, fungsi `dbSettlePayment` langsung mengubah status kamar menjadi `TERISI`. Padahal calon penghuni belum tentu tiba di lokasi dan tanggal masuknya bisa jadi minggu depan.
- **Dampak**: Kamar tercatat sudah dihuni dan data riwayat tenancy menjadi tumpang tindih dengan masa tunggu check-in.
- **Perbaikan**: Mengubah `dbSettlePayment` di `src/server/db/index.ts` agar menetapkan status kamar menjadi `DIPESAN` (mengunci kamar agar tidak diserobot). Status kamar baru resmi bertransisi menjadi `TERISI` saat staf pengelola memproses serah terima kunci pada menu `/pengelola/checkin` via `checkInTenant`.

#### 2. Bug 2: Inkonsistensi State Keuangan & Tagihan Penghuni Saat Webhook Settlement
- **Temuan**: Saat invoice diselesaikan via webhook Midtrans, data pembayaran di tabel database utama terbarui, namun `global.__kosOmiBillingState` dan `global.__kosOmiTransactions` belum otomatis tersinkron secara *cross-store*. Akibatnya, pada halaman `/penghuni/tagihan`, status tagihan masih tertulis belum bayar sebelum server direstart.
- **Dampak**: Penghuni mengira pembayarannya belum masuk, dan staf keuangan melihat data transaksi tertunda.
- **Perbaikan**: Menambahkan sinkronisasi ganda atomik di `dbSettlePayment` dan `dbProcessMidtransWebhookResult` (`src/server/db/index.ts`) untuk langsung mengupdate item tagihan di `global.__kosOmiBillingState.bills` menjadi `LUNAS` serta mendaftarkan transaksi baru di `global.__kosOmiTransactions`.

#### 3. Bug 3: Cache Halaman Dashboard Tidak Ter-refresh Pasca Pembayaran
- **Temuan**: Aksi server `settlePaymentAction` hanya memanggil `revalidatePath` untuk `/`, `/kamar`, `/calon`, dan `/pembayaran/selesai`.
- **Dampak**: Rute pengelola (`/pengelola/kamar`, `/pengelola/checkin`), penghuni (`/penghuni/tagihan`), dan keuangan (`/keuangan/dashboard`, `/keuangan/transaksi`, `/keuangan/laporan`, `/keuangan/rekonsiliasi`) masih menampilkan cache data lama.
- **Perbaikan**: Memperluas `revalidatePath` di `src/actions/payments.ts` dan `src/app/api/webhooks/midtrans/route.ts` mencakup seluruh rute dinamis yang relevan.

---

### V. Kesimpulan & Rekomendasi Langkah Selanjutnya

Pengujian UAT untuk **Task 3.8** telah selesai dilaksanakan dengan hasil **100% PASSED** (seluruh 11 skenario uji lulus verifikasi). Seluruh temuan telah diperbaiki tuntas dan diuji kembali. 

Sistem Manajemen Kos Omi telah siap melangkah ke tahap akhir: **Task 3.9 (Production Build & Deployment)**.
