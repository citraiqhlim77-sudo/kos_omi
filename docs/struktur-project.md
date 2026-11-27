# Struktur Folder Project Kos Omi (Pemisahan Frontend & Backend)

Dokumen ini menjelaskan letak seluruh folder **Frontend**, **Backend**, **Routing Next.js**, **Database**, dan **Dokumentasi Laporan** di dalam proyek `D:\kos_omi`.

---

## Ringkasan Pohon Folder (`D:\kos_omi\`)

```text
D:\kos_omi\
├── docs\                          ← DOKUMENTASI & LAPORAN
│   ├── alur_sistem_dan_diagram_kos_omi.md   (Use Case, Activity, ERD, Prompt)
│   ├── laporan_blackbox_testing_kos_omi.md  (Tabel Hasil Black-Box Testing)
│   └── struktur-project.md                  (Peta struktur folder ini)
│
├── public\                        ← ASET STATIS (Logo & Foto Kamar)
│   ├── logo-kos-omi.png
│   └── rooms\
│
├── src\
│   ├── frontend\                  ← SEMUA KODE FRONTEND (TAMPILAN UI)
│   │   ├── components\            (Komponen React per Role: admin, calon, keuangan, pengelola, penghuni, payment, layout, ui)
│   │   └── data\                  (Data tampilan katalog kamar, FAQ, tarif)
│   │
│   ├── backend\                   ← SEMUA KODE BACKEND (SERVER & DATABASE)
│   │   ├── actions\               (Next.js Server Actions: auth, billing, finance, payments, rent-schedule, reservations, rooms, tenancy, admin)
│   │   ├── db\                    (Koneksi Neon PostgreSQL & Skema 9 Tabel Drizzle ORM: index.ts, schema.ts)
│   │   ├── server\                (Layanan persistensi & sinkronisasi database PostgreSQL)
│   │   └── lib\                   (Autentikasi server, validasi input, keamanan, audit log, notifikasi WA/Email)
│   │
│   ├── app\                       ← ROUTING HALAMAN & API ENDPOINTS (Wajib Next.js App Router)
│   │   ├── api\                   (REST API Endpoints: auth, webhooks, cron, export laporan)
│   │   ├── admin\                 (Halaman Role Admin Sistem)
│   │   ├── pengelola\             (Halaman Role Pengelola Kos)
│   │   ├── keuangan\              (Halaman Role Staf Keuangan)
│   │   ├── penghuni\              (Halaman Role Penghuni Aktif)
│   │   └── calon\                 (Halaman Role Calon Penghuni)
│   │
│   ├── types\                     ← TIPE DATA BERSAMA (TypeScript Interfaces Frontend & Backend)
│   ├── auth.ts                    ← Konfigurasi NextAuth v5 (Bcrypt)
│   ├── auth.config.ts
│   └── middleware.ts              ← Proteksi akses 5 Role (RBAC)
│
├── tests\
│   └── unit\                      ← PENGUJIAN OTOMATIS (Black-Box Testing & Unit Tests)
│       ├── blackbox-system.test.ts
│       ├── five-roles-sync.test.ts
│       ├── billing-calculation.test.ts
│       ├── room-status-transition.test.ts
│       └── midtrans-signature.test.ts
│
├── drizzle.config.ts              ← Konfigurasi Drizzle ORM (mengarah ke src/backend/db/schema.ts)
├── tailwind.config.ts             ← Konfigurasi Styling Frontend Tailwind CSS
├── tsconfig.json                  ← Path Alias TypeScript (@/components -> src/frontend/components, dst.)
├── vitest.config.ts               ← Konfigurasi Test Runner Vitest
└── netlify.toml                   ← Konfigurasi Hosting Netlify
```

---

## Ringkasan Cepat untuk Presentasi / Laporan

- **Mau lihat Tampilan (Frontend)?** Buka `src/frontend/components/` (dikelompokkan rapi per role: `admin`, `pengelola`, `keuangan`, `penghuni`, `calon`, `payment`).
- **Mau lihat Logika Server & Database (Backend)?** Buka `src/backend/actions/` (proses bisnis) dan `src/backend/db/schema.ts` (9 tabel Neon PostgreSQL).
- **Mau lihat Routing & API?** Buka `src/app/` dan `src/app/api/`.
- **Mau lihat Hasil Pengujian?** Buka `tests/unit/blackbox-system.test.ts` dan `docs/laporan_blackbox_testing_kos_omi.md`.
