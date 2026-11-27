/**
 * Modul Sanitasi Input & Pencegahan XSS Kos Omi (PRD Bab 8 & Bab 11 Task 3.4)
 *
 * Mengimplementasikan:
 * 1. Penghapusan tag HTML berbahaya (<script>, <iframe>, <object>, <embed>, <style>, dsb.)
 * 2. Penghapusan URI javascript:, data:text/html, vbscript:
 * 3. Penghapusan event handler inline (onload=, onclick=, onerror=, dsb.)
 * 4. Escaping karakter khusus HTML (&, <, >, ", ')
 * 5. Deep sanitization untuk objek dan array payload
 */

/**
 * Escape karakter HTML dasar menjadi entitas aman
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitasi string teks dari script injection dan tag HTML berbahaya
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input;

  // 1. Hapus tag script berbahaya beserta isinya
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // 2. Hapus seluruh tag HTML lainnya jika input adalah teks biasa
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');

  // 3. Hapus skema URI berbahaya
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  sanitized = sanitized.replace(/vbscript\s*:/gi, '');
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, '');

  // 4. Hapus event handlers (onload, onerror, onmouseover, onclick, dst.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^>\s]+/gi, '');

  return sanitized.trim();
}

/**
 * Sanitasi mendalam (rekursif) untuk seluruh properti objek atau array
 */
export function sanitizeInput<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeString(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      // Jangan sanitasi field password hash atau binary buffer
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('hash')) {
        cleaned[key] = value;
      } else {
        cleaned[key] = sanitizeInput(value);
      }
    }
    return cleaned as T;
  }

  return data;
}
