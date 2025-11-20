"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { supabase } from "utils/supabase-client";

const PdfThumbnail = dynamic(() => import("./PdfThumbnail"), {
  ssr: false,
});

export default function UnduhSurat() {
  const router = useRouter();
  const [siswa, setSiswa] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [namaSiswa, setNamaSiswa] = useState("");
  const [urlPdf, setUrlPdf] = useState("");

  // ================================
  // HANDLE CETAK SENDIRI
  // ================================
  const handleCetakSendiri = async () => {
    try {
      const nisn = sessionStorage.getItem("nisn");

      if (!nisn) {
        alert("NISN tidak ditemukan. Silakan kembali.");
        return;
      }

      const { data, error } = await supabase
        .from("rekom_pip")
        .select("nama, url_pdf")
        .eq("nisn", nisn)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        alert("Data rekomendasi tidak ditemukan.");
        return;
      }

      const { nama, url_pdf } = data;

      // SIMPAN UNTUK MODAL
      setNamaSiswa(nama);
      setUrlPdf(url_pdf);

      // DOWNLOAD
      // PAKSA DOWNLOAD PDF TANPA DIBUKA BROWSER
const response = await fetch(url_pdf);
const blob = await response.blob();
const blobUrl = window.URL.createObjectURL(blob);

const safeName = nama.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
const a = document.createElement("a");
a.href = blobUrl;
a.download = `${safeName}_Surat_Rekomendasi_PIP_TTE_signed.pdf`;
document.body.appendChild(a);
a.click();
a.remove();

setTimeout(() => {
  window.URL.revokeObjectURL(blobUrl);
}, 5000);


      // TAMPILKAN MODAL
      setShowModal(true);

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengunduh file.");
    }
  };

  // ================================
  // HANDLE KONFIRMASI WHATSAPP
  // ================================
  const handleKonfirmasiWA = () => {
    const pesan = `Kepada Yth. Admin Sekolah.
Izin mengonfirmasi bahwa Surat Rekomendasi PIP atas nama *${namaSiswa}* telah berhasil diterbitkan oleh sistem. File surat tersebut juga sudah kami unduh untuk dicetak secara mandiri.

Terima kasih atas pelayanannya.

_[Pesan sistem]_ *Fitur Dicetak Sendiri*
`;

    window.open(
      `https://wa.me/6281388181249?text=${encodeURIComponent(pesan)}`,
      "_blank"
    );

    window.location.href = "/terima-kasih";
  };

  // ================================
  // HANDLE CETAK SEKOLAH
  // ================================
  const handleCetakSekolah = async () => {
    try {
      const nisn = sessionStorage.getItem("nisn");

      if (!nisn) {
        alert("NISN tidak ditemukan.");
        return;
      }

      const { data, error } = await supabase
        .from("rekom_pip")
        .select("nama, url_pdf")
        .eq("nisn", nisn)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        alert("Data rekomendasi tidak ditemukan.");
        return;
      }

      const { nama, url_pdf } = data;

      const pesan = `Kepada Yth. Admin Sekolah.
Izin mengonfirmasi bahwa Surat Rekomendasi PIP atas nama *${nama}* telah berhasil diterbitkan oleh sistem. Mohon bantuannya untuk mencetak surat tersebut dan menginformasikan waktu pengambilannya.

Berikut tautan file:
${url_pdf}

Terima kasih atas pelayanannya.

_[Pesan sistem]_ *Fitur Dicetak Sekolah*
`;

      window.open(
        `https://wa.me/6281388181249?text=${encodeURIComponent(pesan)}`,
        "_blank"
      );

      window.location.href = "/terima-kasih";
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses tombol.");
    }
  };

  // ================================
  // LOAD SISWA
  // ================================
  useEffect(() => {
    const saved = localStorage.getItem("siswaLogin");
    if (!saved) {
      router.push("/pip");
      return;
    }
    setSiswa(JSON.parse(saved));
  }, [router]);

  useEffect(() => {
  if (showModal) {
    document.body.style.overflow = "hidden"; // matikan scroll
  } else {
    document.body.style.overflow = "auto"; // hidupkan lagi
  }

  return () => {
    document.body.style.overflow = "auto"; // jaga-jaga
  };
}, [showModal]);
 
  return (
    <>
    <main className="container max-w-full overflow-hidden" id="pengesahan">
      <div className="hidden sm:block w-auto mb-5 mt-[-2px]">
          <nav className="flex" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
      
      {/* Beranda */}
      <li className="inline-flex items-center">
        <a
          href="https://sdn2bokat.sch.id"
          className="inline-flex items-center text-xs font-medium text-primary hover:text-blue-800 dark:text-gray-400 dark:hover:text-white"
        >
          <svg
            className="w-3 h-3 me-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
          </svg>
          Beranda
        </a>
      </li>

      {/* Status */}
      <li>
        <div className="flex items-center">
          <svg
            className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <a
            href="/pip/rekomendasi"
            className="ms-1 text-xs font-medium text-primary hover:text-blue-800 md:ms-2 dark:text-gray-400 dark:hover:text-white"
          >
            Status
          </a>
        </div>
      </li>

      {/* Unduh */}
      <li aria-current="page">
        <div className="flex items-center">
          <svg
            className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <span className="ms-1 text-xs font-medium text-gray-500 md:ms-2 dark:text-gray-400">
            Unduh
          </span>
        </div>
      </li>

    </ol>
  </nav>
</div>

      <div className="w-full grid grid-cols-1 md:grid-cols-[2fr_1fr] items-start gap-2 md:gap-4 justify-center">
      <div>
      <div className="flex-cols bg-white rounded-2xl shadow-sm border max-w-full overflow-hidden">
      <div className="bg-header-gradient rounded-tl-xl text-bgDark rounded-tr-xl px-2 sm:px-4 py-2 flex items-center gap-2">
            <Icon
              icon="mdi:download-box"
              className="w-6 h-6 text-gray-100 flex-shrink-0"
            />
            <h1 className="text-xl font-roboto font-semibold text-bgDark">Unduh & Konfirmasi</h1>
            </div>
        <div className="p-4 sm:p-6">
          <p className="sm:text-lg font-tight text-center leading-tight mb-4">
            Surat Rekomendasi PIP Anda sudah siap diunduh dan dicetak. Silakan pilih salah satu opsi pencetakan Surat di bawah ini:
          </p>
          <div className="w-full grid grid-cols sm:grid-cols-2 items-center gap-3 sm:gap-6 justify-center">
          
          {/* Tombol Dicetak Sendiri */}
                <button
                  className="sm:text-lg bg-[#0066CC] text-white hover:bg-green-700 hover:border-green-700 text-shadow font-medium w-full border-2 border-[#0066CC] shadow-xl rounded-[18px] px-6 py-3 transition"
                  onClick={handleCetakSendiri}
                >
                  Dicetak Sendiri<br />
                  <p className="text-xs sm:text-sm font-tight">
                    Klik untuk mengunduh file & konfirmasi untuk cetak sendiri
                  </p>
                </button>

                {/* Tombol Dicetak Sekolah */}
                <button
                  className="sm:text-lg bg-[#00A8E8] text-white hover:bg-green-700 hover:text-white hover:border-green-700 text-shadow font-medium w-full border-2 border-[#00A8E8] shadow-xl rounded-[18px] px-4 py-3 transition"
                  onClick={handleCetakSekolah}
                >
                  Dicetak Sekolah<br />
                  <p className="text-xs sm:text-sm font-tight">
                    Klik untuk kirim URL file & konfirmasi pengambilan di sekolah
                  </p>
                </button>
          </div>
          </div>
          </div>
          <img
            src="/sodd/pemroses-surat.png"
            alt="Pemroses Surat"
            className="hidden sm:block w-full p-6"
          />
       </div>

        {/* KOLOM THUMBNAIL */}
        <div className="grid grid-cols bg-white rounded-2xl shadow-sm border max-w-full overflow-hidden">
          <div className="bg-header-gradient rounded-tl-xl text-bgDark rounded-tr-xl px-2 sm:px-4 py-2 flex items-center gap-2">
            <Icon
              icon="mdi:file-pdf-box"
              className="w-6 h-6 text-gray-100 flex-shrink-0"
            />
            <h1 className="text-xl font-roboto font-semibold text-bgDark">File Thumbnail</h1>
            </div>
             
             <div className="w-auto">
             {typeof window !== "undefined" && (
              <PdfThumbnail url={sessionStorage.getItem("url_pdf") || ""} />
              )}
              </div>
              
        </div>
        <img
            src="/sodd/pemroses-surat.png"
            alt="Pemroses Surat"
            className="block sm:hidden w-full p-2"
          />
      </div>
    </main>
   {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 max-w-md rounded-xl shadow-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
      <Icon
        icon="ix:success"
        className="w-20 h-20 text-green-600 text-center"
      />
      </div>
            <h2 className="text-xl font-semibold mb-3">
              File Berhasil Diunduh
            </h2>

            <p className="text-sm mb-5">
              Surat Rekomendasi Permohonan Pencairan PIP atas nama <b>{namaSiswa}</b> telah berhasil
              diunduh. Silakan konfirmasi ke pihak sekolah.
            </p>

            <button
              onClick={handleKonfirmasiWA}
              className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      )}
    </>
  );
}