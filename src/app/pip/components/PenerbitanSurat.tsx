"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { supabase } from "utils/supabase-client";
import SyaratKetentuanModal from "./popup/SyaratKetentuanModal";

type SuratType = {
  id: number;
  nama: string;
  no_surat: string;
  tgl_surat_keluar: string;
  perihal: string;
  pencatat: string;
  status: string;
  berlaku: string;
  tujuan: string;
  tt_de: string;
  kunci: string;
  created_at: string;
};

export default function PenerbitanSurat() {
  const router = useRouter();
  const [siswa, setSiswa] = useState<any | null>(null);
  const [surat, setSurat] = useState<SuratType | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("-");
  const [loading, setLoading] = useState<boolean>(false);
  const [agree, setAgree] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 🔹 Ambil data siswa dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem("siswaLogin");
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("🧩 Data siswa dari localStorage:", parsed);
      setSiswa(parsed);
    } else {
      router.push("/pip");
    }
  }, [router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Ambil data surat berdasarkan id rekom_pip → db_agenda_surat
  useEffect(() => {
    if (!siswa?.nisn) return;

    async function fetchData() {
      setLoading(true);
      try {
        console.log("🔍 Mencari rekom_pip berdasarkan NISN:", siswa.nisn);

        // Langkah 1 → Ambil id rekom_pip untuk siswa ini
        const { data: rekomList, error: e1 } = await supabase
          .from("rekom_pip")
          .select("id, created_at")
          .eq("nisn", siswa.nisn)
          .order("created_at", { ascending: false })
          .limit(1);

        const rekom = rekomList?.[0];


        if (e1) throw e1;
        if (!rekom?.id) {
          console.warn("⚠️ Tidak ditemukan rekom_pip untuk siswa:", siswa.nisn);
          setSurat(null);
          return;
        }

        console.log("🆔 ID rekom_pip ditemukan:", rekom.id);

        // Langkah 2 → Ambil data surat dari db_agenda_surat berdasarkan id rekom_pip
        const { data, error } = await supabase
          .from("db_agenda_surat")
          .select("*")
          .eq("id", rekom.id) // 🔹 gunakan id rekom_pip sebagai referensi
          .maybeSingle();

        if (error) throw error;

        if (data) {
          console.log("✅ Data surat ditemukan:", data);
          setSurat(data);

          // Format waktu pembaruan terakhir
          if (data.created_at) {
            const waktu = new Date(data.created_at);
            const formatWaktu = waktu.toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            setLastUpdate(formatWaktu);
          }
        } else {
          console.warn("⚠️ Tidak ditemukan data surat untuk rekom_id:", rekom.id);
          setSurat(null);
        }
      } catch (err) {
        console.error("❌ Gagal mengambil data surat:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [siswa]);

  // 🔹 Fungsi memanggil API conv-pdf dan redirect ke UnduhSurat
  const handleTerbitkan = async () => {
  if (!surat?.id) {
    alert("ID surat tidak valid");
    return;
  }

  setProcessing(true);
  setProgress(10);
    try {
      const res = await fetch("/api/suratpip/conv-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rekomId: surat.id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat PDF");

      console.log("✅ Surat berhasil diterbitkan:", result);
      sessionStorage.setItem("url_pdf", result.url_pdf);
      sessionStorage.setItem("nisn", siswa.nisn);
      setProgress(100);
      router.push("/pip/rekomendasi/unduh");
    } catch (err) {
      console.error("❌ Terjadi kesalahan:", err);
      alert("Gagal menerbitkan surat. Silakan coba lagi.");
    } finally {
      setProcessing(false);
    }
  };

  // 🔹 Simulasi progres naik selama processing aktif
  useEffect(() => {
    document.body.style.overflow = "hidden";
    let timer: NodeJS.Timeout;
    if (processing) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 95) return 95; // biar tidak 100 dulu sebelum selesai
          return p + 3;
        });
      }, 150);
    } else {
      setProgress(100);
      document.body.style.overflow = "auto";
    }
    return () => clearInterval(timer);
  }, [processing]);

  if (!siswa || loading) {
    return (
      <main className="container max-w-full bg-green-100 text-green-800 hover:bg-green-200 rounded-lg transition-all p-4 cursor-pointer ml-auto shrink-0">
        <p><strong>Mohon Tunggu!</strong><br/>
        Aplikasi sedang memuat data hasil sinkronisasi...</p>
      </main>
    );
  }
  

  return (
    <main className="container max-w-full overflow-hidden" id="pengesahan">
      <div className="hidden sm:block w-auto mt-[-2px]">
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

      {/* Verifikasi */}
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
            href="/pip/rekomendasi/prosul"
            className="ms-1 text-xs font-medium text-primary hover:text-blue-800 md:ms-2 dark:text-gray-400 dark:hover:text-white"
          >
            Verifikasi
          </a>
        </div>
      </li>

      {/* Penerbitan Surat */}
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
            Penerbitan Surat
          </span>
        </div>
      </li>

    </ol>
  </nav>
</div>

      <h1 className="text-[20px] sm:text-[28px] text-textTitle font-roboto font-semibold flex items-center mb-2 sm:mb-3">
        Penerbitan Surat
      </h1>

      
      <div className="w-full grid grid-cols-1 md:grid-cols-[2fr_1fr] items-start gap-2 md:gap-4 justify-center">
        {/* KIRI */}
        <div>
        <div id="alert-additional-content-3" className="p-4 mb-4 text-green-800 border border-green-300 rounded-[18px] bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800" role="alert">
  <div className="flex items-center">
    <svg className="shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
    </svg>
    <span className="sr-only">Info</span>
    <h3 className="text-lg text-green-800 font-medium">Hai {siswa.nama}!</h3>
  </div>
  <div className="mt-2 mb-4 text-sm text-justify">
    Anda akan menerbitkan surat resmi dari <b>SD Negeri 2 Bokat/ SD Pembina Kab. Buol</b> melalui Sistem Layanan Online Administrasi Sekolah. 
    Surat ini telah diverifikasi melalui Sistem Otentikasi Dokumen Digital (SODD) dan ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh BSrE. 
    Keaslian surat dapat diperiksa di <a href="https://silalah.sdn2bokat.sch.id/sodd/" className="font-semibold hover:text-blue-600" target="auto_blank">laman SODD</a> menggunakan ID surat ini.
  </div>
  {surat ? (
  <div className="flex relative items-center">
    {/* Tombol Lihat Token */}
    <button
      type="button"
      onClick={() => setShowTooltip(!showTooltip)}
      className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
    >
      <svg
        className="me-2 h-3 w-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 14"
      >
        <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
      </svg>
      Lihat ID
    </button>

    {/* Tooltip muncul di posisi tombol Dismiss */}
    {showTooltip && (
      <div
        ref={tooltipRef}
        className="absolute left-[6rem] ml-2 z-10 inline-block px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg dark:bg-gray-700"
      >
        ID Surat: <strong>{surat.kunci}</strong>
        {/* Panah tooltip */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-gray-900 dark:bg-gray-700"></div>
      </div>
    )}
  </div>
) : (
  <p className="text-gray-500">Belum ada ID surat.</p>
)}

</div>

        <div className="grid grid-cols-1 bg-white px-6 py-2 rounded-2xl shadow-sm border max-w-full overflow-hidden">
          {/* Checkbox Persetujuan */}
          <p className="text-sm my-3 text-justify">Sebelum Anda menekan tombol <strong>Terbitkan Surat</strong>, pastikan anda sudah membaca dan memahami seluruh{" "} <SyaratKetentuanModal /> layanan ini.</p>
          <label className="flex items-start gap-2 mt-3">
            <input
              type="checkbox"
              className="mt-[0.06cm] text-sm border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span className="text-sm text-gray-700">
              Saya mengerti dan menyetujui{" "}
              <SyaratKetentuanModal />{" "}
              layanan ini.
            </span>
          </label>

          <div className="w-full flex items-center justify-center">
          <button
            onClick={handleTerbitkan}
            disabled={!agree || processing}
            className={`my-4 w-full sm:w-96 rounded-full py-2 text-white font-medium transition ${
              !agree
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {processing ? "Memproses Surat..." : "Terbitkan Surat"}
          </button>
          </div>
          </div>
          <img
            src="/sodd/pemroses-surat.png"
            alt="Pemroses Surat"
            className="hidden sm:block w-full p-6"
          />
        </div>

        {/* KANAN KECIL */}
        <div>
        <div className="grid grid-cols bg-white rounded-2xl shadow-sm border max-w-full overflow-hidden">
          <div className="bg-header-gradient rounded-tl-xl text-bgDark text-shadow rounded-tr-xl px-2 sm:px-4 py-2 flex items-center gap-2 mb-4">
            <Icon
              icon="lucide:file-cog"
              className="w-6 h-6 text-gray-100 flex-shrink-0"
            />
            <h1 className="text-xl font-roboto font-semibold text-bgDark text-shadow">Info Surat</h1>
          </div>

          {surat ? (
            <div className="px-4 pb-4 grid grid-cols-1 gap-3 text-sm">
              <div>
                <p className="font-semibold">Tipe Dokumen [ID: {surat.kunci}]</p>
                <p className="text-gray-600 font-ibm">Surat Rekomendasi PIP</p>
              </div>
              <div>
                <p className="font-semibold">Masa Berlaku Surat</p>
                <p className="text-gray-600 font-ibm">
                  {surat.berlaku} ({surat.status})
                </p>
              </div>
              <div>
                <p className="font-semibold">Nomor Agenda</p>
                <p className="text-gray-600 font-ibm">{surat.no_surat}</p>
              </div>
              <div>
                <p className="font-semibold">Tanggal Surat</p>
                <p className="text-gray-600 font-ibm">
                  {surat.tgl_surat_keluar}
                </p>
              </div>
              <div>
                <p className="font-semibold">Perihal</p>
                <p className="text-gray-600 font-ibm">
                  {surat.perihal}
                </p>
              </div>
              <div>
                <p className="font-semibold">Penandatangan</p>
                <p className="text-gray-600 font-ibm">{surat.tt_de}</p>
              </div>
              <div>
                <p className="font-semibold">Tanggal Pengesahan</p>
                <p className="text-gray-600 font-ibm">{lastUpdate}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Belum ada data surat untuk siswa ini.</p>
          )}
        </div>
        </div>
        <img
            src="/sodd/pemroses-surat.png"
            alt="Pemroses Surat"
            className="block sm:hidden w-full p-2"
          />
      </div>
    {processing && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Lingkaran biru */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            {/* Lapisan kuning */}
            <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 border-transparent animate-[spin_1.2s_linear_infinite_reverse]"></div>
            {/* Persen di tengah */}
            <span className="text-xs sm:text-sm font-bold text-black">{progress}%</span>
          </div>

          {/* Teks di bawah lingkaran */}
          <div className="mt-3 text-center">
            <p className="text-sm font-semibold text-black">Memproses Surat...</p>
            <p className="text-sm text-black">
            Silakan tunggu dan jangan tutup halaman ini.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
