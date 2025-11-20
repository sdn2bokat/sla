"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export default function SyaratKetentuanModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  // Mencegah scroll di belakang modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setShowContent(true), 50); // sedikit delay animasi masuk
    } else {
      document.body.style.overflow = "auto";
      setShowContent(false);
    }
  }, [isOpen]);

  return (
    <>
      {/* 🔗 Teks pemicu modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:underline font-medium"
      >
        Syarat dan Ketentuan
      </button>

      {/* 🪟 Overlay modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 transition-opacity duration-300">
          {/* Kontainer modal dengan animasi */}
          <div
            className={`bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ${
              showContent
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            {/* 🔹 Header */}
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Syarat dan Ketentuan
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon icon="mdi:close" width="22" />
              </button>
            </div>

            {/* 🔹 Konten scrollable */}
            <div className="p-4 overflow-y-auto text-sm text-justify space-y-3">
              <h3 className="font-semibold mt-2">
                Syarat dan Ketentuan Layanan Permohonan Surat Rekomendasi PIP
              </h3>

              <p>
                Selamat datang di layanan permohonan penerbitan Surat Rekomendasi Permohonan Pencairan Dana Bantuan Sosial Program Indonesia Pintar (PIP) SD Negeri 2 Bokat/ SD Pembina Kab. Buol.
                 Dengan menggunakan layanan ini, Anda (siswa/orang tua) dianggap telah membaca, memahami, dan menyetujui seluruh 
                 syarat dan ketentuan berikut:
              </p>

              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  <strong>Jenis Layanan</strong>
                  <p>
                    Layanan online ini adalah layanan administrasi sekolah tentang permohonan Surat Rekomendasi PIP yang diajukan oleh 
                    siswa/orang tua untuk keperluan pencairan dana Bansos PIP.
                  </p>
                </li>

                <li>
                  <strong>Hak dan Kewajiban Pengguna</strong>
                  <ul className="list-disc ml-5">
                    <li>
                      <strong>Hak:</strong> Mendapatkan pelayanan penerbitan surat rekomendasi permohonan pencairan dana Bansos PIP yang cepat dan 
                      mudah diakses kapan saja dan di mana saja tanpa harus datang ke sekolah jika memilih metode pencetakan cetak sendiri.
                    </li>
                    <li>
                      <strong>Kewajiban:</strong> Menggunakan surat rekomendasi sesuai dengan peruntukannya, serta memberi tahu pihak sekolah setelah pencairan dana dilakukan.
                    </li>
                  </ul>
                </li>

                <li>
                  <strong>Kebijakan Privasi</strong>
                  <p>
                    Data pribadi yang Anda berikan hanya digunakan untuk keperluan penerbitan surat dan pelaporan program PIP, tanpa keterlibatan pihak ketiga.
                  </p>
                </li>

                <li>
                  <strong>Biaya Layanan</strong>
                  <p>Layanan ini 100% gratis dan tidak dipungut biaya apapun.</p>
                </li>

                <li>
                  <strong>Prosedur Pengaduan</strong>
                  <p>
                    Gunakan fitur "Kotak Saran dan Pengaduan" di beranda website sekolah, atau hubungi kontak berikut:
                  </p>
                  <div className="flex flex-col mt-1">
                    <span className="flex items-center gap-2">
                      <Icon icon="mdi:email-outline" width="18" /> admin@sdn2bokat.sch.id
                    </span>
                    <span className="flex items-center gap-2">
                      <Icon icon="mdi:whatsapp" width="18" /> +62 813-8818-1249
                    </span>
                  </div>
                </li>

                <li>
                  <strong>Perubahan Syarat dan Ketentuan</strong>
                  <p>
                    SD Negeri 2 Bokat/ SD Pembina Kab. Buol berhak mengubah syarat dan ketentuan tanpa pemberitahuan sebelumnya.
                  </p>
                </li>

                <li>
                  <strong>Dasar Hukum</strong>
                  <p>
                    Penggunaan layanan ini tunduk pada hukum yang berlaku di Republik Indonesia.
                  </p>
                </li>

                <li>
                  <strong>Persetujuan</strong>
                  <p>
                    Dengan mencentang kotak persetujuan, Anda menyatakan telah membaca dan menyetujui seluruh syarat dan ketentuan.
                  </p>
                </li>

                <li>
                  <strong>Tanggal Efektif</strong>
                  <p>Syarat dan ketentuan ini berlaku mulai 1 Oktober 2025.</p>
                </li>

                <li>
                  <strong>Informasi Kontak</strong>
                  <p>
                    Untuk bantuan lebih lanjut, hubungi email atau WhatsApp sekolah seperti tercantum di atas.
                  </p>
                </li>
              </ol>
            </div>

            {/* 🔹 Footer */}
            <div className="flex justify-end gap-2 border-t p-4">
              <button
                onClick={() => router.push("/pip")}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Tidak Setuju
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
              >
                Setuju
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
