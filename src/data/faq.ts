export interface FAQItem {
  id: string;
  category: 'reservasi' | 'pembayaran' | 'deposit' | 'aturan';
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'reservasi',
    question: 'Berapa harga sewa kamar dan kapasitas per kamar di Kos Omi?',
    answer: 'Harga sewa kamar di Kos Omi adalah Rp 5.000.000 per semester per kamar untuk Lantai 1 dan Lantai 2. Setiap 1 kamar memiliki kapasitas untuk 2 orang penghuni dan sudah dilengkapi Kasur, Lemari, serta Kamar Mandi Dalam.',
  },
  {
    id: 'faq-2',
    category: 'reservasi',
    question: 'Apa saja fasilitas yang tersedia di Kos Omi?',
    answer: 'Fasilitas lengkap Kos Omi meliputi: (1) Kasur & Lemari, (2) Kamar Mandi Dalam di setiap kamar, (3) Ruang Belajar Umum, (4) Dapur dan Area Cuci Umum, (5) Dilengkapi CCTV, (6) Wi-Fi, TV, & Kulkas, (7) Alat Olahraga, (8) Parkir Motor Dalam, serta (9) Keamanan 24 Jam.',
  },
  {
    id: 'faq-3',
    category: 'pembayaran',
    question: 'Metode pembayaran apa saja yang diterima di Kos Omi?',
    answer: 'Kos Omi melayani pembayaran melalui QRIS, Transfer Bank (BRI, BCA, BSI, Bank Nagari, dan SeaBank), serta E-Wallet (DANA dan ShopeePay ke nomor +62 813-7432-9562). Penghuni juga dapat mengunggah bukti pembayaran langsung di halaman pembayaran untuk diverifikasi.',
  },
  {
    id: 'faq-4',
    category: 'pembayaran',
    question: 'Bagaimana cara menghubungi Ibu Kos Omi jika ada pertanyaan?',
    answer: 'Anda dapat menghubungi Ibu Kos Omi secara langsung melalui WhatsApp atau telepon di nomor +62 813-7432-9562, atau datang langsung ke lokasi Kos Omi di Sungai Bangek, Padang (dekat Kampus III UIN Imam Bonjol Padang).',
  },
  {
    id: 'faq-5',
    category: 'deposit',
    question: 'Bagaimana prosedur jika penghuni sudah selesai masa sewa atau keluar dari kos?',
    answer: 'Penghuni yang sudah selesai masa sewanya dapat mengajukan check-out melalui sistem. Setelah tidak lagi menghuni kos (keluar dari kos), Admin dapat menonaktifkan atau menghapus akun/data pengguna tersebut agar data penghuni aktif tetap rapi dan akurat.',
  },
  {
    id: 'faq-6',
    category: 'aturan',
    question: 'Apakah tersedia area parkir dan keamanan 24 jam?',
    answer: 'Ya, Kos Omi dilengkapi area Parkir Motor Dalam yang aman, sistem pengawasan kamera CCTV di area strategis, serta Keamanan 24 Jam untuk menjamin kenyamanan seluruh penghuni.',
  },
];
