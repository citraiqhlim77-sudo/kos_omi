# Laporan Pengujian Black-Box Testing — Sistem Informasi Kos Omi

- **Nama Sistem:** Sistem Informasi Manajemen Kos Omi (Sungai Bangek, Padang)
- **URL Produksi:** https://kos-omi-padang.netlify.app
- **Metode Pengujian:** Black-Box Testing (*Equivalence Partitioning*, *Boundary Value Analysis*, dan *State Transition Testing*)
- **Tanggal Pengujian:** 27 November 2026
- **Lingkup Role:** 5 Role (`Calon Penghuni`, `Penghuni Aktif`, `Pengelola Kos`, `Staf Keuangan`, `Admin Sistem`)
- **Eksekusi Otomatis:** Vitest Test Runner (`tests/unit/blackbox-system.test.ts`, `five-roles-sync.test.ts`, `room-status-transition.test.ts`, `billing-calculation.test.ts`, `midtrans-signature.test.ts`)

---

## 1. Tabel Hasil Pengujian Black-Box (Siap Salin ke Laporan)

### A. Modul Autentikasi & Akun Pengguna

| Kode | Fitur / Skenario Uji | Teknik Uji | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **BB-01** | Registrasi akun Calon Penghuni valid | Equivalence Partitioning | Nama lengkap, email valid (`@gmail.com`), no. WA aktif, kata sandi & konfirmasi cocok | Akun berhasil dibuat, tersimpan di Neon PostgreSQL dengan hash Bcrypt, dan tampil di daftar Pengelola & Admin | Sesuai harapan (terverifikasi di `blackbox-system.test.ts` & `five-roles-sync.test.ts`) | **VALID** |
| **BB-02** | Registrasi dengan typo domain email | Equivalence Partitioning | Email berakhiran `.con` (mis. `citra@gmail.con`) | Sistem menolak registrasi dan menampilkan pesan peringatan kesalahan domain email | Sesuai harapan — input ditolak oleh validasi Zod | **VALID** |
| **BB-03** | Registrasi dengan konfirmasi sandi tidak cocok | Equivalence Partitioning | Kata sandi `Password123!`, konfirmasi `Berbeda123!` | Sistem menolak registrasi dan menampilkan pesan kata sandi tidak cocok | Sesuai harapan — input ditolak | **VALID** |
| **BB-04** | Login dengan format email tidak valid | Equivalence Partitioning | Email `bukan-email`, kata sandi acak | Sistem menolak login dan menampilkan pesan format email tidak valid | Sesuai harapan — input ditolak | **VALID** |
| **BB-05** | Pemulihan Lupa Kata Sandi via Admin | Functional Testing | Input email terdaftar di `/lupa-password` | Sistem mencatat permintaan reset pada `notification_logs` & `audit_logs`, lalu menampilkan tombol WhatsApp Admin Kos | Sesuai harapan — tercatat di log Admin | **VALID** |
| **BB-06** | Reset Kata Sandi Pengguna oleh Admin | Functional Testing | Admin klik **Reset Sandi** di `/admin/pengguna` | Kata sandi baru di-hash dengan Bcrypt (tanpa plaintext), pengguna dapat login kembali | Sesuai harapan | **VALID** |

### B. Modul Katalog Kamar & Reservasi (Tanpa Upload KTP/KTM/KRS)

| Kode | Fitur / Skenario Uji | Teknik Uji | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **BB-07** | Pengajuan reservasi kamar tanpa unggah KTP/KTM/KRS | Equivalence Partitioning | Pilih kamar `TERSEDIA` (mis. Kamar 17), isi tanggal masuk, durasi 6 bulan, nama, WA, email, kontak darurat, centang persetujuan | Reservasi berhasil tersimpan berstatus `PENDING_REVIEW`, status kamar terkunci `DIPESAN`, tanpa meminta dokumen KTP/KTM/KRS | Sesuai harapan (terverifikasi di `blackbox-system.test.ts` & `five-roles-sync.test.ts`) | **VALID** |
| **BB-08** | Pengajuan reservasi dengan nama tidak valid (< 3 huruf) | Boundary Value Analysis | Nama diisi `"A"` | Sistem menolak pengajuan dan menampilkan pesan validasi | Sesuai harapan — input ditolak | **VALID** |
| **BB-09** | Verifikasi & Persetujuan Reservasi oleh Pengelola | State Transition | Pengelola klik **Setujui Reservasi** | Status reservasi berubah `PENDING_REVIEW` → `APPROVED`, tagihan pembayaran 24 jam diterbitkan | Sesuai harapan | **VALID** |
| **BB-10** | Penolakan Reservasi oleh Pengelola | State Transition | Pengelola klik **Tolak** dengan alasan minimal 10 karakter | Status reservasi berubah `REJECTED` dan status kamar otomatis kembali `TERSEDIA` | Sesuai harapan (terverifikasi di `room-status-transition.test.ts`) | **VALID** |

### C. Modul Pembayaran (Khusus Bank BRI) & Siklus Hunian

| Kode | Fitur / Skenario Uji | Teknik Uji | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **BB-11** | Tampilan metode pembayaran resmi | Functional Testing | Buka halaman pembayaran Calon / Penghuni | Hanya menampilkan **Transfer Bank BRI (`763701006296502` a.n. YULASTRI)** yang aktif dan **QRIS** berlabel *Segera Hadir* (nonaktif) | Sesuai harapan (terverifikasi di `blackbox-system.test.ts`) | **VALID** |
| **BB-12** | Konfirmasi transfer Bank BRI & validasi Pengelola | State Transition | Calon klik **Konfirmasi Sudah Transfer Bank BRI**, lalu Pengelola klik **Validasi Lunas** | Status invoice berubah `UNPAID` → `PENDING` → `SETTLEMENT`, reservasi menjadi `PAID` | Sesuai harapan (terverifikasi di `five-roles-sync.test.ts`) | **VALID** |
| **BB-13** | Proses Check-in oleh Pengelola | State Transition | Pengelola klik **Proses Check-in** untuk reservasi `PAID` | Kontrak aktif (`tenancies`) dibuat, role akun berubah `CALON_PENGHUNI` → `PENGHUNI`, kamar berubah `DIPESAN` → `TERISI` | Sesuai harapan | **VALID** |
| **BB-14** | Proses Check-out oleh Pengelola | State Transition | Pengelola klik **Proses Check-out** pada penghuni aktif | Kontrak berubah `SELESAI` dan kamar otomatis kembali `TERSEDIA` jika sudah kosong | Sesuai harapan | **VALID** |

### D. Modul Jadwal Sewa 3-Bulanan, Tempo 1–7 Hari, & Iuran Duka Cita

| Kode | Fitur / Skenario Uji | Teknik Uji | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **BB-15** | Edit Tanggal Masuk Kamar oleh Pengelola / Keuangan | Functional Testing | Ubah `Tanggal Masuk` kamar di `/pengelola/penghuni` atau `/keuangan/tagihan` | Tanggal masuk tersimpan ke database dan jatuh tempo siklus 3-bulanan langsung terhitung ulang di Keuangan & Portal Penghuni | Sesuai harapan | **VALID** |
| **BB-16** | Kirim Pengingat Tagihan WA Per Kamar | Functional Testing | Staf Keuangan klik **Kirim Pengingat WA** pada salah satu kamar | Membuka WhatsApp dengan teks pengingat kamar terkait dan mencatat riwayat kirim pada `notification_logs` & `audit_logs` | Sesuai harapan | **VALID** |
| **BB-17** | Batas pengajuan perpanjangan waktu bayar (1–7 hari) | Boundary Value Analysis | Uji input `0 hari`, `1 hari`, `4 hari`, `7 hari`, dan `8 hari` | Input `0` dan `8` ditolak; input `1`, `4`, dan `7` diterima dan memperbarui batas akhir bayar | Sesuai harapan (terverifikasi di `blackbox-system.test.ts`) | **VALID** |
| **BB-18** | Eskalasi keterlambatan melewati 7 hari (> 7 hari) | Boundary Value Analysis | Keterlambatan `7 hari` vs `8 hari` | Pada hari ke-7 status masih `TERLAMBAT`; pada hari ke-8 (> 7 hari) status otomatis berubah menjadi **`WAJIB_KONFIRMASI_IBU_KOS`** dengan tombol WA langsung ke Ibu Yulastri | Sesuai harapan (terverifikasi di `blackbox-system.test.ts`) | **VALID** |
| **BB-19** | Pencatatan Iuran Sosial / Duka Cita Sukarela | Functional Testing | Staf Keuangan menambahkan data sumbangan di tab **Iuran Duka Cita** (`/keuangan/transaksi`) | Data tersimpan persisten, total dana sosial bertambah, dan **tidak tercampur** dengan pendapatan sewa kamar | Sesuai harapan | **VALID** |

---

## 2. Ringkasan Eksekusi Pengujian Otomatis

Seluruh skenario pengujian otomatis dijalankan melalui Vitest (`vitest run tests/unit`):
- **5 Test Files:** `5 passed (5)`
- **Total Skenario Otomatis:** `30 passed (30)` (`0 failed`)
- **Tingkat Keberhasilan (Pass Rate):** **100%**
- **Verifikasi Build Produksi (`next build` + TypeScript `tsc --noEmit`):** **Lulus tanpa error**

Kesimpulan: Berdasarkan pengujian metode **Black-Box Testing**, seluruh fungsi inti pada ke-5 role Sistem Informasi Kos Omi telah berjalan sesuai spesifikasi kebutuhan pengguna tanpa cacat fungsional.
