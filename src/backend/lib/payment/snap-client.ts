/**
 * Midtrans Snap Dynamic Client Loader (Task 3.6 Performa & Optimasi)
 * Mengunduh dan menginisialisasi skrip Midtrans Snap secara asynchronous hanya saat dibutuhkan (on-demand),
 * sehingga tidak membebani ukuran bundle JavaScript dan waktu muat halaman awal.
 */

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
      embed: (
        token: string,
        options: {
          embedId: string;
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

let snapScriptPromise: Promise<void> | null = null;

export function loadSnapScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  // Jika window.snap sudah terpasang, langsung selesaikan
  if (window.snap) {
    return Promise.resolve();
  }

  // Jika sedang proses pengunduhan, gunakan promise yang sama
  if (snapScriptPromise) {
    return snapScriptPromise;
  }

  snapScriptPromise = new Promise((resolve, reject) => {
    // Cek apakah elemen script snap sudah ada di DOM
    const existingScript = document.getElementById('midtrans-snap-script');
    if (existingScript) {
      resolve();
      return;
    }

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-sample-key';
    const snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const script = document.createElement('script');
    script.id = 'midtrans-snap-script';
    script.src = snapUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      snapScriptPromise = null;
      console.warn('Gagal mengunduh skrip resmi Midtrans Snap. Menggunakan fallback modal terpadu.');
      // Tetap selesaikan agar UX pembayaran internal fallback tetap berjalan
      resolve();
    };

    document.head.appendChild(script);
  });

  return snapScriptPromise;
}

export interface SnapCallbacks {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

/**
 * Membuka UI popup Midtrans Snap secara aman
 */
export async function triggerSnapPayment(
  snapToken: string,
  callbacks?: SnapCallbacks
): Promise<boolean> {
  await loadSnapScript();

  if (typeof window !== 'undefined' && window.snap && typeof window.snap.pay === 'function') {
    window.snap.pay(snapToken, callbacks);
    return true;
  }

  return false;
}
