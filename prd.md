# Sistem Kos Omi

---

## 1. Ringkasan & Tujuan Aplikasi
*Bagian ini menjelaskan gambaran umum proyek agar dipahami bersama oleh pemilik ide/klien dan tim pengembang.*
- **Nama Aplikasi**: Kos Omi (Sistem Manajemen Kos Omi)
- **Penjelasan Singkat**: Aplikasi web untuk mengelola reservasi kamar, verifikasi calon penghuni, pembayaran online (QRIS, Virtual Account, E-Wallet) melalui Midtrans, tagihan bulanan, serta laporan keuangan untuk 67 kamar Kos Omi, dalam satu sistem yang tercatat otomatis.
- **Masalah yang Diselesaikan**:
  - Reservasi masih dilakukan manual lewat chat dan pencatatan kertas atau spreadsheet, sehingga rawan bentrok jadwal kamar.
  - Pembayaran masih transfer biasa tanpa konfirmasi otomatis, sehingga pengelola harus mengecek mutasi rekening satu per satu.
  - Status kamar (kosong, dipesan, terisi) sulit dipantau secara real-time.
  - Riwayat tagihan dan pembayaran tiap penghuni sulit ditelusuri.
  - Laporan pemasukan harian dan bulanan butuh waktu lama untuk disusun.
- **Pengguna Aplikasi**:
  - **Admin**: Mengelola seluruh sistem, termasuk akun pengguna, pengaturan kamar, dan konfigurasi harga.
  - **Pengelola Kos**: Mengelola kamar, memverifikasi reservasi, mencatat check-in dan check-out.
  - **Keuangan**: Memantau transaksi masuk, rekonsiliasi pembayaran, dan mengunduh laporan keuangan.
  - **Calon Penghuni**: Mencari kamar kosong, mengajukan reservasi, dan membayar booking atau deposit.
  - **Penghuni**: Melihat tagihan bulanan, membayar tagihan, dan membuka riwayat pembayaran.
- **Target Keberhasilan**:
  - 100% transaksi pembayaran online tercatat otomatis dan sesuai status resmi dari Midtrans.
  - Status 67 kamar selalu akurat dan terbarui secara real-time.
  - Waktu verifikasi reservasi berkurang dan seluruh riwayat bayar dapat ditelusuri dalam hitungan detik.
  - Laporan pemasukan harian dan bulanan tersedia kapan saja tanpa perhitungan manual.
  - Sistem lolos UAT (User Acceptance Test) bersama tim Kos Omi.

---

## 2. Batasan Pembuatan Sistem (Versi Awal MVP)
*Menegaskan fitur apa yang dikerjakan di versi awal dan apa yang sengaja ditunda agar aplikasi cepat selesai dan tidak membengkak (mencegah scope creep).*

### ✅ Yang Dikerjakan:
- Login email dan password dengan pembagian peran (Admin, Pengelola, Keuangan, Calon Penghuni, Penghuni).
- Kelola data 67 kamar beserta status kamar (Tersedia, Dipesan, Terisi, Nonaktif).
- Reservasi online oleh calon penghuni dan verifikasi oleh pengelola.
- Pembayaran online via Midtrans Snap (QRIS, Virtual Account, E-Wallet) dengan webhook otomatis.
- Pembuatan tagihan bulanan otomatis dan riwayat pembayaran penghuni.
- Check-in dan check-out penghuni.
- Laporan rekap pemasukan harian dan bulanan dengan ekspor CSV.
- Notifikasi WhatsApp dan Email untuk status reservasi, verifikasi, dan tagihan.
- Tampilan responsif untuk smartphone, tablet, dan laptop.

### ⛔ Yang Tidak Dikerjakan di Versi Awal:
- Modul komplain penghuni, perbaikan fasilitas, dan jadwal kebersihan (di luar scope).
- Manajemen kontrak sewa digital dan tanda tangan elektronik (di luar scope).
- Pembayaran tunai atau tagihan via kasir offline (hanya lewat gateway).
- Aplikasi mobile native (Android/iOS). Versi web responsif sudah mencakup penggunaan di HP.
- Login melalui Google atau media sosial (hanya Email dan Password).
- Multi-cabang kos. MVP hanya untuk satu properti Kos Omi.
- Fitur tawar-menawar harga dan diskon otomatis.
- Integrasi akuntansi pihak ketiga (Accurate, Jurnal, dan sejenisnya).

---

## 3. Daftar Halaman & Struktur Menu (Pages & Routing)
*Daftar lengkap halaman yang harus dibuat, dikelompokkan berdasarkan area atau peran pengguna (Role).*

### A. Public Area (Tanpa Login)
- `/` (Beranda): Hero section Kos Omi, ringkasan fasilitas, ketersediaan kamar secara ringkas, dan tombol CTA "Lihat Kamar" serta "Daftar Reservasi".
- `/kamar` (Katalog Kamar): Daftar 67 kamar dengan filter lantai, tipe (Standar, AC, Non-AC), harga, dan status ketersediaan. Menampilkan kartu kamar dengan badge status.
- `/kamar/[kode]` (Detail Kamar): Contoh `/kamar/A-101`. Menampilkan foto, luas, fasilitas, harga bulanan, deposit, dan tombol "Reservasi Kamar Ini".
- `/tentang` (Tentang Kos Omi): Profil kos, lokasi, peraturan singkat, dan kontak pengelola.
- `/faq` (Pertanyaan Umum): Cara reservasi, metode pembayaran, kebijakan deposit, dan aturan pembatalan.
- `/kontak` (Kontak): Formulir pertanyaan dan tautan WhatsApp pengelola.
- `/login` (Masuk): Form email dan password dengan tautan lupa password.
- `/daftar` (Daftar Akun): Form registrasi untuk Calon Penghuni (nama, email, nomor WhatsApp, password).
- `/lupa-password` (Lupa Password): Form pengiriman tautan reset melalui email.
- `/reset-password/[token]` (Atur Ulang Password): Form password baru dari tautan email.
- `/reservasi/[kodeKamar]` (Form Reservasi): Form pengajuan reservasi dengan pilihan tanggal masuk, durasi sewa, dan unggah KTP. Hanya dapat diakses setelah login sebagai Calon Penghuni.

### B. Calon Penghuni Area (Setelah Login)
- `/calon/dashboard` (Dasbor Calon Penghuni): Ringkasan status reservasi aktif dan tombol bayar bila status sudah disetujui.
- `/calon/reservasi` (Daftar Reservasi Saya): Tabel riwayat reservasi dengan status dan tombol detail.
- `/calon/reservasi/[id]` (Detail Reservasi): Timeline status (Menunggu Verifikasi, Disetujui, Menunggu Pembayaran, Lunas, Check-in), rincian biaya, dan tombol "Bayar Sekarang".
- `/calon/pembayaran/[invoiceId]` (Halaman Pembayaran): Menampilkan rincian invoice dan memunculkan Midtrans Snap.
- `/calon/profil` (Profil Saya): Ubah data diri dan ganti password.

### C. Penghuni Area (Setelah Login)
- `/penghuni/dashboard` (Dasbor Penghuni): Prioritas utama. Kartu tagihan bulan berjalan (nominal, jatuh tempo, status), tombol "Bayar Tagihan", ringkasan kamar yang ditempati, dan tiga riwayat pembayaran terakhir.
- `/penghuni/tagihan` (Tagihan Bulanan): Daftar seluruh tagihan dengan filter status (Belum Bayar, Lunas, Kedaluwarsa) dan periode bulan.
- `/penghuni/tagihan/[id]` (Detail Tagihan): Rincian biaya, tombol bayar via Midtrans, dan unduh bukti pembayaran (PDF).
- `/penghuni/riwayat` (Riwayat Pembayaran): Tabel seluruh transaksi lunas dengan kolom tanggal, metode, nominal, dan nomor invoice. Mendukung pencarian dan filter tahun.
- `/penghuni/kamar` (Kamar Saya): Informasi kamar yang ditempati, tanggal check-in, masa sewa, dan aturan kos.
- `/penghuni/profil` (Profil Saya): Ubah data diri, nomor WhatsApp, dan password.

### D. Pengelola Area (Setelah Login)
- `/pengelola/dashboard` (Dasbor Pengelola): Ringkasan jumlah kamar terisi, kosong, dipesan, reservasi menunggu verifikasi, dan check-in hari ini.
- `/pengelola/kamar` (Kelola Kamar): Tabel 67 kamar dengan filter lantai, tipe, dan status. Aksi ubah status dan edit data kamar melalui modal.
- `/pengelola/kamar/[id]` (Detail Kamar Admin): Riwayat penghuni kamar tersebut dan jadwal reservasi.
- `/pengelola/reservasi` (Daftar Reservasi): Tabel reservasi dengan filter status dan pencarian nama atau kode.
- `/pengelola/reservasi/[id]` (Verifikasi Reservasi): Tinjau data calon penghuni, lihat KTP, lalu setujui atau tolak dengan alasan.
- `/pengelola/penghuni` (Daftar Penghuni): Daftar penghuni aktif, riwayat sewa, dan tombol check-out.
- `/pengelola/penghuni/[id]` (Detail Penghuni): Profil, kamar, riwayat tagihan, dan riwayat check-in dan check-out.
- `/pengelola/checkin` (Check-in): Daftar reservasi berstatus Lunas yang siap check-in, dengan tombol "Proses Check-in".
- `/pengelola/checkout` (Check-out): Daftar penghuni aktif dengan tombol "Proses Check-out" dan ringkasan tagihan tersisa.

### E. Keuangan Area (Setelah Login)
- `/keuangan/dashboard` (Dasbor Keuangan): Kartu total pemasukan hari ini, bulan ini, tagihan belum lunas, dan grafik tren pemasukan 12 bulan.
- `/keuangan/transaksi` (Daftar Transaksi): Tabel seluruh pembayaran dengan status gateway, metode, dan filter tanggal. Bersifat hanya baca.
- `/keuangan/transaksi/[id]` (Detail Transaksi): Data lengkap transaksi dari gateway termasuk `transaction_status` dan `fraud_status`.
- `/keuangan/laporan` (Laporan Keuangan): Tab "Harian" dan "Bulanan" dengan tabel rekap pemasukan, filter periode, dan tombol ekspor CSV.
- `/keuangan/tagihan` (Monitoring Tagihan): Daftar tagihan belum lunas dan kedaluwarsa dengan tombol kirim ulang pengingat WhatsApp atau Email.

### F. Admin Area (Setelah Login)
- `/admin/dashboard` (Dasbor Admin): Ringkasan lengkap seluruh modul dan aktivitas terbaru.
- `/admin/pengguna` (Kelola Pengguna): Tabel seluruh akun dengan filter peran. Admin dapat menambah akun Pengelola dan Keuangan, menonaktifkan akun, serta mereset password.
- `/admin/pengaturan` (Pengaturan Kos): Nama kos, alamat, nomor WhatsApp pengelola, tanggal jatuh tempo tagihan, persentase deposit, dan masa berlaku reservasi.
- `/admin/log-aktivitas` (Log Aktivitas): Riwayat perubahan data penting (siapa, kapan, apa yang berubah).
- `/admin/notifikasi` (Log Notifikasi): Riwayat pengiriman WhatsApp dan Email beserta statusnya.

### G. Halaman Sistem
- `/403` (Akses Ditolak): Halaman informatif saat pengguna mencoba membuka menu di luar perannya.
- `/404` (Tidak Ditemukan): Halaman tidak ditemukan dengan tombol kembali ke beranda.
- `/pembayaran/selesai` (Status Pembayaran): Halaman tujuan setelah pembayaran Midtrans (finish redirect) yang menampilkan status terbaru dari server.

---

## 4. Pedoman UI/UX & Design System
*Panduan visual konkret agar AI coding assistant tidak membuat UI yang kaku atau default.*
- **Skema Warna**:
  - Primary (Biru Tepercaya): HSL(217, 91%, 45%), dipakai untuk tombol utama, tautan, dan elemen aktif.
  - Primary Foreground: HSL(0, 0%, 100%).
  - Secondary (Biru Muda Lembut): HSL(214, 95%, 96%), dipakai untuk latar kartu info dan badge netral.
  - Accent (Hijau Sukses): HSL(152, 69%, 36%), dipakai untuk status Lunas, Tersedia, dan Disetujui.
  - Warning (Kuning Amber): HSL(38, 92%, 50%), dipakai untuk status Menunggu Verifikasi dan Menunggu Pembayaran.
  - Destructive (Merah): HSL(0, 72%, 51%), dipakai untuk status Ditolak, Kedaluwarsa, dan tombol hapus.
  - Background: HSL(0, 0%, 100%) untuk mode terang; HSL(222, 47%, 11%) untuk mode gelap.
  - Surface Kartu: HSL(210, 20%, 98%) dengan border HSL(214, 20%, 90%).
  - Teks Utama: HSL(222, 47%, 11%). Teks Sekunder: HSL(215, 16%, 47%).
- **Tipografi**:
  - Heading menggunakan font `Plus Jakarta Sans` (bobot 600 dan 700) untuk kesan modern dan tepercaya.
  - Body menggunakan font `Inter` (bobot 400 dan 500) agar mudah dibaca pada layar kecil.
  - Angka nominal rupiah menggunakan `tabular-nums` agar kolom angka sejajar pada tabel.
  - Ukuran dasar teks 16px pada mobile untuk mencegah zoom otomatis di iOS. Skala heading: H1 32px (mobile 26px), H2 24px, H3 20px.
- **Aturan Komponen**:
  - Sudut membulat: `rounded-xl` (12px) untuk kartu dan modal; `rounded-lg` (8px) untuk input dan tombol; `rounded-full` untuk badge status.
  - Bayangan tipis: `shadow-sm` untuk kartu biasa; `shadow-md` saat hover kartu interaktif. Hindari bayangan tebal.
  - Border tipis 1px dengan warna netral untuk memisahkan area, bukan bayangan berat.
  - Tombol utama tinggi minimal 44px agar nyaman disentuh di smartphone (touch target).
  - Badge status wajib memakai kombinasi warna dan ikon (Lucide Icons) agar dapat dibedakan tanpa bergantung pada warna saja.
  - Tabel di mobile diubah menjadi daftar kartu (card list) yang dapat dibaca vertikal. Tabel penuh hanya tampil pada layar md ke atas.
  - Form menggunakan label di atas input, pesan error di bawah input, dan tombol submit lebar penuh di mobile.
  - Komponen konfirmasi (AlertDialog) wajib untuk aksi berisiko: tolak reservasi, check-out, dan nonaktifkan akun.
  - Tombol bayar selalu memakai ikon gembok (Lock) dan tulisan "Pembayaran Aman via Midtrans" untuk membangun kepercayaan.
- **Nuansa & Vibe**:
  - Bersih, modern, dan profesional dengan banyak ruang putih (whitespace) dan hirarki visual yang jelas.
  - Kesan tepercaya: angka dan status tampil jelas, tidak ramai, dan konsisten di seluruh halaman.
  - Interaksi halus: transisi 150 sampai 200ms pada hover dan saat membuka modal, serta skeleton loading saat data dimuat.
  - Responsif mobile-first: navigasi bawah (Bottom Navigation) untuk peran Penghuni dan Calon Penghuni di layar kecil; sidebar untuk Admin, Pengelola, dan Keuangan di layar besar.
  - Ikon konsisten dari Lucide Icons dengan ukuran 20px (dasar) dan 16px (di dalam badge).

---

## 5. Pembagian Hak Akses Pengguna
*Tabel hak akses yang menentukan siapa saja yang boleh melihat, mengedit, atau mengelola data.*

| Menu / Halaman | Publik (Tanpa Login) | Calon Penghuni | Penghuni | Pengelola Kos | Keuangan | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Beranda, Katalog Kamar, Detail Kamar, Tentang, FAQ, Kontak | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Login, Daftar Akun, Lupa Password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ajukan Reservasi | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reservasi Saya dan Pembayaran Booking | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dasbor Penghuni, Tagihan Saya, Riwayat Saya | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Bayar Tagihan Bulanan | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Kelola Kamar (ubah status dan data) | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Verifikasi Reservasi | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Check-in dan Check-out | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Daftar Penghuni Aktif | ❌ | ❌ | ❌ | ✅ | 👁️ | ✅ |
| Monitoring Transaksi Gateway (Baca) | ❌ | ❌ | ❌ | 👁️ | ✅ | ✅ |
| Laporan Keuangan Harian dan Bulanan | ❌ | ❌ | ❌ | 👁️ | ✅ | ✅ |
| Ekspor Laporan CSV | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Kirim Pengingat Tagihan | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Kelola Pengguna dan Peran | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Pengaturan Kos | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Log Aktivitas dan Log Notifikasi | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

Keterangan: ✅ = akses penuh sesuai fungsi; 👁️ = hanya lihat (baca); ❌ = tidak ada akses.

---

## 6. Alur Kerja dan Fitur Utama
*Menjelaskan cara kerja setiap fitur utama dalam bahasa yang mudah dipahami serta aturan logikanya.*

### A. Login dan Pembagian Peran (Prioritas 1)
1. **Cara Kerja**:
   1. Calon Penghuni membuka halaman `/daftar`, mengisi nama, email, nomor WhatsApp, dan password, lalu menekan "Daftar".
   2. Sistem membuat akun dengan peran CALON_PENGHUNI dan mengirim email selamat datang.
   3. Pengguna masuk melalui `/login` dengan email dan password.
   4. Sistem membaca peran dari database dan mengarahkan pengguna ke dasbor sesuai peran (misalnya PENGHUNI ke `/penghuni/dashboard`).
   5. Pengguna yang mencoba membuka halaman di luar perannya otomatis diarahkan ke `/403`.
   6. Pengelola atau Admin membuat akun Pengelola dan Keuangan melalui `/admin/pengguna`. Akun tersebut tidak dapat dibuat lewat halaman publik.
   7. Saat pengguna dinonaktifkan, sesi aktifnya langsung tidak berlaku pada permintaan berikutnya.
2. **Aturan Sistem**:
   - Password minimal 8 karakter, memuat huruf dan angka, di-hash menggunakan bcrypt dengan cost factor minimal 12.
   - Email wajib unik dan dinormalisasi ke huruf kecil.
   - Login gagal lebih dari 5 kali dalam 15 menit memblokir percobaan login sementara untuk email tersebut.
   - Sesi berbasis JWT dengan masa berlaku 7 hari dan cookie `httpOnly`, `secure`, `sameSite=lax`.
   - Lupa password mengirim tautan reset yang berlaku 30 menit dan hanya dapat digunakan sekali.
   - Admin tidak dapat menghapus akun dirinya sendiri dan wajib menyisakan minimal satu Admin aktif.

### B. Kelola Kamar dan Status Kamar (Prioritas 2)
1. **Cara Kerja**:
   1. Pengelola membuka `/pengelola/kamar` dan melihat 67 kamar dalam tampilan tabel (desktop) atau kartu (mobile).
   2. Pengelola memfilter kamar berdasarkan lantai, tipe, atau status.
   3. Pengelola menekan "Ubah Status" pada kamar tertentu. Sistem hanya menampilkan transisi status yang valid.
   4. Pengelola dapat mengedit harga sewa bulanan, deposit, luas, dan fasilitas kamar melalui modal.
   5. Setiap perubahan tercatat di log aktivitas dengan waktu dan nama pelaku.
   6. Halaman publik `/kamar` langsung menampilkan status terbaru tanpa perlu memuat ulang manual (revalidasi cache).
2. **Aturan Sistem**:
   - Status kamar: TERSEDIA, DIPESAN (ada reservasi disetujui dan dalam masa tunggu bayar), TERISI (penghuni aktif), NONAKTIF (tidak dijual, misalnya sedang direnovasi).
   - Kamar berstatus TERISI atau DIPESAN tidak dapat diubah langsung ke TERSEDIA secara manual tanpa melalui proses check-out atau pembatalan reservasi.
   - Kamar NONAKTIF tidak dapat menerima reservasi baru.
   - Kode kamar unik dengan format `[Lantai]-[Nomor]`, contoh `A-101`.
   - Harga sewa dalam Rupiah tanpa desimal, minimal Rp 100.000.

### C. Reservasi dan Verifikasi (Prioritas 3)
1. **Cara Kerja**:
   1. Calon Penghuni memilih kamar berstatus TERSEDIA di `/kamar` lalu menekan "Reservasi Kamar Ini".
   2. Calon Penghuni mengisi tanggal masuk (minimal H+3 dari hari ini), durasi sewa (1, 3, 6, atau 12 bulan), dan mengunggah foto KTP (JPG atau PNG, maksimal 2 MB).
   3. Sistem membuat reservasi dengan status MENUNGGU_VERIFIKASI dan kamar berstatus tetap TERSEDIA (belum dikunci).
   4. Sistem mengirim notifikasi WhatsApp dan Email kepada Calon Penghuni dan Pengelola.
   5. Pengelola membuka `/pengelola/reservasi/[id]`, memeriksa data dan KTP, lalu memilih "Setujui" atau "Tolak" dengan alasan.
   6. Jika disetujui: status menjadi MENUNGGU_PEMBAYARAN, kamar berubah menjadi DIPESAN, dan sistem membuat invoice BOOKING (biaya booking dan deposit) yang berlaku hingga 24 jam.
   7. Calon Penghuni membayar melalui Midtrans. Setelah lunas, status menjadi LUNAS dan muncul di daftar check-in.
   8. Jika tidak dibayar dalam 24 jam, sistem otomatis membatalkan reservasi menjadi KEDALUWARSA dan mengembalikan kamar menjadi TERSEDIA.
2. **Aturan Sistem**:
   - Satu Calon Penghuni hanya boleh memiliki satu reservasi aktif (status MENUNGGU_VERIFIKASI, MENUNGGU_PEMBAYARAN, atau LUNAS) dalam satu waktu.
   - Alasan penolakan wajib diisi (minimal 10 karakter) dan ditampilkan kepada Calon Penghuni.
   - Verifikasi harus dilakukan dalam 2 x 24 jam. Jika belum diverifikasi, pengelola menerima pengingat otomatis.
   - Biaya booking adalah 1 bulan sewa, dan deposit adalah 1 bulan sewa, sesuai pengaturan di `/admin/pengaturan`.
   - Foto KTP disimpan di penyimpanan privat dan hanya dapat diakses oleh Pengelola dan Admin melalui tautan sementara (signed URL) yang berlaku 5 menit.
   - Setiap perubahan status reservasi dicatat di log aktivitas.

### D. Pembayaran Online via Midtrans (Prioritas 4)
1. **Cara Kerja**:
   1. Calon Penghuni atau Penghuni menekan "Bayar Sekarang" pada invoice.
   2. Sistem membuat transaksi ke Midtrans Snap API menggunakan `order_id` unik (format `KOS-[tahun][bulan][nomor invoice]`), lalu menyimpan `snap_token` dan `redirect_url` pada tabel invoice.
   3. Calon Penghuni melihat pop-up Midtrans Snap dan memilih metode: QRIS, Virtual Account (BCA, BNI, BRI, Permata, Mandiri), atau E-Wallet (GoPay, ShopeePay).
   4. Setelah pembayaran, Midtrans mengirim notifikasi ke endpoint `POST /api/webhooks/midtrans`.
   5. Sistem memverifikasi signature key, lalu mengambil ulang status transaksi dari Midtrans Status API sebagai sumber kebenaran.
   6. Jika status `settlement` atau `capture` (dengan fraud_status `accept`), sistem menandai invoice LUNAS, mencatat pembayaran, mengubah status reservasi atau tagihan, dan mengirim notifikasi WhatsApp serta Email.
   7. Halaman `/pembayaran/selesai` menampilkan status terbaru dari server, bukan hanya dari tampilan redirect.
   8. Jika status `pending`, invoice tetap MENUNGGU dan dicek ulang melalui job terjadwal.
   9. Jika status `expire`, `cancel`, atau `deny`, invoice kembali ke status BELUM_BAYAR agar pengguna dapat mencoba lagi dengan order baru.
2. **Aturan Sistem**:
   - Nominal pada invoice dan nominal pada transaksi Midtrans wajib sama. Jika berbeda, transaksi ditolak dan dicatat sebagai anomali.
   - Webhook yang signature-nya tidak valid ditolak dengan HTTP 403 dan dicatat di log.
   - Pembayaran yang sudah LUNAS tidak boleh diubah kembali oleh notifikasi yang datang terlambat (idempotent). Pemrosesan webhook dibuat idempoten dengan pengecekan `transaction_id`.
   - Invoice yang sudah LUNAS tidak dapat dibayar ulang. Sistem mencegah pembuatan dua transaksi aktif untuk invoice yang sama.
   - Metode pembayaran yang diizinkan: `qris`, `bank_transfer` (BCA, BNI, BRI, Permata, Mandiri), `gopay`, dan `shopeepay`.
   - Status gateway di database harus selalu mencerminkan `transaction_status` dari Midtrans. Dasbor Keuangan hanya menghitung pemasukan dengan status `settlement` atau `capture`.
   - Kredensial Server Key tidak pernah dikirim ke sisi klien.

### E. Tagihan Bulanan dan Riwayat (Prioritas 5)
1. **Cara Kerja**:
   1. Setiap hari pukul 00.05 WIB, Vercel Cron memanggil endpoint `/api/cron/generate-tagihan` yang diamankan dengan `CRON_SECRET`.
   2. Sistem membuat invoice SEWA_BULANAN untuk setiap penghuni aktif yang tanggal jatuh temponya jatuh pada hari tersebut (H-7). Jumlah invoice dicegah ganda dengan kombinasi `tenancy_id` dan `periode_bulan`.
   3. Sistem mengirim pengingat WhatsApp dan Email pada H-3 dan H-0 kepada penghuni.
   4. Penghuni melihat tagihan di `/penghuni/tagihan` dan membayarnya lewat Midtrans.
   5. Jika lewat 3 hari setelah jatuh tempo dan belum lunas, status tagihan menjadi TERLAMBAT dan muncul di `/keuangan/tagihan`.
   6. Penghuni dapat mengunduh bukti pembayaran (PDF) untuk setiap invoice LUNAS dari halaman detail tagihan.
   7. Seluruh tagihan lunas tercatat di `/penghuni/riwayat`, dapat difilter berdasarkan tahun dan dicari berdasarkan nomor invoice.
2. **Aturan Sistem**:
   - Nomor invoice unik dengan format `INV-[YYYYMM]-[nomor urut 5 digit]`.
   - Tanggal jatuh tempo default tanggal 5 setiap bulan, dapat diatur di `/admin/pengaturan`.
   - Denda keterlambatan dimatikan pada versi awal. Status TERLAMBAT hanya sebagai penanda untuk tindak lanjut pengelola.
   - Tagihan bulanan dibuat untuk periode penuh (1 bulan), tidak dapat diubah nominalnya setelah diterbitkan kecuali oleh Admin dengan catatan alasan.
   - Penghuni hanya dapat melihat tagihan miliknya sendiri (filter `user_id` diterapkan di sisi server, bukan hanya di tampilan).

### F. Check-in dan Check-out
1. **Cara Kerja**:
   1. Pengelola membuka `/pengelola/checkin` dan memilih reservasi berstatus LUNAS yang tanggal masuknya sudah tiba.
   2. Pengelola menekan "Proses Check-in". Sistem membuat data tenancy dengan status AKTIF, mengubah kamar menjadi TERISI, dan mengubah akun pengguna menjadi PENGHUNI.
   3. Pada tanggal check-out, pengelola membuka `/pengelola/checkout`, memilih penghuni, dan menekan "Proses Check-out".
   4. Sistem memeriksa apakah masih ada tagihan belum lunas. Jika ada, sistem menampilkan peringatan dan meminta konfirmasi.
   5. Setelah dikonfirmasi, tenancy berstatus SELESAI, kamar kembali TERSEDIA, dan deposit ditandai untuk dikembalikan (pengembalian dana dilakukan manual oleh Keuangan).
2. **Aturan Sistem**:
   - Check-in hanya dapat diproses jika reservasi berstatus LUNAS dan tanggal hari ini sudah sama atau melewati tanggal masuk.
   - Satu kamar hanya boleh memiliki satu tenancy AKTIF.
   - Check-out tidak dapat diproses jika invoice bulan berjalan masih BELUM_BAYAR tanpa persetujuan Admin.
   - Seluruh aksi check-in dan check-out tercatat di log aktivitas.

### G. Laporan Keuangan: Rekap Pemasukan Harian dan Bulanan (Prioritas 6)
1. **Cara Kerja**:
   1. Keuangan membuka `/keuangan/laporan` dan memilih tab "Harian" atau "Bulanan".
   2. Keuangan memilih rentang tanggal atau bulan. Sistem menampilkan total pemasukan, jumlah transaksi, dan rincian per metode pembayaran (QRIS, VA, E-Wallet).
   3. Tab Harian menampilkan rekap per tanggal dalam bulan yang dipilih. Tab Bulanan menampilkan rekap per bulan dalam satu tahun.
   4. Keuangan menekan "Ekspor CSV" untuk mengunduh data sesuai filter aktif.
   5. Dasbor Keuangan menampilkan kartu ringkasan dan grafik tren 12 bulan.
2. **Aturan Sistem**:
   - Pemasukan hanya dihitung dari transaksi dengan status `settlement` atau `capture`.
   - Pemasukan dikelompokkan berdasarkan jenis: Booking, Deposit, dan Sewa Bulanan.
   - Zona waktu seluruh laporan adalah WIB (Asia/Jakarta).
   - Data laporan yang sudah tertutup (bulan lalu) di-cache untuk mempercepat tampilan, sedangkan data hari ini selalu diambil langsung dari database.
   - Ekspor CSV menggunakan pemisah koma, encoding UTF-8 dengan BOM agar terbaca benar di Microsoft Excel.
   - Angka pada laporan harus cocok dengan total transaksi di Midtrans (diverifikasi melalui tombol "Rekonsiliasi" yang membandingkan jumlah dengan data status gateway).

### H. Notifikasi WhatsApp dan Email
1. **Cara Kerja**:
   - Event pemicu: reservasi dibuat, disetujui, ditolak, pembayaran lunas, pengingat tagihan H-3 dan H-0, tagihan terlambat, check-in, dan check-out.
   - Email dikirim melalui Resend dengan template HTML responsif.
   - WhatsApp dikirim melalui penyedia Fonnte (atau WhatsApp Cloud API resmi Meta) dengan template pesan yang disetujui.
2. **Aturan Sistem**:
   - Setiap pengiriman dicatat di `notification_logs` dengan status SENT, FAILED, atau PENDING.
   - Pengiriman yang gagal dicoba ulang maksimal 3 kali dengan jeda eksponensial.
   - Nomor WhatsApp wajib format internasional (diawali 62) dan divalidasi saat registrasi.
   - Pengguna dapat mematikan notifikasi WhatsApp di profil, tetapi notifikasi transaksi (pembayaran lunas) tetap dikirim melalui Email.

---

## 7. Alur Navigasi & Arsitektur Layout
*Peta navigasi alur halaman dan struktur tata letak (layout).*

### Arsitektur Layout (Persisten)
- **Public Layout**: Menggunakan Header (Navbar statis di atas, dengan menu hamburger di mobile) dan Footer berisi alamat kos, kontak WhatsApp, dan tautan kebijakan.
- **Auth Layout**: Layout terpusat tanpa navigasi untuk halaman `/login`, `/daftar`, dan `/lupa-password`, dengan ilustrasi kecil di sisi kiri pada laptop.
- **Dashboard Layout (Desktop)**: Sidebar tetap (fixed) di kiri dengan menu sesuai peran, dan Header kecil di atas berisi judul halaman, pencarian, notifikasi, dan menu profil.
- **Dashboard Layout (Mobile)**: Header kompak di atas dan Bottom Navigation dengan maksimal 4 menu utama (untuk Penghuni: Dasbor, Tagihan, Riwayat, Profil). Menu lainnya diakses melalui drawer.
- **Payment Layout**: Halaman pembayaran dan status pembayaran menggunakan layout sederhana dengan logo dan indikator langkah agar fokus.

### Bagan Alur (Flowchart)
```mermaid
flowchart TD
    A[Pengunjung] --> B[Beranda]
    B --> C[Katalog Kamar]
    C --> D{Kamar Tersedia?}
    D -- Tidak --> C
    D -- Ya --> E[Detail Kamar]
    E --> F{Sudah Login?}
    F -- Tidak --> G[Login / Daftar]
    G --> H[Peran: Calon Penghuni]
    F -- Ya --> H
    H --> I[Form Reservasi + Unggah KTP]
    I --> J[Status: Menunggu Verifikasi]
    J --> K[Pengelola Meninjau Data]
    K --> L{Disetujui?}
    L -- Tidak --> M[Status: Ditolak + Alasan]
    M --> N[Notifikasi WhatsApp & Email]
    L -- Ya --> O[Kamar: DIPESAN, Invoice Booking Dibuat]
    O --> P{Dibayar dalam 24 Jam?}
    P -- Tidak --> Q[Reservasi KEDALUWARSA, Kamar TERSEDIA]
    P -- Ya --> R[Midtrans Snap: QRIS / VA / E-Wallet]
    R --> S[Webhook Midtrans + Verifikasi Signature]
    S --> T{Status Settlement?}
    T -- Tidak --> U[Status Pending / Gagal, Cek Ulang]
    T -- Ya --> V[Invoice LUNAS, Reservasi LUNAS]
    V --> W[Pengelola: Check-in]
    W --> X[Kamar: TERISI, Tenancy AKTIF]
    X --> Y[Cron Tagihan Bulanan H-7]
    Y --> Z[Pengingat WhatsApp & Email H-3 dan H-0]
    Z --> AA[Penghuni Bayar via Midtrans]
    AA --> AB{Lunas?}
    AB -- Belum --> AC[Status TERLAMBAT, Monitoring Keuangan]
    AC --> Z
    AB -- Sudah --> AD[Masuk Riwayat & Laporan Keuangan]
    AD --> AE{Masa Sewa Berakhir?}
    AE -- Belum --> Y
    AE -- Ya --> AF[Pengelola: Check-out]
    AF --> AG{Ada Tagihan Belum Lunas?}
    AG -- Ya --> AH[Konfirmasi Admin]
    AH --> AI[Tenancy SELESAI, Kamar TERSEDIA]
    AG -- Tidak --> AI
```

---

## 8. Kebutuhan Non-Fungsional (SEO, Keamanan, & Performa)
*Syarat wajib agar website siap rilis ke publik (production-ready).*

- **SEO**:
  - Setiap halaman publik memiliki `<title>` dinamis (contoh: "Kamar A-101 | Kos Omi"), meta description unik, dan Open Graph tags (og:title, og:description, og:image, og:url).
  - Halaman detail kamar menggunakan structured data JSON-LD tipe `Accommodation` atau `Product` untuk membantu mesin pencari.
  - Sitemap otomatis (`/sitemap.xml`) dan `robots.txt` yang memblokir seluruh area login dan API.
  - URL menggunakan slug yang ramah SEO dan tidak mengekspos ID internal database.
  - Halaman publik dirender di server (SSR atau SSG dengan revalidasi) agar terindeks dengan baik.
- **Keamanan**:
  - Seluruh trafik wajib HTTPS. Header keamanan dipasang: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, dan `Referrer-Policy`.
  - Proteksi CSRF pada seluruh Server Actions dan form, memanfaatkan mekanisme origin check bawaan Next.js ditambah token untuk endpoint sensitif.
  - Sanitasi input untuk mencegah XSS. Seluruh input divalidasi menggunakan Zod di sisi server sebelum diproses.
  - Autorisasi berbasis peran dicek di setiap Server Action dan route handler (bukan hanya di UI). Middleware hanya sebagai lapis pertama.
  - Kontrol akses per data (row-level) untuk penghuni: query hanya mengembalikan data milik `user_id` yang sedang login.
  - Webhook Midtrans wajib verifikasi signature SHA512 (`order_id` + `status_code` + `gross_amount` + Server Key) dan pengecekan ulang status melalui Status API.
  - Rate limiting pada endpoint login, registrasi, lupa password, dan pembuatan transaksi pembayaran menggunakan Upstash Redis.
  - Upload KTP divalidasi tipe MIME dan ukuran di server (JPG, PNG, maksimal 2 MB), disimpan di penyimpanan privat, dan diakses melalui signed URL berumur pendek.
  - Data sensitif (password, token, Server Key) tidak pernah dicatat di log aplikasi.
  - Audit log untuk seluruh aksi perubahan data penting oleh pengguna internal.
  - Pencadangan database otomatis harian oleh penyedia Neon (point-in-time recovery).
- **Performa**:
  - Gambar kamar dioptimasi menggunakan komponen `<Image>` Next.js dengan format WebP atau AVIF dan lazy loading.
  - Lazy loading komponen berat seperti grafik laporan (Recharts) dan Midtrans Snap dengan `dynamic import`.
  - Caching data publik (katalog kamar) dengan revalidasi `revalidateTag` saat status kamar berubah.
  - Halaman laporan bulan lalu di-cache; data hari ini diambil langsung.
  - Target Core Web Vitals: LCP di bawah 2,5 detik, CLS di bawah 0,1, dan INP di bawah 200 ms pada koneksi 4G.
  - Indeks database pada kolom yang sering difilter: `rooms.status`, `invoices.status`, `invoices.due_date`, `payments.transaction_status`, dan `reservations.status`.
  - Desain responsif mobile-first dengan ukuran bundle JavaScript di bawah 250 KB (gzip) untuk halaman publik.

---

## 9. Panduan Bahasa, Copywriting, & Data Dummy
*Panduan nada bicara (Tone of Voice) dan contoh data agar prototipe terasa nyata.*

- **Gaya Bahasa**: Profesional, ramah, dan membumi. Gunakan kata "Anda" untuk pengguna dan "Kami" untuk pengelola Kos Omi. Kalimat pendek, jelas, dan bebas istilah teknis di antarmuka pengguna. Contoh: "Pembayaran Anda sudah kami terima." bukan "Transaksi settlement berhasil diproses oleh gateway."
- **Istilah Antarmuka**: Gunakan "Tagihan", "Riwayat Pembayaran", "Kamar Kosong", "Sedang Dipesan", "Terisi", "Check-in", dan "Check-out". Istilah teknis seperti `order_id` hanya muncul di halaman Keuangan.
- **Instruksi Data Dummy**: JANGAN PERNAH MENGGUNAKAN "Lorem Ipsum". Selalu gunakan data dummy berbahasa Indonesia yang relevan dengan konteks Kos Omi.
  - **Kamar**: Kode `A-101` sampai `A-116`, `B-201` sampai `B-216`, `C-301` sampai `C-316`, `D-401` sampai `D-416`, dan `E-501` sampai `E-503` (total 67 kamar). Tipe: Standar Non-AC (Rp 750.000), Standar AC (Rp 1.100.000), dan Deluxe AC dengan kamar mandi dalam (Rp 1.450.000).
  - **Alamat Properti**: Jl. Sungai Bangek, Kelurahan Balai Gadang, Kecamatan Koto Tangah, Kota Padang, Sumatera Barat 25586 (di sekitar Kampus III UIN Imam Bonjol Padang).
  - **Penghuni Aktif**: Rina Wulandari (A-101, check-in 3 Januari 2025), Dimas Prasetyo (B-205, check-in 15 Februari 2025), Siti Nurhaliza (C-310, check-in 1 Maret 2025).
  - **Calon Penghuni**: Bagas Kurniawan (reservasi MENUNGGU_VERIFIKASI untuk D-404), Anisa Permata (reservasi MENUNGGU_PEMBAYARAN untuk A-112, invoice BOOKING Rp 2.200.000).
  - **Pengelola**: Yanti Susanti (pengelola@kosomi.id), Keuangan: Arif Hidayat (keuangan@kosomi.id), Admin: Omi Pratama (admin@kosomi.id).
  - **Transaksi Dummy**: Order `KOS-202506-00012` (QRIS, Rp 1.100.000, settlement), `KOS-202506-00013` (BCA VA, Rp 1.450.000, pending), `KOS-202506-00014` (GoPay, Rp 750.000, expire).
  - **Nomor Invoice Dummy**: `INV-202506-00045`, `INV-202506-00046`.
  - **Pesan Notifikasi Contoh**: "Halo Rina, tagihan sewa kamar A-101 periode Juni 2025 sebesar Rp 1.100.000 jatuh tempo 5 Juni 2025. Bayar mudah melalui QRIS atau Virtual Account di aplikasi Kos Omi."

---

## 10. Fondasi Teknis (Untuk Tim Pengembang / Programmer & AI)
*Petunjuk arsitektur teknis spesifik.*

- **Bahasa & Framework**: TypeScript dengan Next.js 15 (App Router, Server Components, Server Actions, Route Handlers), Node.js 20 LTS. Dipilih karena mendukung halaman publik yang SEO-friendly sekaligus dasbor internal dalam satu basis kode, serta deployment yang mudah di Vercel.
- **Tampilan Antarmuka (UI)**: Tailwind CSS v4, shadcn/ui (Button, Card, Input, Dialog, AlertDialog, Table, Badge, Dropdown Menu, Tabs, Select, Sheet untuk drawer mobile, Skeleton, Toast via Sonner), Lucide Icons, dan Recharts untuk grafik laporan.
- **Autentikasi**: Auth.js v5 (NextAuth) dengan provider Credentials (Email dan Password), strategi sesi JWT, hashing password menggunakan bcryptjs (cost 12). Peran (role) disimpan di token dan diverifikasi ulang di server.
- **Validasi & Form**: Zod untuk skema validasi, React Hook Form untuk form di sisi klien.
- **Basis Data (Database)**: Neon PostgreSQL (serverless) dengan Drizzle ORM dan Drizzle Kit untuk migrasi.
- **Pembayaran**: Midtrans Snap (Snap API v1) dengan Core API Status untuk verifikasi. Notifikasi melalui webhook `POST /api/webhooks/midtrans`. Mode Sandbox untuk pengembangan, Production untuk rilis.
- **Notifikasi**: Resend untuk Email (template React Email), dan Fonnte sebagai penyedia WhatsApp (dapat diganti ke WhatsApp Cloud API resmi Meta melalui satu adapter).
- **Penyimpanan Berkas**: Vercel Blob (privat) untuk foto KTP dan bukti PDF. Akses melalui signed URL.
- **Rate Limiting & Cache**: Upstash Redis untuk rate limiting dan penyimpanan lock job.
- **Job Terjadwal**: Vercel Cron untuk pembuatan tagihan harian, pengingat, dan pembatalan reservasi kedaluwarsa.
- **Pembuatan PDF**: `@react-pdf/renderer` untuk bukti pembayaran.
- **Hosting**: Vercel (region Singapore, `sin1`) dengan domain HTTPS.
- **Pengujian**: Vitest untuk unit test (logika signature Midtrans, perhitungan tagihan), Playwright untuk end-to-end test alur reservasi hingga check-out.
- **Arsitektur Pembayaran Berlapis**: Seluruh pemanggilan gateway dibungkus dalam `lib/payment/gateway.ts` dengan antarmuka `PaymentGateway` (createTransaction, getStatus, verifySignature). Implementasi `MidtransGateway` adalah default. Ini memudahkan penggantian gateway di masa depan tanpa mengubah modul bisnis.

### Struktur Skema Database Nyata
*Skema Drizzle ORM untuk Neon PostgreSQL. Tipe data menggunakan pgEnum untuk status agar konsisten.*

```typescript
// src/db/schema.ts
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ===== ENUM =====
export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "PENGELOLA",
  "KEUANGAN",
  "CALON_PENGHUNI",
  "PENGHUNI",
]);

export const roomStatusEnum = pgEnum("room_status", [
  "TERSEDIA",
  "DIPESAN",
  "TERISI",
  "NONAKTIF",
]);

export const roomTypeEnum = pgEnum("room_type", [
  "STANDAR_NON_AC",
  "STANDAR_AC",
  "DELUXE_AC",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "MENUNGGU_VERIFIKASI",
  "DITOLAK",
  "MENUNGGU_PEMBAYARAN",
  "LUNAS",
  "CHECKIN",
  "KEDALUWARSA",
  "DIBATALKAN",
]);

export const invoiceTypeEnum = pgEnum("invoice_type", [
  "BOOKING",
  "DEPOSIT",
  "SEWA_BULANAN",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "BELUM_BAYAR",
  "MENUNGGU_PEMBAYARAN",
  "LUNAS",
  "TERLAMBAT",
  "KEDALUWARSA",
  "DIBATALKAN",
]);

export const tenancyStatusEnum = pgEnum("tenancy_status", [
  "AKTIF",
  "SELESAI",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "WHATSAPP",
  "EMAIL",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "PENDING",
  "SENT",
  "FAILED",
]);

// ===== TABEL =====
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 180 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(), // format 62xxxxxxxxxx
    role: userRoleEnum("role").notNull().default("CALON_PENGHUNI"),
    isActive: boolean("is_active").notNull().default(true),
    whatsappNotifEnabled: boolean("whatsapp_notif_enabled").notNull().default(true),
    failedLoginCount: integer("failed_login_count").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    index("users_role_idx").on(t.role),
  ]
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 10 }).notNull(), // contoh: A-101
    floor: integer("floor").notNull(),
    type: roomTypeEnum("type").notNull().default("STANDAR_NON_AC"),
    status: roomStatusEnum("status").notNull().default("TERSEDIA"),
    areaSqm: integer("area_sqm").notNull().default(12),
    monthlyPrice: integer("monthly_price").notNull(), // Rupiah, tanpa desimal
    depositAmount: integer("deposit_amount").notNull(),
    facilities: jsonb("facilities").$type<string[]>().notNull().default([]),
    description: text("description"),
    photoUrls: jsonb("photo_urls").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("rooms_code_unique").on(t.code),
    index("rooms_status_idx").on(t.status),
    index("rooms_floor_idx").on(t.floor),
  ]
);

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 20 }).notNull(), // contoh: RSV-250601-0007
    userId: uuid("user_id").notNull().references(() => users.id),
    roomId: uuid("room_id").notNull().references(() => rooms.id),
    startDate: date("start_date").notNull(),
    durationMonths: integer("duration_months").notNull(), // 1, 3, 6, 12
    status: reservationStatusEnum("status").notNull().default("MENUNGGU_VERIFIKASI"),
    idCardUrl: varchar("id_card_url", { length: 500 }).notNull(), // path privat
    notes: text("notes"),
    verifiedBy: uuid("verified_by").references(() => users.id),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    rejectReason: text("reject_reason"),
    paymentDeadline: timestamp("payment_deadline", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("reservations_code_unique").on(t.code),
    index("reservations_status_idx").on(t.status),
    index("reservations_user_idx").on(t.userId),
  ]
);

export const tenancies = pgTable(
  "tenancies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    roomId: uuid("room_id").notNull().references(() => rooms.id),
    reservationId: uuid("reservation_id").references(() => reservations.id),
    checkInDate: date("check_in_date").notNull(),
    checkOutDate: date("check_out_date"),
    contractEndDate: date("contract_end_date").notNull(),
    monthlyPrice: integer("monthly_price").notNull(), // snapshot harga saat check-in
    dueDay: integer("due_day").notNull().default(5),
    depositRefunded: boolean("deposit_refunded").notNull().default(false),
    status: tenancyStatusEnum("status").notNull().default("AKTIF"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tenancies_room_status_idx").on(t.roomId, t.status),
    index("tenancies_user_idx").on(t.userId),
  ]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 25 }).notNull(), // INV-202506-00045
    userId: uuid("user_id").notNull().references(() => users.id),
    reservationId: uuid("reservation_id").references(() => reservations.id),
    tenancyId: uuid("tenancy_id").references(() => tenancies.id),
    type: invoiceTypeEnum("type").notNull(),
    periodMonth: varchar("period_month", { length: 7 }), // 2025-06, null untuk BOOKING/DEPOSIT
    amount: integer("amount").notNull(),
    dueDate: date("due_date").notNull(),
    status: invoiceStatusEnum("status").notNull().default("BELUM_BAYAR"),
    midtransOrderId: varchar("midtrans_order_id", { length: 50 }), // KOS-202506-00045
    snapToken: varchar("snap_token", { length: 120 }),
    snapRedirectUrl: varchar("snap_redirect_url", { length: 500 }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("invoices_number_unique").on(t.invoiceNumber),
    uniqueIndex("invoices_order_id_unique").on(t.midtransOrderId),
    uniqueIndex("invoices_tenancy_period_unique").on(t.tenancyId, t.periodMonth),
    index("invoices_status_idx").on(t.status),
    index("invoices_due_date_idx").on(t.dueDate),
    index("invoices_user_idx").on(t.userId),
  ]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceId: uuid("invoice_id").notNull().references(() => invoices.id),
    midtransOrderId: varchar("midtrans_order_id", { length: 50 }).notNull(),
    midtransTransactionId: varchar("midtrans_transaction_id", { length: 80 }),
    paymentType: varchar("payment_type", { length: 40 }), // qris, bank_transfer, gopay, shopeepay
    bank: varchar("bank", { length: 20 }), // bca, bni, bri, permata, mandiri
    grossAmount: integer("gross_amount").notNull(),
    transactionStatus: varchar("transaction_status", { length: 30 }).notNull(), // pending, settlement, capture, expire, cancel, deny
    fraudStatus: varchar("fraud_status", { length: 30 }),
    signatureKey: varchar("signature_key", { length: 128 }),
    settlementTime: timestamp("settlement_time", { withTimezone: true }),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payments_transaction_unique").on(t.midtransTransactionId),
    index("payments_status_idx").on(t.transactionStatus),
    index("payments_invoice_idx").on(t.invoiceId),
  ]
);

export const notificationLogs = pgTable(
  "notification_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    channel: notificationChannelEnum("channel").notNull(),
    template: varchar("template", { length: 60 }).notNull(), // reservasi_disetujui, pengingat_tagihan, dst.
    recipient: varchar("recipient", { length: 180 }).notNull(),
    status: notificationStatusEnum("status").notNull().default("PENDING"),
    attempts: integer("attempts").notNull().default(0),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notif_status_idx").on(t.status)]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => users.id),
    action: varchar("action", { length: 80 }).notNull(), // ROOM_STATUS_UPDATED, RESERVATION_APPROVED, dst.
    entity: varchar("entity", { length: 40 }).notNull(),
    entityId: varchar("entity_id", { length: 64 }).notNull(),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_entity_idx").on(t.entity, t.entityId)]
);

export const settings = pgTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(), // contoh: due_day_default, deposit_percent
  value: varchar("value", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ===== RELASI =====
export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
  tenancies: many(tenancies),
  invoices: many(invoices),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  reservations: many(reservations),
  tenancies: many(tenancies),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  user: one(users, { fields: [reservations.userId], references: [users.id] }),
  room: one(rooms, { fields: [reservations.roomId], references: [rooms.id] }),
  invoices: many(invoices),
}));

export const tenanciesRelations = relations(tenancies, ({ one, many }) => ({
  user: one(users, { fields: [tenancies.userId], references: [users.id] }),
  room: one(rooms, { fields: [tenancies.roomId], references: [rooms.id] }),
  reservation: one(reservations, { fields: [tenancies.reservationId], references: [reservations.id] }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  reservation: one(reservations, { fields: [invoices.reservationId], references: [reservations.id] }),
  tenancy: one(tenancies, { fields: [invoices.tenancyId], references: [tenancies.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));
```

### Variabel Lingkungan (`.env.example`)
```env
# ===== APLIKASI =====
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ===== DATABASE (Neon PostgreSQL) =====
DATABASE_URL=postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/kosomi?sslmode=require

# ===== AUTENTIKASI (Auth.js v5) =====
AUTH_SECRET=isi_dengan_string_acak_minimal_32_karakter
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# ===== PEMBAYARAN (Midtrans) =====
# Gunakan kredensial Sandbox saat pengembangan, Production saat rilis
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxx
# Snap JS: sandbox = https://app.sandbox.midtrans.com/snap/snap.js | production = https://app.midtrans.com/snap/snap.js
NEXT_PUBLIC_MIDTRANS_SNAP_JS_URL=https://app.sandbox.midtrans.com/snap/snap.js
# Snap API base: sandbox = https://app.sandbox.midtrans.com | production = https://app.midtrans.com
MIDTRANS_SNAP_BASE_URL=https://app.sandbox.midtrans.com
# Core API status base: sandbox = https://api.sandbox.midtrans.com | production = https://api.midtrans.com
MIDTRANS_CORE_BASE_URL=https://api.sandbox.midtrans.com

# ===== EMAIL (Resend) =====
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Kos Omi <noreply@kosomi.id>"

# ===== WHATSAPP (Fonnte) =====
WHATSAPP_PROVIDER=fonnte
WHATSAPP_API_URL=https://api.fonnte.com/send
WHATSAPP_API_TOKEN=isi_token_fonnte
WHATSAPP_SENDER_NUMBER=6281200000000

# ===== PENYIMPANAN BERKAS (Vercel Blob) =====
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxx

# ===== RATE LIMIT (Upstash Redis) =====
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=isi_token_upstash

# ===== JOB TERJADWAL (Vercel Cron) =====
CRON_SECRET=isi_string_acak_untuk_otorisasi_cron

# ===== PENGATURAN BISNIS DEFAULT =====
DEFAULT_DUE_DAY=5
DEFAULT_DEPOSIT_PERCENT=100
BOOKING_PAYMENT_WINDOW_HOURS=24
TIMEZONE=Asia/Jakarta
```

---

## 11. Tahapan Pengerjaan & Task Breakdown (Actionable Work Breakdown Structure)
*Daftar tugas terstruktur dan terurut (Atomic Tasks) dengan format checklist markdown `- [ ] **Task X.Y`. Dirancang khusus agar pengguna dapat menginstruksikan AI Coding Assistant (Antigravity, Cursor, Claude Code, Roo Code, dll.) untuk mengeksekusi proyek langkah demi langkah secara terukur, modular, dan bebas dari kehabisan context window.*

### Tahap 1: Fondasi Proyek, UI/UX, & Semua Halaman (Dummy Data)
*Tujuan: Membangun seluruh antarmuka visual secara 100% lengkap dan responsif menggunakan data dummy sebelum menyentuh database. Urutan modul mengikuti prioritas user: Login dan role, Kelola kamar, Reservasi dan verifikasi, Pembayaran Midtrans, Tagihan bulanan dan riwayat, Laporan keuangan.*
- [x] **Task 1.1 (Foundations & Design System)**: Setup Next.js 15 dengan Tailwind CSS v4, konfigurasi token warna (Primary HSL(217, 91%, 45%), Accent HSL(152, 69%, 36%), Warning HSL(38, 92%, 50%), Destructive HSL(0, 72%, 51%)), font Plus Jakarta Sans dan Inter via `next/font`, Lucide Icons, dan pasang komponen shadcn/ui (Button, Card, Input, Label, Dialog, AlertDialog, Table, Badge, Dropdown Menu, Tabs, Select, Sheet, Skeleton, Sonner).
- [x] **Task 1.2 (Layouts & Persistent Navigation)**: Buat Root Layout, Public Layout (Navbar + menu hamburger mobile + Footer), Auth Layout terpusat, Dashboard Layout desktop dengan Sidebar fixed, dan Dashboard Layout mobile dengan Bottom Navigation serta drawer Sheet.
- [x] **Task 1.3 (Halaman Publik)**: Buat `/`, `/kamar` (grid 67 kamar dengan filter lantai, tipe, dan status), `/kamar/[kode]` (detail A-101 dengan galeri dan tombol reservasi), `/tentang`, `/faq`, dan `/kontak`, lengkap dengan data dummy kamar nyata.
- [x] **Task 1.4 (Login, Daftar, dan Role Routing UI)**: Buat `/login`, `/daftar`, `/lupa-password`, `/reset-password/[token]`, halaman `/403` dan `/404`, dengan validasi form visual (React Hook Form + Zod) dan simulasi pengalihan dasbor berdasarkan peran dummy.
- [x] **Task 1.5 (Kelola Kamar Pengelola)**: Buat `/pengelola/dashboard`, `/pengelola/kamar` (tabel desktop dan kartu mobile untuk 67 kamar dummy), modal ubah status kamar dengan transisi valid, modal edit harga dan fasilitas, serta `/pengelola/kamar/[id]` dengan riwayat penghuni dummy.
- [x] **Task 1.6 (Reservasi & Verifikasi UI)**: Buat `/reservasi/[kodeKamar]` (form tanggal masuk, durasi 1/3/6/12 bulan, unggah KTP dummy dengan preview), `/calon/dashboard`, `/calon/reservasi` (tabel dummy dengan status berwarna), `/calon/reservasi/[id]` (timeline status), `/pengelola/reservasi` (filter status dan pencarian), dan `/pengelola/reservasi/[id]` (tinjau KTP, tombol Setujui dan Tolak dengan dialog alasan).
- [x] **Task 1.7 (Pembayaran UI)**: Buat `/calon/pembayaran/[invoiceId]` dan `/pembayaran/selesai` dengan tampilan rincian invoice dummy (INV-202506-00045), tombol "Bayar Sekarang" dengan badge "Pembayaran Aman via Midtrans", dan status tampilan Lunas, Menunggu, serta Kedaluwarsa dummy.
- [x] **Task 1.8 (Tagihan Bulanan & Riwayat UI)**: Buat `/penghuni/dashboard` (kartu tagihan bulan berjalan, ringkasan kamar, tiga riwayat terakhir), `/penghuni/tagihan` (filter status dan periode), `/penghuni/tagihan/[id]` (rincian dan tombol unduh bukti), `/penghuni/riwayat` (tabel dengan pencarian dan filter tahun), `/penghuni/kamar`, dan `/penghuni/profil`.
- [x] **Task 1.9 (Check-in, Check-out, & Daftar Penghuni UI)**: Buat `/pengelola/checkin`, `/pengelola/checkout` (dialog peringatan tagihan belum lunas dummy), `/pengelola/penghuni`, dan `/pengelola/penghuni/[id]` dengan data penghuni dummy (Rina Wulandari, Dimas Prasetyo, Siti Nurhaliza).
- [x] **Task 1.10 (Laporan Keuangan UI)**: Buat `/keuangan/dashboard` (kartu ringkasan dan grafik Recharts tren 12 bulan), `/keuangan/laporan` (tab Harian dan Bulanan, filter periode, tombol Ekspor CSV dummy), `/keuangan/transaksi`, `/keuangan/transaksi/[id]` (data dummy KOS-202506-00012 dan turunannya), dan `/keuangan/tagihan` (monitoring tagihan terlambat dengan tombol kirim pengingat dummy).
- [x] **Task 1.11 (Admin Area UI)**: Buat `/admin/dashboard`, `/admin/pengguna` (tabel akun dengan filter peran dan modal tambah Pengelola atau Keuangan), `/admin/pengaturan` (form nama kos, tanggal jatuh tempo, persentase deposit, masa reservasi), `/admin/log-aktivitas`, dan `/admin/notifikasi`.
- [x] **Task 1.12 (Responsiveness & UAT Visual Check)**: Uji seluruh halaman pada lebar 360px, 768px, dan 1440px. Pastikan tabel berubah menjadi kartu di mobile, touch target minimal 44px, Bottom Navigation berfungsi, dan skeleton loading tampil di setiap halaman dinamis.

### Tahap 2: Database, Autentikasi, & Integrasi Data Dinamis
*Tujuan: Menghidupkan aplikasi dengan database Neon PostgreSQL, sistem autentikasi Email dan Password, serta Server Actions. Urutan tetap mengikuti prioritas user.*
- [x] **Task 2.1 (Database Schema & Migrations)**: Buat `src/db/schema.ts` sesuai Bab 10 (tabel `users`, `rooms`, `reservations`, `tenancies`, `invoices`, `payments`, `notification_logs`, `audit_logs`, `settings`), konfigurasi `drizzle.config.ts`, jalankan migrasi ke Neon, dan buat `src/db/seed.ts` untuk 67 kamar (A-101 sampai E-503), akun Admin (admin@kosomi.id), Pengelola (pengelola@kosomi.id), Keuangan (keuangan@kosomi.id), serta data dummy penghuni dan transaksi.
- [x] **Task 2.2 (Authentication Login per Role)**: Pasang Auth.js v5 dengan provider Credentials (Email dan Password), hashing bcryptjs cost 12, callback JWT yang menyimpan role, pembatasan login gagal 5 kali dalam 15 menit (`failed_login_count`, `locked_until`), halaman `/daftar` yang membuat akun CALON_PENGHUNI, dan alur lupa password melalui token sekali pakai berumur 30 menit.
- [x] **Task 2.3 (Route Middleware & Authorization Helper)**: Buat `middleware.ts` untuk melindungi prefiks `/calon`, `/penghuni`, `/pengelola`, `/keuangan`, dan `/admin`, serta fungsi `requireRole()` di setiap Server Action dan route handler. Pengguna tanpa hak diarahkan ke `/403`, dan akun nonaktif langsung ditolak.
- [x] **Task 2.4 (Kelola Kamar: Server Actions)**: Buat `src/actions/rooms.ts` dengan fungsi `getRooms(filter)`, `updateRoomStatus(id, status)` (dengan validasi transisi status), dan `updateRoomDetail(id, data)` memakai Zod. Pastikan setiap perubahan ditulis ke `audit_logs` dan memanggil `revalidateTag("rooms")`.
- [x] **Task 2.5 (Reservasi & Verifikasi: Server Actions)**: Buat `src/actions/reservations.ts` untuk `createReservation` (validasi satu reservasi aktif per pengguna, tanggal minimal H+3, unggah KTP ke Vercel Blob privat dengan validasi MIME dan 2 MB), `approveReservation` (membuat invoice BOOKING dan kamar menjadi DIPESAN), `rejectReservation` (alasan minimal 10 karakter), serta job pembatalan reservasi kedaluwarsa.
- [x] **Task 2.6 (Pembayaran Midtrans: Gateway Adapter & Snap)**: Buat `src/lib/payment/gateway.ts` dengan interface `PaymentGateway` dan implementasi `MidtransGateway`. Fungsi `createSnapTransaction` mengirim POST ke `${MIDTRANS_SNAP_BASE_URL}/snap/v1/transactions` dengan Basic Auth (base64 Server Key + ":"), menyimpan `snap_token` dan `redirect_url` pada invoice, serta mencegah transaksi ganda untuk invoice yang sama.
- [x] **Task 2.7 (Webhook Midtrans & Verifikasi Status)**: Buat `src/app/api/webhooks/midtrans/route.ts` yang memverifikasi signature SHA512 (`order_id` + `status_code` + `gross_amount` + `MIDTRANS_SERVER_KEY`), memanggil `${MIDTRANS_CORE_BASE_URL}/v2/{order_id}/status` untuk konfirmasi, membandingkan nominal invoice dan transaksi, bersifat idempoten melalui `midtrans_transaction_id`, lalu memperbarui `payments`, `invoices`, dan `reservations`.
- [x] **Task 2.8 (Tagihan Bulanan: Generator & Cron)**: Buat `src/lib/billing/generate.ts` dan endpoint `/api/cron/generate-tagihan` yang diamankan `CRON_SECRET`. Fungsi membuat invoice SEWA_BULANAN untuk tenancy AKTIF pada H-7 jatuh tempo dengan nomor `INV-[YYYYMM]-[5 digit]`, dicegah ganda oleh unique index `tenancy_id + period_month`, serta menandai TERLAMBAT setelah lewat 3 hari.
- [x] **Task 2.9 (Check-in & Check-out: Server Actions)**: Buat `checkInTenant(reservationId)` yang memeriksa status LUNAS dan tanggal masuk, lalu membuat tenancy AKTIF, mengubah kamar menjadi TERISI, dan role pengguna menjadi PENGHUNI. Buat `checkOutTenant(tenancyId, confirmUnpaid)` yang memeriksa tagihan belum lunas, lalu mengubah tenancy menjadi SELESAI dan kamar menjadi TERSEDIA.
- [x] **Task 2.10 (Laporan Keuangan: Query & Ekspor)**: Buat `src/lib/reports/revenue.ts` dengan query agregasi pemasukan harian dan bulanan (hanya status `settlement` dan `capture`, zona waktu Asia/Jakarta, dikelompokkan per jenis invoice dan metode pembayaran), endpoint `/api/reports/export` untuk CSV UTF-8 dengan BOM, serta caching bulan lalu melalui `unstable_cache`.
- [x] **Task 2.11 (Frontend Data Binding: Publik & Calon Penghuni)**: Hubungkan `/`, `/kamar`, `/kamar/[kode]`, `/reservasi/[kodeKamar]`, `/calon/*`, dan `/pembayaran/selesai` dengan database dan Server Actions. Status pembayaran di halaman selesai diambil ulang dari server, bukan dari parameter URL.
- [x] **Task 2.12 (Frontend Data Binding: Penghuni & Pengelola)**: Hubungkan `/penghuni/*` (filter `user_id` di server), `/pengelola/*` (kamar, reservasi, check-in, check-out, penghuni), dan `/keuangan/tagihan` dengan data nyata dan mutasi yang sudah diuji.
- [x] **Task 2.13 (Frontend Data Binding: Keuangan & Admin)**: Hubungkan `/keuangan/dashboard`, `/keuangan/laporan`, `/keuangan/transaksi`, `/admin/*` (pengguna, pengaturan, log aktivitas, notifikasi) dengan query nyata, termasuk tombol Rekonsiliasi yang membandingkan total dengan status gateway.

### Tahap 3: Integrasi Pihak Ketiga, Keamanan, SEO, & Deployment
*Tujuan: Menyempurnakan integrasi notifikasi WhatsApp dan Email, keamanan produksi, SEO, pengujian UAT, dan rilis ke Vercel.*
- [x] **Task 3.1 (Notifikasi Email via Resend)**: Buat `src/lib/notify/email.ts` dan template React Email untuk reservasi dibuat, disetujui, ditolak, pembayaran lunas, pengingat tagihan H-3 dan H-0, tagihan terlambat, check-in, dan check-out. Setiap pengiriman dicatat di `notification_logs` dengan retry maksimal 3 kali.
- [x] **Task 3.2 (Notifikasi WhatsApp via Fonnte)**: Buat `src/lib/notify/whatsapp.ts` sebagai adapter `WHATSAPP_PROVIDER` dengan implementasi Fonnte (`WHATSAPP_API_URL`, `WHATSAPP_API_TOKEN`). Validasi nomor format 62, hormati preferensi `whatsapp_notif_enabled`, dan catat setiap percobaan di `notification_logs`.
- [x] **Task 3.3 (Pemicu Notifikasi Otomatis)**: Hubungkan seluruh event (reservasi dibuat/disetujui/ditolak, pembayaran lunas dari webhook, pengingat dari cron, check-in, check-out) ke layanan notifikasi, serta buat halaman `/admin/notifikasi` dengan data nyata dan fitur kirim ulang untuk status FAILED.
- [x] **Task 3.4 (Keamanan & Non-Fungsional)**: Pasang header keamanan (HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy), proteksi CSRF pada seluruh form, sanitasi XSS, validasi Zod di seluruh input, rate limiting Upstash Redis pada login, registrasi, lupa password, dan pembuatan transaksi, serta signed URL berumur 5 menit untuk KTP.
- [x] **Task 3.5 (SEO & Open Graph)**: Pasang `generateMetadata` dinamis di setiap halaman publik (title, description, og:title, og:description, og:image, og:url), JSON-LD tipe `Accommodation` pada `/kamar/[kode]`, `sitemap.ts` yang hanya memuat halaman publik, dan `robots.ts` yang memblokir area login serta `/api`.
- [x] **Task 3.6 (Performa & Optimasi)**: Terapkan `<Image>` dengan WebP atau AVIF untuk galeri kamar, `dynamic import` untuk Recharts dan Midtrans Snap, indeks database sesuai Bab 8, dan verifikasi Core Web Vitals (LCP di bawah 2,5 detik) pada halaman katalog.
- [x] **Task 3.7 (Pengujian Otomatis)**: Tulis unit test Vitest untuk verifikasi signature Midtrans, perhitungan tagihan, dan transisi status kamar. Tulis test Playwright untuk alur utama: daftar, reservasi, verifikasi, bayar (sandbox), check-in, tagihan, dan check-out.
- [x] **Task 3.8 (UAT Kos Omi & Bugfix)**: Jalankan skenario UAT bersama tim Kos Omi berdasarkan kriteria sukses: semua transaksi tercatat, status kamar akurat, dan laporan cocok dengan dashboard Midtrans sandbox. Perbaiki seluruh temuan dan catat hasilnya.
- [x] **Task 3.9 (Production Build & Deployment)**: Konfigurasi `.env.production` dengan kredensial Midtrans Production (`MIDTRANS_IS_PRODUCTION=true`), daftarkan URL webhook `https://[domain]/api/webhooks/midtrans` pada dashboard Midtrans, verifikasi `npm run build` lolos, deploy ke Vercel region `sin1`, konfigurasi Vercel Cron, dan pastikan HTTPS aktif.

---

## 12. Master Starter Prompt (Siap Coding untuk AI Agent)
*Salin prompt di bawah ini ke AI Coding Assistant (Google Antigravity / Cursor / Claude Code / GitHub Copilot / Roo Code / dll.) untuk memulai pengerjaan:*

```markdown
Halo! Kamu berperan sebagai Senior Fullstack Architect dan Lead Developer.
Saya ingin membangun aplikasi "Kos Omi" berdasarkan dokumen PRD ini.

Silakan baca file @PRD.md

TECH STACK WAJIB:
- Next.js 15 (App Router, Server Actions, Route Handlers), TypeScript, Node.js 20
- Tailwind CSS v4, shadcn/ui, Lucide Icons, Recharts
- Auth.js v5 (Credentials, Email dan Password, bcryptjs cost 12)
- Neon PostgreSQL + Drizzle ORM
- Midtrans Snap (QRIS, Virtual Account, E-Wallet) dengan verifikasi webhook SHA512
- Resend (Email) dan Fonnte (WhatsApp) melalui adapter
- Vercel Blob (privat), Upstash Redis, Vercel Cron

ATURAN EKSEKUSI (WAJIB DIPATUHI):
1. Kerjakan bertahap per FASE (Tahap 1, Tahap 2, Tahap 3) sesuai Bab 11. Dalam satu putaran, selesaikan SELURUH task pada satu fase secara tuntas dan mandiri, tanpa menyisakan halaman placeholder atau teks "sedang dalam pengembangan".
2. Jangan melompat ke fase berikutnya dalam putaran yang sama. Setelah satu fase selesai, laporkan ringkasan hasil (file yang dibuat atau diubah, cara menjalankan, dan daftar catatan) lalu BERHENTI dan MENUNGGU konfirmasi saya sebelum memulai fase berikutnya.
3. Pada Tahap 1, gunakan data dummy berbahasa Indonesia sesuai Bab 9. Dilarang menggunakan Lorem Ipsum.
4. Patuhi skema database di Bab 10 secara persis (nama tabel, enum, dan indeks). Jika ada kebutuhan perubahan skema, jelaskan terlebih dahulu dan minta persetujuan saya.
5. Patuhi Pedoman UI/UX di Bab 4: warna Primary HSL(217, 91%, 45%), font Plus Jakarta Sans dan Inter, sudut rounded-xl, shadow-sm, dan tampilan mobile-first.
6. Terapkan kontrol akses per peran (Bab 5) di setiap Server Action dan route handler, bukan hanya di UI.
7. Untuk integrasi Midtrans, ikuti dokumentasi resmi Snap API dan Status API, dan jangan pernah mengirim Server Key ke sisi klien.
8. Pada awal sesi, berikan ringkasan pemahaman Anda terhadap PRD, lalu tanyakan kesiapan saya untuk memulai Tahap 1.

Jika kamu sudah membaca dan memahami PRD, silakan berikan ringkasan singkat pemahamanmu dan tanyakan kesiapan saya untuk mulai dari Tahap 1 (Task 1.1)!
``