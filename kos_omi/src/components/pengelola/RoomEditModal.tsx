'use client';

import React, { useState, useEffect } from 'react';
import { Room, RoomType, ROOM_TYPE_LABELS } from '@/types/room';
import { updateRoomDetailAction } from '@/actions/rooms';
import { X, Check, AlertCircle, Save, Layers, DollarSign, Maximize2, Tag } from 'lucide-react';

interface RoomEditModalProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
  onSuccess: (updatedRoom: Room) => void;
}

const AVAILABLE_FACILITIES = [
  'Kasur Springbed Berkualitas',
  'Lemari Pakaian 2 Pintu',
  'Meja Kerja & Belajar',
  'Kursi Ergonomis',
  'Wi-Fi Kecepatan Tinggi 100 Mbps',
  'Sirkulasi Udara & Jendela Luar',
  'Token Listrik Mandiri Tiap Kamar',
  'AC Daikin 1/2 PK Hemat Energi',
  'Kamar Mandi Dalam dengan Shower',
  'Water Heater Otomatis',
  'Kloset Duduk Toto & Bidet',
  'Cermin Rias & Rak Dinding',
  'Kipas Angin Dinding Cosmos',
  'Exhaust Fan Sirkulasi Sejuk',
  'Kamar Mandi Luar Bersih (Rasio 1:2)',
];

export const RoomEditModal: React.FC<RoomEditModalProps> = ({
  isOpen,
  room,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<RoomType>('STANDAR_NON_AC');
  const [monthlyPrice, setMonthlyPrice] = useState<number>(750000);
  const [depositAmount, setDepositAmount] = useState<number>(750000);
  const [areaSqm, setAreaSqm] = useState<number>(12);
  const [description, setDescription] = useState<string>('');
  const [facilities, setFacilities] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (room) {
      setType(room.type);
      setMonthlyPrice(room.monthlyPrice);
      setDepositAmount(room.depositAmount);
      setAreaSqm(room.areaSqm);
      setDescription(room.description);
      setFacilities(room.facilities || []);
      setErrorMessage(null);
    }
  }, [room]);

  if (!isOpen || !room) return null;

  const toggleFacility = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (monthlyPrice < 100000) {
      setErrorMessage('Harga sewa bulanan minimal Rp 100.000');
      return;
    }
    if (depositAmount < 0) {
      setErrorMessage('Deposit sewa tidak boleh bernilai negatif');
      return;
    }
    if (areaSqm <= 0) {
      setErrorMessage('Luas kamar harus lebih dari 0 m²');
      return;
    }
    if (facilities.length === 0) {
      setErrorMessage('Pilih minimal 1 fasilitas kamar');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await updateRoomDetailAction(room.code, {
      code: room.code,
      type,
      monthlyPrice: Number(monthlyPrice),
      depositAmount: Number(depositAmount),
      areaSqm: Number(areaSqm),
      facilities,
      description: description.trim(),
    });

    if (res.success && res.data) {
      onSuccess(res.data);
      onClose();
    } else {
      setErrorMessage(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-5 my-8 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Data Kamar {room.code}</h2>
            <p className="text-xs text-slate-500">Perbarui spesifikasi, tarif sewa, dan fasilitas inventaris</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grid Kode, Lantai, Tipe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Kamar</label>
              <input
                type="text"
                value={room.code}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Posisi Lantai</label>
              <input
                type="text"
                value={`Lantai ${room.floor}`}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="roomType" className="block text-xs font-bold text-slate-700 mb-1">
                Tipe Kamar <span className="text-rose-500">*</span>
              </label>
              <select
                id="roomType"
                value={type}
                onChange={(e) => setType(e.target.value as RoomType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              >
                <option value="STANDAR_NON_AC">Standar Non-AC</option>
                <option value="STANDAR_AC">Standar AC</option>
                <option value="DELUXE_AC">Deluxe AC</option>
              </select>
            </div>
          </div>

          {/* Grid Harga Sewa, Deposit, Luas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label htmlFor="price" className="block text-xs font-bold text-slate-700 mb-1">
                Harga Sewa / Bulan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                step="50000"
                min="100000"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 tabular-nums focus:outline-none focus:border-[hsl(217,91%,45%)]"
                required
              />
            </div>

            <div>
              <label htmlFor="deposit" className="block text-xs font-bold text-slate-700 mb-1">
                Deposit Jaminan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                id="deposit"
                type="number"
                step="50000"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 tabular-nums focus:outline-none focus:border-[hsl(217,91%,45%)]"
                required
              />
            </div>

            <div>
              <label htmlFor="area" className="block text-xs font-bold text-slate-700 mb-1">
                Luas Kamar (m²) <span className="text-rose-500">*</span>
              </label>
              <input
                id="area"
                type="number"
                step="0.5"
                min="5"
                value={areaSqm}
                onChange={(e) => setAreaSqm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 tabular-nums focus:outline-none focus:border-[hsl(217,91%,45%)]"
                required
              />
            </div>
          </div>

          {/* Facilities Checklist */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Fasilitas Kamar ({facilities.length} Dipilih) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">Klik untuk menambah/menghapus</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50">
              {AVAILABLE_FACILITIES.map((fac) => {
                const checked = facilities.includes(fac);
                return (
                  <label
                    key={fac}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                      checked
                        ? 'bg-blue-50/70 border border-blue-200 text-blue-900 font-semibold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacility(fac)}
                      className="w-3.5 h-3.5 text-[hsl(217,91%,45%)] border-slate-300 rounded focus:ring-[hsl(217,91%,45%)]"
                    />
                    <span className="truncate">{fac}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-xs font-bold text-slate-700">
              Deskripsi & Catatan Kamar:
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat mengenai kondisi, sirkulasi udara, atau orientasi jendela kamar..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[hsl(217,91%,45%)]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
