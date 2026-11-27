'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Task 3.6: Core Web Vitals Monitor & Verifier
 * Memantau dan memverifikasi metrik performa pengguna secara real-time:
 * - LCP (Largest Contentful Paint): Target < 2.5s
 * - CLS (Cumulative Layout Shift): Target < 0.1
 * - INP (Interaction to Next Paint): Target < 200ms
 * - FCP (First Contentful Paint): Target < 1.8s
 * - TTFB (Time to First Byte): Target < 800ms
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    const { name, value, rating } = metric;

    // Thresholds verifikasi Core Web Vitals (PRD Bab 8 & Task 3.6)
    const targets: Record<string, { good: number; unit: string }> = {
      LCP: { good: 2500, unit: 'ms' },
      CLS: { good: 0.1, unit: '' },
      INP: { good: 200, unit: 'ms' },
      FCP: { good: 1800, unit: 'ms' },
      TTFB: { good: 800, unit: 'ms' },
    };

    const target = targets[name];
    const isPassing = target ? (name === 'CLS' ? value <= target.good : value <= target.good) : rating === 'good';

    if (process.env.NODE_ENV === 'development') {
      const statusIcon = isPassing ? '✅' : '⚠️';
      const formattedValue = name === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`;
      console.log(
        `%c[Web Vitals] ${statusIcon} ${name}: ${formattedValue} (Rating: ${rating})`,
        isPassing ? 'color: #10b981; font-weight: bold;' : 'color: #f59e0b; font-weight: bold;'
      );
    }
  });

  return null;
}
