# Panduan Deployment Produksi & Konfigurasi Midtrans
## Sistem Manajemen & Reservasi Kos Omi (Task 3.9 PRD)

Dokumen ini merupakan panduan teknis operasional (*runbook*) lengkap untuk mendeploy sistem Kos Omi ke Vercel (Region `sin1` Singapore) dan menghubungkan gateway pembayaran Midtrans mode Produksi.

---

### I. Konfigurasi Dashboard Midtrans Production (MAP)

Sebelum melakukan deployment, pastikan akun Midtrans telah disetujui untuk mode Produksi (*Live/Production Mode*).

1. **Akses Merchant Administration Portal (MAP)**
   - Buka browser dan login ke: **[https://dashboard.midtrans.com/](https://dashboard.midtrans.com/)**
   - Pada pojok kiri atas dashboard, pastikan toggle status berada pada mode **PRODUCTION** (bukan Sandbox).

2. **Pengaturan URL Notifikasi & Webhook**
   - Masuk ke menu **Settings > Configuration**.
   - Isi form konfigurasi sebagai berikut:
     - **Payment Notification URL**:
       ```text
       https://kosomi.id/api/webhooks/midtrans
       ```
       *(Catatan: Midtrans akan mengirimkan HTTP POST dengan format JSON ke endpoint ini setiap kali ada perubahan status transaksi).*
     - **Finish Redirect URL**:
       ```text
       https://kosomi.id/pembayaran/selesai
       ```
     - **Unfinish Redirect URL**:
       ```text
       https://kosomi.id/kamar
       ```
     - **Error Redirect URL**:
       ```text
       https://kosomi.id/pembayaran/selesai
       ```
   - Klik tombol **Update** / **Simpan**.

3. **Pengambilan Kredensial Produksi (Access Keys)**
   - Masuk ke menu **Settings > Access Keys**.
   - Salin kredensial berikut dengan aman:
     - **Server Key** (Format: `Mid-server-xxxxxxxxxxxxxxxxxxxx`)
     - **Client Key** (Format: `Mid-client-xxxxxxxxxxxxxxxxxxxx`)
   - *Peringatan*: Jangan pernah mempublikasikan `Server Key` ke dalam git repository publik.

4. **Aktivasi Kanal Pembayaran (Payment Channels)**
   - Masuk ke menu **Settings > Payment Channels**.
   - Pastikan metode pembayaran berikut dalam status aktif sesuai PRD:
     - **QRIS**: GoPay, ShopeePay, Dana, LinkAja, BCA QRIS, dll.
     - **Virtual Account (VA)**: BCA VA, BNI VA, BRI VA, Mandiri Bill, Permata VA.
     - **Convenience Store (Opsi Tambahan)**: Indomaret / Alfamart.

---

### II. Pengaturan Database Neon PostgreSQL Production

Sistem Kos Omi menggunakan Neon Serverless PostgreSQL dengan Drizzle ORM.

1. **Pembuatan Database Branch Produksi**
   - Login ke konsol **[https://console.neon.tech/](https://console.neon.tech/)**.
   - Buat project atau branch baru bernama `production`.
   - Pilih region: **Asia Pacific (Singapore) `ap-southeast-1`** untuk meminimalkan latensi koneksi dengan server Vercel `sin1`.

2. **Migrasi Schema Database**
   - Ambil connection string database produksi dengan opsi pooled connection:
     ```bash
     DATABASE_URL="postgresql://[user]:[password]@[endpoint-pooler].ap-southeast-1.aws.neon.tech/kosomi_production?sslmode=require"
     ```
   - Jalankan perintah push schema tabel (tenancies, rooms, bills, payments, audit_logs, notification_logs) dari terminal:
     ```bash
     npx drizzle-kit push
     ```

---

### III. Daftar Environment Variables Vercel Production

Masukkan seluruh variabel lingkungan berikut ke dalam dashboard Vercel (**Project Settings > Environment Variables**) dengan target environment **Production**:

| Variable Key | Nilai / Format | Deskripsi |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `https://kosomi.id` | URL domain utama produksi |
| `NODE_ENV` | `production` | Lingkungan runtime Node.js |
| `DATABASE_URL` | `postgresql://...sslmode=require` | URL koneksi Neon PostgreSQL pooled |
| `AUTH_SECRET` | *32+ karakter string acak* | Enkripsi token session NextAuth v5 |
| `AUTH_URL` | `https://kosomi.id` | URL canonical autentikasi |
| `AUTH_TRUST_HOST` | `true` | Menghindari error proxy Vercel |
| `MIDTRANS_IS_PRODUCTION` | `true` | Mengaktifkan transaksi riil Midtrans |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | `true` | Memuat Snap.js versi produksi di browser |
| `MIDTRANS_SERVER_KEY` | `Mid-server-xxxxxxxx` | Kunci server rahasia Midtrans Production |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | `Mid-client-xxxxxxxx` | Kunci publik Midtrans client |
| `NEXT_PUBLIC_MIDTRANS_SNAP_JS_URL` | `https://app.midtrans.com/snap/snap.js` | Skrip resmi Midtrans Snap production |
| `MIDTRANS_SNAP_BASE_URL` | `https://app.midtrans.com` | Host endpoint Snap API |
| `MIDTRANS_CORE_BASE_URL` | `https://api.midtrans.com` | Host endpoint Core API |
| `RESEND_API_KEY` | `re_prod_xxxxxxxx` | API Key pengiriman email Resend |
| `EMAIL_FROM` | `Kos Omi <noreply@kosomi.id>` | Alamat pengirim email terverifikasi SPF/DKIM |
| `WHATSAPP_PROVIDER` | `fonnte` | Adapter gateway WhatsApp |
| `WHATSAPP_API_URL` | `https://api.fonnte.com/send` | Endpoint API Fonnte |
| `WHATSAPP_API_TOKEN` | *Token Fonnte Produksi* | Token akun Fonnte aktif |
| `WHATSAPP_SENDER_NUMBER`| `6281234567890` | Nomor WhatsApp resmi Kos Omi |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_xxxx` | Akses upload privat KTP calon penghuni |
| `UPSTASH_REDIS_REST_URL`| `https://xxxx.upstash.io` | URL REST Upstash Redis rate limiter |
| `UPSTASH_REDIS_REST_TOKEN`| *Token Upstash* | Token Upstash Redis |
| `CRON_SECRET` | *String acak minimal 32 karakter* | Header proteksi endpoint Vercel Cron |
| `DEFAULT_DUE_DAY` | `5` | Tanggal jatuh tempo bulanan (tanggal 5) |
| `TIMEZONE` | `Asia/Jakarta` | Zona waktu operasional (WIB) |

---

### IV. Deployment ke Vercel (Region `sin1` Singapore)

1. **Konfigurasi `vercel.json`**
   - File [vercel.json](file:///d:/kos_omi/vercel.json) telah dibuat pada repositori dengan spesifikasi:
     - **Region**: `sin1` (Singapore)
     - **Vercel Cron 1**: `/api/cron/generate-tagihan` pukul 00:05 WIB (`5 17 * * *` UTC)
     - **Vercel Cron 2**: `/api/cron/cancel-expired-reservations` setiap jam (`0 * * * *` UTC)
     - **Security Headers**: HSTS 2 tahun preload, CSP, anti-clickjacking `X-Frame-Options`, nosniff, CORS webhook Midtrans.

2. **Langkah Deploy via Vercel Dashboard**
   - Buka **[https://vercel.com/new](https://vercel.com/new)**.
   - Pilih repositori Git proyek Kos Omi (`kos_omi`).
   - Framework Preset: **Next.js**.
   - Root Directory: `./`.
   - Buka bagian **Environment Variables** dan masukkan daftar variabel dari Bab III.
   - Klik **Deploy**.

3. **Deploy via Vercel CLI (Alternatif)**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

---

### V. Konfigurasi Domain Kustom & Enforce HTTPS

1. **Pemasangan Domain di Vercel**
   - Pada proyek Vercel, masuk ke **Settings > Domains**.
   - Tambahkan domain: `kosomi.id` dan `www.kosomi.id`.
   - Pilih opsi redirect otomatis: `www.kosomi.id` diarahkan ke `https://kosomi.id`.

2. **Konfigurasi DNS Provider (Cloudflare / Registrar)**
   - Buat DNS record berikut pada penyedia domain:
     - **Type A**: `@` diarahkan ke IP `76.76.21.21`
     - **Type CNAME**: `www` diarahkan ke `cname.vercel-dns.com`
   - Vercel akan otomatis menerbitkan sertifikat SSL/TLS gratis (Let's Encrypt / DigiCert) dalam kurun waktu 5–15 menit.

3. **Verifikasi Keamanan HTTPS & HSTS**
   - Header `Strict-Transport-Security` yang dipasang pada [vercel.json](file:///d:/kos_omi/vercel.json) menjamin seluruh koneksi HTTP dipaksa beralih ke HTTPS:
     ```http
     Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
     ```
   - Lakukan uji verifikasi di browser: buka `http://kosomi.id` dan pastikan langsung teralihkan ke `https://kosomi.id` dengan gembok hijau valid.

---

### VI. Verifikasi Job Otomatis (Vercel Cron Jobs)

Setelah deployment berhasil:
1. Masuk ke dashboard proyek Vercel > Tab **Settings** > **Cron Jobs**.
2. Pastikan kedua cron job berikut terdaftar dan berstatus **Active**:
   - `/api/cron/generate-tagihan` (Jadwal: `5 17 * * *`)
   - `/api/cron/cancel-expired-reservations` (Jadwal: `0 * * * *`)
3. Vercel akan secara otomatis menyertakan header `Authorization: Bearer <CRON_SECRET>` saat memicu cron, sehingga rute aman dari pemanggilan pihak luar yang tidak sah.

---

### VII. Smoke Test Pasca-Deployment (Production Verification)

Lakukan pengujian cepat berikut setelah web aktif di produksi:
1. **Halaman Publik**: Buka `https://kosomi.id` dan `https://kosomi.id/kamar`, pastikan 67 kamar tampil cepat dengan WebP/AVIF.
2. **Uji Transaksi Midtrans**: Buat satu reservasi uji coba, klik Bayar, dan pastikan modal popup Midtrans Snap versi produksi (`app.midtrans.com`) terbuka dengan logo resmi Kos Omi dan pilihan metode pembayaran lengkap.
3. **Uji Webhook**: Selesaikan pembayaran uji, cek webhook log di dashboard Midtrans (respon HTTP 200 OK dari `https://kosomi.id/api/webhooks/midtrans`).
4. **Verifikasi Dashboard Pengelola**: Pastikan status kamar berubah menjadi `DIPESAN`, dan kuitansi pelunasan masuk ke dashboard Keuangan.
