'use client';

import React from 'react';
import NextLink from 'next/link';
import { TenancyRecord } from '@/types/tenancy';
import { formatRupiah } from '@/data/rooms';
import {
ArrowLeft,
Phone,AlertTriangle,Receipt,LogOut
} from 'lucide-react';

interface PenghuniDetailClientProps {
  tenant: TenancyRecord;
}

export const PenghuniDetailClient: React.FC<PenghuniDetailClientProps> = ({
  tenant,
}) => {
  const hasUnpaid = tenant.unpaidBillsCount > 0;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <NextLink
          href="/pengelola/penghuni"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Penghuni</span>
        </NextLink>

        <div className="flex items-center gap-2.5">
          <a
            href={`https://wa.me/62${tenant.userPhone.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(
              tenant.userName
            )},%20ini%20Pengelola%20Kos%20Omi%20Sungai%20Bangek%20Padang.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Chat WhatsApp</span>
          </a>

          {tenant.status === 'AKTIF' && (
            <NextLink
              href="/pengelola/checkout"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Proses Check-out</span>
            </NextLink>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[hsl(186,72%,24%)] font-heading font-extrabold text-2xl flex items-center justify-center border border-blue-100 shrink-0">
            {tenant.roomCode}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-heading font-extrabold text-zinc-900">
                {tenant.userName}
              </h1>
              <span
                className={`text-xs font-bold px-3 py-0.5 rounded ${
                  tenant.status === 'AKTIF'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                }`}
              >
                {tenant.status === 'AKTIF' ? '✓ Penghuni Aktif' : 'Selesai Sewa'}
              </span>

              {hasUnpaid && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ada Tagihan Belum Lunas</span>
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-600">
              Kamar <strong>{tenant.roomCode}</strong> (Lantai {tenant.roomFloor}) · Check-in sejak {tenant.checkInDate}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 pt-1">
              <span>NIK: <strong className="tabular-nums text-zinc-800">{tenant.userNik}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-zinc-800">{tenant.userEmail}</strong></span>
              <span>•</span>
              <span>WhatsApp: <strong className="text-zinc-800">{tenant.userPhone}</strong></span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-left md:text-right shrink-0">
          <span className="text-[11px] text-zinc-500 font-medium block">Tarif Sewa Kamar</span>
          <span className="text-2xl font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
            {formatRupiah(tenant.monthlyPrice)}
          </span>
          <span className="text-[10px] text-zinc-400 block">Sewa Semesteran (6 Bulan)</span>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Billing & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unpaid Warning Box if any */}
          {hasUnpaid && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Kewajiban Tagihan Bulan Berjalan Belum Lunas</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Penghuni memiliki 1 invoice sewa yang belum dilunasi. Pengelola dapat mengirimkan pengingat ramah via pesan WhatsApp.
              </p>
              <div className="space-y-2 pt-1">
                {tenant.unpaidInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-white border border-amber-300 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="tabular-nums font-bold text-zinc-900 block">{inv.invoiceNumber}</span>
                      <span className="text-zinc-500 text-[11px]">{inv.description} · Jatuh Tempo {inv.dueDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-heading font-extrabold text-amber-700 text-sm tabular-nums">
                        {formatRupiah(inv.amount)}
                      </span>
                      <span className="text-[10px] text-rose-600 font-bold block">Belum Bayar</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-1">
                <a
                  href={`https://wa.me/62${tenant.userPhone.replace(
                    /^0/,
                    ''
                  )}?text=Halo%20${encodeURIComponent(
                    tenant.userName
                  )},%20mengingatkan%20tagihan%20sewa%20kamar%20${
                    tenant.roomCode
                  }%20sebesar%20${formatRupiah(
                    tenant.totalUnpaidAmount
                  )}%20telah%20jatuh%20tempo.%20Pembayaran%20dapat%20dilakukan%20melalui%20portal%20penghuni.%20Terima%20kasih.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Kirim Pengingat Tagihan via WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* Past Invoices Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>Riwayat Tagihan & Pembayaran Sewa</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Arsip invoice resmi pembayaran kamar yang tercatat di Kos Omi
                </p>
              </div>
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden w-full overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
                  <tr>
                    <th className="p-3.5">No. Invoice</th>
                    <th className="p-3.5">Periode Sewa</th>
                    <th className="p-3.5">Metode Bayar</th>
                    <th className="p-3.5 text-right">Nominal</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {tenant.pastInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50/60">
                      <td className="p-3.5 tabular-nums font-bold text-zinc-900">{inv.invoiceNumber}</td>
                      <td className="p-3.5 font-medium">{inv.periodMonth}</td>
                      <td className="p-3.5 text-zinc-600">{inv.paymentMethod}</td>
                      <td className="p-3.5 text-right font-bold tabular-nums text-zinc-900">
                        {formatRupiah(inv.amount)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Lunas
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Tenancy Contract & Emergency Contact & KTP */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contract Details */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4 text-xs">
            <h3 className="font-bold text-zinc-700 border-b border-zinc-100 pb-2.5">
              Rincian Kontrak Sewa
            </h3>

            <div className="space-y-2 text-zinc-600">
              <div className="flex justify-between">
                <span className="text-zinc-500">Tanggal Check-in:</span>
                <span className="font-bold text-zinc-900">{tenant.checkInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Batas Kontrak:</span>
                <span className="font-bold text-zinc-900">{tenant.contractEndDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tipe Kamar:</span>
                <span className="font-bold text-zinc-900">Kamar Standar Kos Omi (Maks. 2 Orang)</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3 text-xs">
            <h3 className="font-bold text-zinc-700 border-b border-zinc-100 pb-2">
              Kontak Darurat Penghuni
            </h3>

            <div className="space-y-1.5 text-zinc-700">
              <p className="font-bold text-zinc-900">{tenant.emergencyContact.name}</p>
              <p className="text-zinc-500">Hubungan: {tenant.emergencyContact.relation}</p>
              <div className="pt-1">
                <a
                  href={`tel:${tenant.emergencyContact.phone}`}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{tenant.emergencyContact.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
