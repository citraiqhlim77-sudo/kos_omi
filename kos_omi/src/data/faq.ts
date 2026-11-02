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
    question: 'Bagaimana alur dan cara mengajukan reservasi kamar di Kos Omi?',
    answer: 'Pilih kamar dengan status "Tersedia" di halaman Katalog Kamar, lalu klik "Reservasi Kamar Ini". Buat akun atau masuk, isi tanggal rencana masuk (minimal H+3 dari hari ini), durasi sewa yang diinginkan (1, 3, 6, atau 12 bulan), dan unggah foto KTP asli Anda. Tim pengelola Kos Omi akan memverifikasi data Anda dalam waktu maksimal 2x24 jam.',
  },
  {
    id: 'faq-2',
    category: 'reservasi',
    question: 'Berapa lama batas waktu pembayaran setelah reservasi saya disetujui?',
    answer: 'Setelah pengelola menyetujui reservasi Anda, status kamar akan dikunci menjadi "Sedang Dipesan" dan sistem menerbitkan invoice booking. Anda memiliki waktu 24 jam untuk menyelesaikan pembayaran via Midtrans Snap. Jika melebihi batas waktu tersebut, reservasi otomatis kedaluwarsa dan kamar kembali berstatus "Tersedia" untuk calon penghuni lain.',
  },
  {
    id: 'faq-3',
    category: 'pembayaran',
    question: 'Metode pembayaran apa saja yang diterima di Kos Omi?',
    answer: 'Semua transaksi diproses secara resmi dan aman melalui Midtrans Payment Gateway. Metode yang tersedia meliputi QRIS (semua aplikasi perbankan & dompet digital), Virtual Account otomatis (BCA, BNI, BRI, Mandiri, dan Bank Permata), serta E-Wallet (GoPay dan ShopeePay). Notifikasi dan konfirmasi pembayaran tercatat otomatis secara real-time tanpa perlu kirim struk mutasi manual.',
  },
  {
    id: 'faq-4',
    category: 'pembayaran',
    question: 'Kapan tanggal jatuh tempo tagihan sewa bulanan kos?',
    answer: 'Tanggal jatuh tempo tagihan sewa bulanan adalah tanggal 5 setiap bulannya. Sistem Kos Omi akan menerbitkan invoice otomatis pada H-7 (akhir bulan sebelumnya) dan mengirimkan notifikasi pengingat via WhatsApp dan Email pada H-3 dan tepat di hari H jatuh tempo.',
  },
  {
    id: 'faq-5',
    category: 'deposit',
    question: 'Apa fungsi deposit dan bagaimana kebijakan pengembaliannya (refund)?',
    answer: 'Deposit sebesar 1 bulan biaya sewa dibayarkan bersamaan dengan pembayaran booking pertama. Deposit berfungsi sebagai jaminan pemeliharaan fasilitas kamar dan inventaris. Saat Anda check-out secara resmi dan kamar diperiksa dalam kondisi baik serta tidak memiliki tunggakan, dana deposit akan dikembalikan 100% oleh bagian Keuangan Kos Omi.',
  },
  {
    id: 'faq-6',
    category: 'aturan',
    question: 'Apakah ada batasan jam malam untuk penghuni dan tamu?',
    answer: 'Penghuni Kos Omi memiliki akses 24 jam menggunakan kartu akses digital dan gerbang otomatis. Untuk kenyamanan bersama, jam berkunjung tamu di area komunal (lobby dan ruang tamu lantai 1) dibatasi hingga pukul 22.00 WIB. Tamu dilarang masuk ke koridor kamar lawan jenis.',
  },
  {
    id: 'faq-7',
    category: 'aturan',
    question: 'Apakah biaya sewa kamar sudah termasuk listrik dan Wi-Fi?',
    answer: 'Biaya sewa sudah termasuk fasilitas air bersih, kebersihan area publik harian, pembuangan sampah, dan akses Wi-Fi berkecepatan 100 Mbps tanpa kuota. Untuk listrik kamar menggunakan meteran token prabayar mandiri di setiap kamar, sehingga Anda dapat mengontrol pemakaian listrik sesuai kebutuhan pribadi.',
  },
  {
    id: 'faq-8',
    category: 'aturan',
    question: 'Apakah tersedia area parkir untuk kendaraan penghuni?',
    answer: 'Ya, Kos Omi menyediakan area parkir motor tertutup di dalam gerbang yang diawasi kamera CCTV 24 jam dan petugas keamanan. Setiap penghuni berhak atas 1 slot parkir sepeda motor tanpa biaya tambahan.',
  },
];
