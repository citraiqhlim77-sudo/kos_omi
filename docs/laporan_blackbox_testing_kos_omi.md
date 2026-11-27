# Laporan Pengujian Black-Box Testing — Sistem Informasi Kos Omi (Versi Terbaru)

- **Nama Sistem:** Sistem Informasi Manajemen Kos Omi (Sungai Bangek, Padang)
- **URL Produksi:** https://kos-omi-padang.netlify.app
- **Metode Pengujian:** Black-Box Testing (*Equivalence Partitioning*, *Boundary Value Analysis*, dan *State Transition Testing*)
- **Tanggal Pengujian:** 28 November 2026
- **Lingkup Role:** 5 Role (`Calon Penghuni`, `Penghuni Aktif`, `Pengelola Kos`, `Staf Keuangan`, `Admin Sistem`)
- **Eksekusi Otomatis:** Vitest Test Runner (`5 test files`, `30/30 passed`, `0 failed` — **100% Pass Rate**)

---

## 1. Tabel Hasil Pengujian Black-Box (24 Skenario Uji — Siap Salin ke Laporan)

### A. Modul Autentikasi, Privasi, & Isolasi Sesi

| Kode | Fitur / Skenario Uji | Teknik Uji | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **BB-01** | Registrasi akun Calon Penghuni valid | Equivalence Partitioning | Nama lengkap, email valid (`@gmail.com`), no. WA aktif, kata sandi & konfirmasi cocok | Akun berhasil dibuat, tersimpan di Neon PostgreSQL dengan hash Bcrypt, dan tampil di Pengelola & Admin | Sesuai harapan | **VALID** |
| **BB-02** | Registrasi dengan typo domain email | Equivalence Partitioning | Email berakhiran `.con` (mis. `citra@gmail.con`) | Sistem menolak registrasi dan menampilkan peringatan akhiran email | Sesuai harapan | **VALID** |
| **BB-03** | Kata sandi lemah (< 8 karakter / tanpa angka) | Boundary Value Analysis | Sandi `abc12` atau `passwordtanpaangka` | Sistem menolak registrasi dan meminta kombinasi huruf & angka minimal 8 karakter | Sesuai harapan | **VALID** |
| **BB-04** | Isolasi sesi login Penghuni Aktif | Functional Testing | Login menggunakan akun penghuni tertentu (mis. Ratu) lalu navigasi ke Profil & Tagihan | Data yang tampil 100% milik akun yang sedang login (tidak tertukar ke penghuni lain) | Sesuai harapan | **VALID** |
| **BB-05** | Edit profil Penghuni Aktif tanpa NIM | Functional Testing | Buka `/penghuni/profil`, ubah nama/email/WA/kontak darurat/sandi | Kolom NIM tidak ditampilkan; perubahan profil tersimpan ke Neon PostgreSQL | Sesuai harapan | **VALID** |
| **BB-06** | Pemulihan Lupa Kata Sandi & Reset oleh Admin | Functional Testing | Ajukan lupa sandi di `/lupa-password`, lalu Admin klik **Reset Sandi** | Tercatat di log notifikasi & audit; sandi baru terenkripsi Bcrypt | Sesuai harapan | **VALID** |

### B. Modul Katalog Kamar, Slot 1/2, & Reservasi Tanpa KTP/KTM/KRS

| Kode | Fitur / Skenario Uji | Teknik Uji | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **BB-07** | Pengajuan reservasi kamar tanpa upload KTP/KTM/KRS | Equivalence Partitioning | Pilih kamar `TERSEDIA`, isi data diri, kontak darurat, & mode hunian tanpa upload KTP/KTM/KRS | Reservasi tersimpan di Neon PostgreSQL (`PENDING_REVIEW`), kamar terkunci `DIPESAN`, notif titik merah muncul di Pengelola | Sesuai harapan | **VALID** |
| **BB-08** | Validasi nama calon penghuni (< 3 karakter) | Boundary Value Analysis | Nama diisi `"A"` | Sistem menolak pengajuan dengan pesan validasi | Sesuai harapan | **VALID** |
| **BB-09** | Tampilan & pemesanan kamar slot 1/2 (*Butuh 1 Teman*) | Functional Testing | Kamar diisi 1 orang dengan mode *1 Slot Sendiri* (`Rp 2.500.000`) | Katalog menampilkan badge **`Masih Terima 1 Orang`**, halaman detail menampilkan info *Butuh 1 Teman Sekamar*, dan calon ke-2 tetap bisa memesan 1 slot | Sesuai harapan | **VALID** |
| **BB-10** | Verifikasi & Persetujuan / Penolakan Reservasi | State Transition | Pengelola klik **Setujui** atau **Tolak** (alasan ≥ 10 karakter) | Disetujui → `APPROVED` + terbit invoice 24 jam + notif Calon; Ditolak → `REJECTED` + kamar kembali `TERSEDIA` | Sesuai harapan | **VALID** |

### C. Modul Pembayaran Bank BRI, Upload Bukti SS, Check-in, & Check-out

| Kode | Fitur / Skenario Uji | Teknik Uji | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **BB-11** | Metode pembayaran resmi Kos Omi | Functional Testing | Buka halaman pembayaran Calon / Penghuni | Hanya menampilkan **Transfer Bank BRI (`763701006296502` a.n. YULASTRI)** aktif dan **QRIS** (*Segera Hadir*) | Sesuai harapan | **VALID** |
| **BB-12** | Unggah Bukti Screenshot Transfer Bank BRI | Functional Testing | Calon unggah gambar SS transfer BRI lalu klik **Konfirmasi Sudah Transfer Bank BRI** | Bukti SS tersimpan di Neon PostgreSQL, status menjadi `PENDING`, dan gambar bukti tampil di halaman verifikasi Pengelola | Sesuai harapan | **VALID** |
| **BB-13** | Validasi Pembayaran Lunas oleh Pengelola | State Transition | Pengelola cek bukti SS transfer lalu klik **Validasi Pembayaran Lunas** | Status invoice berubah `SETTLEMENT`, reservasi `PAID`, dan muncul di antrean Check-in | Sesuai harapan | **VALID** |
| **BB-14** | Proses Check-in & Auto-Redirect Penghuni Aktif | State Transition | Pengelola klik **Proses Check-in** | Role naik `CALON_PENGHUNI` → `PENGHUNI`, akun otomatis diarahkan ke `/penghuni/dashboard`, dan data otomatis masuk ke `/keuangan/tagihan` | Sesuai harapan | **VALID** |
| **BB-15** | Proses Check-out 1 Orang & Toggle Mode Kamar | State Transition | Pengelola check-out 1 dari 2 teman sekamar lalu klik toggle mode pada penghuni tersisa | Hanya 1 penghuni yang `SELESAI`; penghuni tersisa dapat diatur ke **`Butuh 1 Teman (Rp 2,5jt)`** atau **`Sendiri Penuh (Rp 5jt)`** | Sesuai harapan | **VALID** |

### D. Modul Keuangan, Pengingat 1x Klik, Tempo 1–7 Hari, & Iuran Duka Cita

| Kode | Fitur / Skenario Uji | Teknik Uji | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **BB-16** | Edit Tanggal Masuk Kamar oleh Pengelola / Keuangan | Functional Testing | Ubah `Tanggal Masuk` kamar pada halaman Pengelola / Keuangan | Tanggal tersimpan ke Neon DB dan jatuh tempo siklus 3-bulanan langsung terhitung ulang | Sesuai harapan | **VALID** |
| **BB-17** | Kirim Pengingat WA Per Kamar & Massal 1x Klik | Functional Testing | Staf Keuangan klik **Kirim Pengingat WA** atau **Kirim Pengingat Semua (1x Klik)** | Pengingat tercatat di `notification_logs` & `audit_logs` serta memunculkan notifikasi titik merah pada Portal Penghuni | Sesuai harapan | **VALID** |
| **BB-18** | Batas pengajuan perpanjangan waktu bayar (1–7 hari) | Boundary Value Analysis | Uji input `0`, `1`, `4`, `7`, dan `8` hari | Input `0` & `8` ditolak; input `1`–`7` diterima dan memperbarui batas akhir bayar | Sesuai harapan | **VALID** |
| **BB-19** | Eskalasi keterlambatan melewati 7 hari (> 7 hari) | Boundary Value Analysis | Keterlambatan `7 hari` vs `8 hari` | Hari ke-7 berstatus `TERLAMBAT`; hari ke-8 otomatis berubah **`WAJIB_KONFIRMASI_IBU_KOS`** dengan tombol WA ke Ibu Yulastri (`+62 813-7432-9562`) | Sesuai harapan | **VALID** |
| **BB-20** | Pengumuman Iuran Duka Cita Sukarela | Functional Testing | Staf Keuangan klik **Buat Pengumuman Duka Cita** dengan deskripsi kemalangan | Pengumuman & notifikasi titik merah muncul di dasbor seluruh Penghuni Aktif | Sesuai harapan | **VALID** |
| **BB-21** | Donasi Duka Cita Seikhlasnya / Abaikan | Functional Testing | Penghuni klik **Ikut Berdonasi** (input Rp 2.000 / Rp 10.000) atau klik **Abaikan** | Jika donasi → otomatis masuk ke tabel **Iuran Duka Cita** di Keuangan (terpisah dari sewa) + notif Keuangan; jika abaikan → banner tertutup | Sesuai harapan | **VALID** |
| **BB-22** | Akurasi Efektivitas Konversi Reservasi di Laporan | Functional Testing | 1 reservasi lunas dilihat pada `/keuangan/laporan` | Sistem menghitung tepat **1** reservasi (tidak terhitung ganda antara kode `RSV-` dan `INV-`) | Sesuai harapan | **VALID** |
| **BB-23** | Notifikasi Otomatis Real-Time (Tanpa Refresh Manual) | Functional Testing | Role lain melakukan verifikasi/validasi/pengingat saat pengguna sedang membuka halaman | Lonceng menampilkan titik merah, pop-up pesan muncul di kanan bawah, dan halaman otomatis sinkron | Sesuai harapan | **VALID** |
| **BB-24** | Penggabungan Menu Navigasi Calon Penghuni | Functional Testing | Login sebagai Calon Penghuni pada tampilan mobile & desktop | Menu *Reservasi & Pembayaran* dan *Profil Saya* tergabung rapi dalam 1 header tanpa tombol menu duplikat | Sesuai harapan | **VALID** |

---

## 2. Kesimpulan Pengujian

- **Total Skenario Black-Box:** 24 skenario fungsional & batas nilai (`BB-01` s/d `BB-24`) — **24/24 VALID (100%)**.
- **Eksekusi Automated Test Suite (`vitest run tests/unit`):** **5/5 test files, 30/30 tests passed (0 failed)**.
- **Build Produksi (`tsc --noEmit` & `next build`):** **Lulus tanpa error** dan telah terverifikasi live di **https://kos-omi-padang.netlify.app**.
