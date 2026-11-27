# Panduan Alur Sistem & Spesifikasi Diagram Laporan — Sistem Informasi Kos Omi

Dokumen ini disusun berdasarkan kondisi **sistem terbaru** yang sudah live di **https://kos-omi-padang.netlify.app** (Database: Neon PostgreSQL, Autentikasi: NextAuth + Bcrypt, Pembayaran: Transfer Bank BRI `763701006296502` a.n. **YULASTRI** + QRIS *Segera Hadir*).

Gunakan dokumen ini sebagai acuan langsung untuk menggambar **Use Case Diagram**, **Activity Diagram**, dan **ERD** di Draw.io, StarUML, Lucidchart, Visio, atau Mermaid Live.

---

## 1. Use Case Diagram (5 Aktor / Role)

Sistem Kos Omi memiliki **5 aktor resmi**:
1. **Calon Penghuni** (`CALON_PENGHUNI`)
2. **Penghuni Aktif** (`PENGHUNI`)
3. **Pengelola Kos** (`PENGELOLA`)
4. **Staf Keuangan** (`KEUANGAN`)
5. **Admin Sistem** (`ADMIN`)

### Daftar Use Case Per Aktor

| Aktor | Daftar Use Case |
| :--- | :--- |
| **Calon Penghuni** | • Melihat Katalog & Detail Kamar Tersedia<br>• Registrasi Akun & Login<br>• Mengajukan Reservasi Kamar (Data Diri & Kontak Darurat — tanpa unggah KTP/KTM/KRS)<br>• Melihat Status & Timeline Reservasi<br>• Melakukan Konfirmasi Transfer Bank BRI<br>• Mengajukan Reset Kata Sandi via WhatsApp Admin |
| **Penghuni Aktif** | • Login & Personalisasi Profil (Ubah Email Pribadi, WhatsApp, & Kata Sandi)<br>• Melihat Informasi Kamar & Jadwal Sewa 3-Bulanan<br>• Melihat Tagihan & Melakukan Konfirmasi Pembayaran Bank BRI<br>• Mengajukan Perpanjangan Waktu Bayar (1–7 Hari + Alasan)<br>• Konfirmasi Kendala Langsung ke Ibu Kos via WhatsApp (jika lewat 7 hari)<br>• Mencetak / Melihat Kuitansi & Riwayat Pembayaran |
| **Pengelola Kos** | • Mengelola Katalog & Status Kamar (Tersedia, Dipesan, Terisi, Nonaktif)<br>• Memverifikasi Reservasi Masuk (Setujui / Tolak)<br>• Memvalidasi Pembayaran Reservasi Bank BRI<br>• Memproses Check-in (Mengubah Calon menjadi Penghuni Aktif)<br>• Mengedit Tanggal Masuk Kamar (Sinkron otomatis ke jadwal 3-bulanan Keuangan)<br>• Memproses Check-out (Mengosongkan Kamar kembali menjadi Tersedia)<br>• Melihat Daftar Penghuni Aktif & Akun Calon Terdaftar |
| **Staf Keuangan** | • Melihat Dashboard Ringkasan Pendapatan Sewa<br>• Mengelola Jadwal Tagihan Sewa 3-Bulanan Per Kamar<br>• Mengedit Tanggal Masuk Kamar<br>• Mengirim Pengingat Tagihan via WhatsApp Per Kamar & Peringatan Final (>7 Hari)<br>• Melihat Riwayat Pembayaran Sewa & Detail Transaksi<br>• Mencatat & Mengelola Iuran Sosial / Duka Cita Sukarela (Terpisah dari Sewa)<br>• Melihat & Mengekspor Laporan Keuangan |
| **Admin Sistem** | • Mengelola Seluruh Akun Pengguna 5 Role (Tambah, Ubah Role, Aktif/Nonaktif)<br>• Mereset Kata Sandi Pengguna (Bcrypt Hash)<br>• Memantau Log Aktivitas Sistem (Audit Trail)<br>• Memantau Log Notifikasi WhatsApp / Email<br>• Mengelola Pengaturan Sistem Kos Omi |

### Visualisasi Use Case (Mermaid Flowchart)

```mermaid
flowchart LR
    Calon([Calon Penghuni])
    Penghuni([Penghuni Aktif])
    Pengelola([Pengelola Kos])
    Keuangan([Staf Keuangan])
    Admin([Admin Sistem])

    subgraph Sistem Informasi Kos Omi
        UC1["Lihat Katalog Kamar"]
        UC2["Registrasi & Login"]
        UC3["Ajukan Reservasi Kamar"]
        UC4["Konfirmasi Transfer Bank BRI"]
        UC5["Verifikasi Reservasi & Validasi Bayar"]
        UC6["Proses Check-in & Check-out"]
        UC7["Kelola Kamar & Edit Tanggal Masuk"]
        UC8["Pantau Jadwal Sewa 3-Bulanan"]
        UC9["Ajukan Perpanjangan Waktu 1-7 Hari"]
        UC10["Konfirmasi Kendala ke Ibu Kos (>7 Hari)"]
        UC11["Kirim Pengingat WA & Peringatan Final"]
        UC12["Catat Iuran Duka Cita Sukarela"]
        UC13["Lihat & Ekspor Laporan Keuangan"]
        UC14["Kelola Pengguna & Reset Sandi"]
        UC15["Pantau Audit Log & Notifikasi"]
    end

    Calon --> UC1
    Calon --> UC2
    Calon --> UC3
    Calon --> UC4

    Penghuni --> UC2
    Penghuni --> UC4
    Penghuni --> UC8
    Penghuni --> UC9
    Penghuni --> UC10

    Pengelola --> UC5
    Pengelola --> UC6
    Pengelola --> UC7

    Keuangan --> UC7
    Keuangan --> UC8
    Keuangan --> UC11
    Keuangan --> UC12
    Keuangan --> UC13

    Admin --> UC14
    Admin --> UC15
```

---

## 2. Activity Diagram (5 Alur Proses Utama)

### Alur A: Reservasi Kamar, Pembayaran Bank BRI, hingga Check-in
**Swimlane:** `Calon Penghuni` | `Sistem` | `Pengelola Kos`

1. **Calon Penghuni** membuka katalog kamar, memilih kamar berstatus `TERSEDIA`, lalu mendaftar akun / login.
2. **Calon Penghuni** mengisi formulir reservasi (nama, tanggal rencana masuk, tipe hunian, kontak darurat) tanpa perlu mengunggah KTP/KTM/KRS, lalu mengirim pengajuan.
3. **Sistem** menyimpan reservasi dengan status `PENDING_REVIEW`, mengubah status kamar menjadi `DIPESAN`, dan mencatat log notifikasi untuk Pengelola.
4. **Pengelola Kos** membuka menu Reservasi Masuk dan memeriksa data calon penghuni serta ketersediaan kamar.
5. **Decision (Disetujui?):**
   - Jika **Ditolak**: **Sistem** mengubah status reservasi menjadi `REJECTED` dan mengembalikan status kamar menjadi `TERSEDIA`. *(Selesai)*
   - Jika **Disetujui**: **Sistem** mengubah status menjadi `APPROVED` dan menerbitkan **Invoice Pembayaran** (batas waktu 24 jam).
6. **Calon Penghuni** menyalin nomor rekening **Bank BRI `763701006296502` a.n. YULASTRI**, melakukan transfer, lalu klik **Konfirmasi Sudah Transfer Bank BRI**.
7. **Sistem** mengubah status pembayaran menjadi `PENDING` (Menunggu Validasi Pengelola).
8. **Pengelola Kos** mengecek mutasi rekening BRI dan klik **Validasi Pembayaran Lunas**.
9. **Sistem** mengubah status invoice menjadi `SETTLEMENT` dan reservasi menjadi `PAID`.
10. **Pengelola Kos** memproses **Check-in** saat penghuni tiba di kos.
11. **Sistem** membuat data kontrak aktif (`tenancies`), mengubah role akun menjadi `PENGHUNI`, dan mengubah status kamar menjadi `TERISI`.

```mermaid
flowchart TD
    Start([Mulai]) --> A1["Calon: Pilih Kamar TERSEDIA & Ajukan Reservasi"]
    A1 --> A2["Sistem: Simpan Reservasi PENDING_REVIEW & Kunci Kamar DIPESAN"]
    A2 --> A3["Pengelola: Verifikasi Data & Ketersediaan Kamar"]
    A3 --> D1{"Disetujui?"}
    D1 -- "Tidak" --> A4["Sistem: Status REJECTED & Kamar Kembali TERSEDIA"] --> End1([Selesai])
    D1 -- "Ya" --> A5["Sistem: Status APPROVED & Terbitkan Invoice 24 Jam"]
    A5 --> A6["Calon: Transfer Bank BRI 763701006296502 a.n. YULASTRI & Klik Konfirmasi"]
    A6 --> A7["Sistem: Status Pembayaran PENDING"]
    A7 --> A8["Pengelola: Cek Mutasi BRI & Validasi Lunas"]
    A8 --> A9["Sistem: Invoice SETTLEMENT & Reservasi PAID"]
    A9 --> A10["Pengelola: Proses Check-in"]
    A10 --> A11["Sistem: Buat Tenancy AKTIF, Role -> PENGHUNI, Kamar -> TERISI"]
    A11 --> End2([Selesai])
```

---

### Alur B: Siklus Tagihan 3-Bulanan, Pengajuan Tempo (1–7 Hari), & Konfirmasi Ibu Kos
**Swimlane:** `Pengelola / Keuangan` | `Sistem` | `Penghuni Aktif` | `Ibu Kos`

1. **Pengelola / Keuangan** mengatur atau mengedit **Tanggal Masuk** kamar (`checkInDate`).
2. **Sistem** otomatis menghitung **Jatuh Tempo Sewa 3-Bulanan** di tanggal yang sama setiap 3 bulan sekali dan menyinkronkannya ke halaman Keuangan dan Portal Penghuni.
3. Mendekati jatuh tempo (H-7 s/d hari H), **Staf Keuangan** mengirim **Pengingat WhatsApp** per kamar (tercatat di `notification_logs` & `audit_logs`).
4. **Decision (Penghuni sudah bisa bayar?):**
   - Jika **Ya**: **Penghuni** melakukan transfer Bank BRI dan konfirmasi bayar → tagihan selesai.
   - Jika **Belum**: **Penghuni** membuka `/penghuni/tagihan`, memilih **Ajukan Perpanjangan Waktu (1–7 Hari)**, mengisi alasan singkat, dan mengirim.
5. **Sistem** memperbarui batas akhir bayar sesuai hari yang dipilih dan menampilkan alasan di halaman Staf Keuangan.
6. **Decision (Sudah lunas dalam batas 7 hari?):**
   - Jika **Ya**: Status kembali aman setelah pelunasan.
   - Jika **Tidak (> 7 hari)**: **Sistem** otomatis mengubah status menjadi **`WAJIB_KONFIRMASI_IBU_KOS`**.
7. **Staf Keuangan** mengirim **Peringatan Final (>7 Hari)**, dan **Penghuni** melihat banner wajib menghubungi **Ibu Yulastri (`0822-8714-6763`)** secara langsung via WhatsApp untuk menjelaskan kendala.

```mermaid
flowchart TD
    S([Mulai]) --> B1["Pengelola/Keuangan: Atur atau Edit Tanggal Masuk Kamar"]
    B1 --> B2["Sistem: Hitung Otomatis Jatuh Tempo 3-Bulanan Per Kamar"]
    B2 --> B3["Keuangan: Kirim Pengingat WA Per Kamar"]
    B3 --> D2{"Penghuni Bisa Bayar Tepat Waktu?"}
    D2 -- "Ya" --> B4["Penghuni: Transfer Bank BRI & Konfirmasi Pembayaran"] --> E1([Selesai])
    D2 -- "Belum" --> B5["Penghuni: Ajukan Perpanjangan Waktu 1-7 Hari + Alasan"]
    B5 --> B6["Sistem: Catat Janji Bayar & Tampilkan di Keuangan"]
    B6 --> D3{"Lunas Dalam Batas 7 Hari?"}
    D3 -- "Ya" --> B4
    D3 -- "Lewat 7 Hari" --> B7["Sistem: Ubah Status -> WAJIB_KONFIRMASI_IBU_KOS"]
    B7 --> B8["Keuangan: Kirim Peringatan Final & Penghuni Wajib Konfirmasi Langsung ke Ibu Kos via WA"]
    B8 --> E2([Selesai])
```

---

### Alur C: Pencatatan Iuran Sosial / Duka Cita Sukarela
**Swimlane:** `Staf Keuangan` | `Sistem`

1. Saat ada musibah atau keluarga penghuni kos yang meninggal dunia, anak kos mengumpulkan sumbangan sukarela (seikhlasnya).
2. **Staf Keuangan** membuka menu **Riwayat Pembayaran** → tab **Iuran Duka Cita**.
3. **Staf Keuangan** klik **Catat Iuran Duka Cita** dan mengisi nama kegiatan duka cita, nama penyumbang, nomor kamar, nominal, metode penyerahan (Tunai / Transfer / DANA), dan tanggal.
4. **Sistem** menyimpan data secara persisten ke database (`settings` key `social_donations_json`), menambahkan ke total dana sosial terkumpul (terpisah 100% dari pendapatan sewa kamar), dan mencatat ke `audit_logs`.

---

### Alur D: Check-out Penghuni & Pemulihan Kata Sandi
- **Check-out:** Pengelola memilih penghuni aktif di `/pengelola/checkout` → Sistem mengubah status `tenancies` menjadi `SELESAI`, mengisi `checkOutDate`, dan jika kamar tidak memiliki penghuni aktif lain, mengubah status kamar kembali menjadi `TERSEDIA`.
- **Lupa Kata Sandi:** Pengguna membuka `/lupa-password` → memasukkan email terdaftar → Sistem mencatat permintaan reset ke log notifikasi & audit → Pengguna menghubungi Admin via WhatsApp → Admin mereset kata sandi di `/admin/pengguna` (tersimpan dalam hash Bcrypt) → Pengguna login kembali dan mengganti sandi pribadi di halaman Profil.

---

## 3. Entity Relationship Diagram (ERD) — 9 Tabel Neon PostgreSQL

Struktur di bawah ini **100% sesuai** dengan file skema database [schema.ts](file:///d:/kos_omi/src/db/schema.ts).

### Relasi Antar Entitas (Kardinalitas)
1. `users` **1 : N** `reservations` (`users.id` → `reservations.user_id` & `reservations.verified_by`)
2. `rooms` **1 : N** `reservations` (`rooms.id` → `reservations.room_id`)
3. `users` **1 : N** `tenancies` (`users.id` → `tenancies.user_id`)
4. `rooms` **1 : N** `tenancies` (`rooms.id` → `tenancies.room_id`) — *(mendukung 1 kamar dihuni 1–2 orang)*
5. `reservations` **1 : 0..1** `tenancies` (`reservations.id` → `tenancies.reservation_id`)
6. `users` **1 : N** `invoices` (`users.id` → `invoices.user_id`)
7. `reservations` **1 : N** `invoices` (`reservations.id` → `invoices.reservation_id`)
8. `tenancies` **1 : N** `invoices` (`tenancies.id` → `invoices.tenancy_id`)
9. `invoices` **1 : N** `payments` (`invoices.id` → `payments.invoice_id`)
10. `users` **1 : N** `notification_logs` (`users.id` → `notification_logs.user_id`)
11. `users` **1 : N** `audit_logs` (`users.id` → `audit_logs.actor_id`)
12. `settings` (tabel konfigurasi mandiri *key-value*, menyimpan konfigurasi sistem, data perpanjangan tempo kamar `room_rent_meta_json`, dan catatan iuran duka cita `social_donations_json`).

### Visualisasi ERD (Mermaid `erDiagram`)

```mermaid
erDiagram
    USERS ||--o{ RESERVATIONS : "mengajukan"
    ROOMS ||--o{ RESERVATIONS : "dipesan_dalam"
    USERS ||--o{ TENANCIES : "menghuni"
    ROOMS ||--o{ TENANCIES : "ditempati"
    RESERVATIONS ||--o| TENANCIES : "menghasilkan"
    USERS ||--o{ INVOICES : "ditagihkan"
    RESERVATIONS ||--o{ INVOICES : "memiliki"
    TENANCIES ||--o{ INVOICES : "memiliki"
    INVOICES ||--o{ PAYMENTS : "dibayar_melalui"
    USERS ||--o{ NOTIFICATION_LOGS : "menerima"
    USERS ||--o{ AUDIT_LOGS : "melakukan"

    USERS {
        varchar id PK
        varchar name
        varchar nim
        varchar email UK
        varchar password_hash
        varchar phone
        enum role "ADMIN|PENGELOLA|KEUANGAN|CALON_PENGHUNI|PENGHUNI"
        varchar room_code
        boolean is_active
        timestamp created_at
    }

    ROOMS {
        varchar id PK
        varchar code UK
        integer floor
        enum type "STANDAR_NON_AC|STANDAR_AC|DELUXE_AC"
        enum status "TERSEDIA|DIPESAN|TERISI|NONAKTIF"
        integer area_sqm
        integer monthly_price
        integer deposit_amount
        jsonb facilities
    }

    RESERVATIONS {
        varchar id PK
        varchar code UK
        varchar user_id FK
        varchar room_id FK
        varchar room_code
        varchar user_nik
        varchar start_date
        integer duration_months
        integer total_initial_payment
        varchar status "PENDING_REVIEW|APPROVED|PAID|REJECTED|CANCELLED"
        text id_card_url
        varchar verified_by FK
        timestamp payment_deadline
    }

    TENANCIES {
        varchar id PK
        varchar user_id FK
        varchar room_id FK
        varchar reservation_id FK
        varchar room_code
        varchar check_in_date
        varchar check_out_date
        varchar contract_end_date
        integer monthly_price
        enum status "AKTIF|SELESAI"
    }

    INVOICES {
        varchar id PK
        varchar invoice_number UK
        varchar user_id FK
        varchar reservation_id FK
        varchar tenancy_id FK
        varchar room_code
        enum type "BOOKING|DEPOSIT|SEWA_BULANAN"
        varchar period_month
        integer amount
        varchar due_date
        varchar status "UNPAID|PENDING|SETTLEMENT|EXPIRED"
        varchar payment_method
        timestamp paid_at
    }

    PAYMENTS {
        varchar id PK
        varchar invoice_id FK
        varchar midtrans_order_id
        varchar room_code
        varchar payment_type
        varchar bank
        integer gross_amount
        varchar transaction_status
        timestamp settlement_time
    }

    NOTIFICATION_LOGS {
        varchar id PK
        varchar user_id FK
        varchar recipient_name
        enum channel "WHATSAPP|EMAIL"
        varchar template
        varchar recipient
        enum status "PENDING|SENT|FAILED"
        timestamp sent_at
    }

    AUDIT_LOGS {
        varchar id PK
        varchar actor_id FK
        varchar actor_name
        varchar actor_role
        varchar action
        varchar entity
        varchar entity_id
        jsonb meta
        timestamp created_at
    }

    SETTINGS {
        varchar key PK
        text value
        timestamp updated_at
    }
```

---

## 4. Prompt Siap Pakai (Copy-Paste ke Tools Pembuat Diagram)

Jika kamu ingin membuat gambar diagram secara otomatis di **Draw.io (AI)**, **Eraser.io**, **Mermaid Live**, atau **PlantUML**, salin prompt berikut:

> **Prompt Use Case Diagram:**
> Buatkan Use Case Diagram untuk "Sistem Informasi Manajemen Kos Omi" dengan 5 aktor: Calon Penghuni, Penghuni Aktif, Pengelola Kos, Staf Keuangan, dan Admin Sistem.
> - Calon Penghuni: Lihat Katalog Kamar, Registrasi & Login, Ajukan Reservasi Kamar (Data Diri & Kontak Darurat), Konfirmasi Transfer Bank BRI.
> - Penghuni Aktif: Login & Edit Profil, Lihat Jadwal Sewa 3-Bulanan, Bayar Sewa via Transfer Bank BRI, Ajukan Perpanjangan Waktu (1-7 Hari), Konfirmasi Kendala Langsung ke Ibu Kos via WhatsApp (jika >7 hari), Cetak Kuitansi.
> - Pengelola Kos: Kelola Katalog & Status Kamar, Verifikasi Reservasi (Setujui/Tolak), Validasi Pembayaran BRI, Proses Check-in & Check-out, Edit Tanggal Masuk Kamar.
> - Staf Keuangan: Kelola Jadwal Tagihan 3-Bulanan Per Kamar, Edit Tanggal Masuk Kamar, Kirim Pengingat WA & Peringatan Final (>7 Hari), Lihat Riwayat Pembayaran Sewa, Catat Iuran Duka Cita Sukarela (Terpisah dari Sewa), Ekspor Laporan Keuangan.
> - Admin Sistem: Kelola Pengguna 5 Role, Reset Kata Sandi Pengguna, Pantau Audit Log & Log Notifikasi, Kelola Pengaturan Sistem.

> **Prompt Activity Diagram:**
> Buatkan 2 Activity Diagram dengan swimlane untuk Sistem Informasi Kos Omi:
> 1. Alur Reservasi hingga Check-in (Swimlane: Calon Penghuni, Sistem, Pengelola Kos): Pilih kamar tersedia -> Ajukan reservasi dengan data diri & kontak darurat -> Sistem ubah kamar jadi Dipesan -> Pengelola verifikasi data (jika ditolak kamar kembali Tersedia; jika disetujui terbit Invoice 24 jam) -> Calon transfer ke Bank BRI 763701006296502 a.n. YULASTRI dan klik konfirmasi -> Pengelola validasi mutasi BRI -> Status Lunas -> Pengelola proses Check-in -> Sistem buat kontrak aktif, ubah role menjadi Penghuni Aktif, dan ubah kamar menjadi Terisi.
> 2. Alur Tagihan Sewa 3-Bulanan & Pengajuan Tempo (Swimlane: Pengelola/Keuangan, Sistem, Penghuni Aktif, Ibu Kos): Atur/edit tanggal masuk kamar -> Sistem hitung otomatis jatuh tempo setiap 3 bulan -> Keuangan kirim pengingat WA per kamar -> Jika penghuni belum bisa bayar, penghuni ajukan perpanjangan waktu maksimal 1-7 hari beserta alasan -> Jika lewat 7 hari belum lunas, sistem otomatis mengubah status menjadi Wajib Konfirmasi Ibu Kos -> Keuangan kirim peringatan final dan penghuni wajib menghubungi Ibu Kos langsung via WhatsApp.

> **Prompt ERD:**
> Buatkan Entity Relationship Diagram (Crow's Foot Notation) untuk database PostgreSQL Sistem Informasi Kos Omi yang terdiri dari 9 tabel: `users`, `rooms`, `reservations`, `tenancies`, `invoices`, `payments`, `notification_logs`, `audit_logs`, dan `settings`. Relasi: `users` (1:N) `reservations`, `rooms` (1:N) `reservations`, `users` (1:N) `tenancies`, `rooms` (1:N) `tenancies`, `reservations` (1:0..1) `tenancies`, `users` (1:N) `invoices`, `reservations` (1:N) `invoices`, `tenancies` (1:N) `invoices`, `invoices` (1:N) `payments`, `users` (1:N) `notification_logs`, `users` (1:N) `audit_logs`, dan `settings` sebagai tabel key-value untuk konfigurasi sistem, data tempo kamar, serta catatan iuran duka cita sukarela.
