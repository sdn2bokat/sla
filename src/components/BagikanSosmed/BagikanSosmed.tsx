"use client";

import { Icon } from "@iconify/react";

export default function BagikanSosmed() {
  const text = encodeURIComponent(
    "Terima kasih SD Negeri 2 Bokat yang sudah memberikan layanan online Administrasi Sekolah lewat https://sdn2bokat.sch.id"
  );
  const url = encodeURIComponent("https://sdn2bokat.sch.id");

  const baseStyle =
    "flex items-center gap-2 p-1 md:px-4 md:py-2 rounded-full shadow transition sm:w-auto justify-center";

  return (
    <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-3 sm:gap-4">

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseStyle} bg-blue-600 text-white hover:bg-blue-700`}
      >
        <Icon icon="mdi:facebook" className="w-6 h-6" />
        <span className="hidden md:inline">Facebook</span>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseStyle} bg-green-500 text-white hover:bg-green-600`}
      >
        <Icon icon="mdi:whatsapp" className="w-6 h-6" />
        <span className="hidden md:inline">WhatsApp</span>
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseStyle} bg-black text-white hover:bg-gray-900`}
      >
        <Icon icon="mdi:twitter" className="w-6 h-6" />
        <span className="hidden md:inline">Twitter</span>
      </a>

      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${url}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseStyle} bg-sky-500 text-white hover:bg-sky-600`}
      >
        <Icon icon="mdi:telegram" className="w-6 h-6" />
        <span className="hidden md:inline">Telegram</span>
      </a>

    </div>
  );
}
