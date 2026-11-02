'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface RoomPhotoGalleryProps {
  photos: string[];
  roomCode: string;
}

export const RoomPhotoGallery: React.FC<RoomPhotoGalleryProps> = ({ photos, roomCode }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  const displayPhotos = photos && photos.length > 0 ? photos : [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="space-y-3">
      {/* Foto Utama Besar */}
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
        <Image
          src={displayPhotos[activePhotoIndex]}
          alt={`Foto Kamar ${roomCode} - ${activePhotoIndex + 1}`}
          fill
          priority
          quality={85}
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover transition-all duration-300"
        />
        <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded">
          Foto {activePhotoIndex + 1} dari {displayPhotos.length}
        </div>
      </div>

      {/* Baris Thumbnail */}
      {displayPhotos.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {displayPhotos.map((photo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePhotoIndex(idx)}
              className={`relative aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all ${
                activePhotoIndex === idx
                  ? 'border-[hsl(217,91%,45%)] ring-2 ring-blue-100'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={photo}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 25vw, 150px"
                loading="lazy"
                quality={70}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
