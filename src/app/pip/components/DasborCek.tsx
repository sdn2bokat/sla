"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "utils/supabase-client";
import { Icon } from "@iconify/react";

export default function DasborCek() {
  const router = useRouter();
  const [siswa, setSiswa] = useState<any | null>(null);
  const [pipRows, setPipRows] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);

  // Ambil data siswa dari localStorage (hasil dari formmasuk)
  useEffect(() => {
    const saved = localStorage.getItem("siswaLogin");
    if (!saved) {
      router.push("/pip"); // redirect ke halaman form masuk
      return;
    }
    try {
      setSiswa(JSON.parse(saved));
    } catch {
      console.warn("Data siswaLogin corrupt di localStorage");
      router.push("/pip");
    }
  }, [router]);
  if (!siswa) {
    return (
      <main className="container max-w-full overflow-hidden">
        <p className="text-gray-500">Memuat data siswa...</p>
      </main>
    );
  }

  async function handleCekPip() {
    if (!siswa) return;
    setLoading(true);
    setPesan(null);

    try {
      const delay = new Promise(resolve => setTimeout(resolve, 5000));
      const fetchPip = supabase
        .from("db_pip")
        .select("*")
        .eq("nisn", siswa.nisn);
      const [{ data, error }] = await Promise.all([fetchPip, delay]);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Ambil seluruh tahap untuk pesan fallback
        const { data: all, error: err2 } = await supabase
          .from("db_pip")
          .select("tahap, tahun");
        if (err2) throw err2;

        const tahaps = all
          .map((r) => Number(r.tahap))
          .filter(Boolean)
          .sort((a, b) => a - b);

        const tahapan = formatTahapList(tahaps);
        const tahun =
          all && all.length > 0
            ? Math.max(...all.map((r) => Number(r.tahun)))
            : "—";

        setPesan(
          `Maaf! ${siswa.nama} tidak ditemukan dalam daftar SK Pemberian PIP Tahap ${tahapan} Tahun ${tahun}. Silahkan cek nama Kamu secara berkala atau pantau terus informasi update database Rekap SK Pemberian dibawah ini. Tks.`
        );
        setPipRows([]);
        return;
      }

      setPipRows(data);
      const chosen = [...data].sort(
        (a, b) => Number(b.tahap) - Number(a.tahap)
      )[0];
      localStorage.setItem("pipSelected", JSON.stringify(chosen));
    } catch (err) {
      console.error(err);
      setPesan("Terjadi kesalahan saat memeriksa data PIP.");
    } finally {
      setLoading(false);
    }
  }

  function formatTahapList(arr: number[]) {
    if (!arr || arr.length === 0) return "";
    const unique = Array.from(new Set(arr)).sort((a, b) => a - b);
    if (unique.length === 1) return `${unique[0]}`;
    if (unique.length === 2) return `${unique[0]} dan ${unique[1]}`;
    const last = unique.pop();
    return `${unique.join(", ")} dan ${last}`;
  }

  async function handleBuatRekomendasi(row: any) {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 6000));
    if (row?.tgl_cair) {
      router.push("/pip/rekomendasi/warning");
    } else {
      router.push("/pip/rekomendasi/prosul");
    }
  }
  
  // ===================== RENDER UI =====================

  return (
    <main className="container max-w-full overflow-hidden" id="dasborcek">
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
            Cek SK Pemberian
          </span>
        </div>
      </li>

    </ol>
  </nav>
</div>
      <h1 className="text-[20px] sm:text-[28px] text-textTitle font-roboto font-semibold flex items-center mb-2 sm:mb-1">
        Cek SK Pemberian
      </h1>
        <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center gap-2">
        <Icon
          icon="mdi:school-outline"
          className="w-6 h-6 text-blue-600 flex-shrink-0"
        />
        <h2 className="text-xl font-semibold text-gray-800">
          Profil
        </h2>
      </div>
        {/* Card Info Siswa */}
        {siswa && (
  <div className="mt-3 w-full border rounded-2xl px-3 py-4 shadow-sm bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    
    {/* Icon untuk Desktop */}
    <div className="hidden md:flex items-center justify-center flex-shrink-0">
      <Icon
        icon="fluent-color:guest-16"
        className="w-[100px] h-[100px]"
      />
    </div>

    {/* Informasi Siswa */}
    <div className="flex flex-col w-full">
      {/* Header untuk Mobile */}
      <div className="flex md:hidden items-center gap-2">
        <Icon
          icon="fluent-color:contact-card-16"
          className="w-6 h-6 text-blue-600 flex-shrink-0"
        />
        <h4 className="text-base font-semibold">{siswa.nama}</h4>
      </div>

      {/* Header untuk Desktop */}
      <div className="hidden md:flex items-center gap-2">
        <h4 className="text-lg font-semibold">{siswa.nama}</h4>
      </div>

      {/* Tabel Data Siswa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm sm:text-md text-gray-700">
        <table className="ml-8 sm:ml-0 min-w-full">
          <tbody>
            <tr>
              <td className="font-medium pr-2 align-top">NIPD</td>
              <td className="px-1 align-top">:</td>
              <td>{siswa.nipd}</td>
            </tr>
            <tr>
              <td className="font-medium pr-2 align-top">NISN</td>
              <td className="px-1 align-top">:</td>
              <td>{siswa.nisn}</td>
            </tr>
            <tr>
              <td className="font-medium pr-2 align-top">NIK</td>
              <td className="px-1 align-top">:</td>
              <td>{siswa.nik}</td>
            </tr>
          </tbody>
        </table>

        <table className="min-w-full">
          <tbody>
            <tr>
              <td className="font-medium pr-2 align-top">Rombel</td>
              <td className="px-1 align-top">:</td>
              <td>{siswa.rombel}</td>
            </tr>
            <tr>
              <td className="font-medium pr-2 align-top">Nama Ibu</td>
              <td className="px-1 align-top">:</td>
              <td>{siswa.nama_ibu}</td>
            </tr>
            <tr>
              <td className="font-medium pr-2 align-top">Layak PIP</td>
              <td className="px-1 align-top">:</td>
              <td>{siswa.penerima_pip}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
        {/* Tombol & Pesan */}
        { siswa && !pesan && (!pipRows || pipRows.length === 0) && (
  <div className="w-full flex items-center justify-center">
    <button
  onClick={handleCekPip}
  disabled={siswa.penerima_pip !== "Ya" || loading}
  className={`mt-4 w-full sm:w-96 rounded-full py-2 font-medium text-white transition flex items-center justify-center gap-2
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
        : siswa.penerima_pip !== "Ya"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }
  `}
>
  {loading && (
                        <svg
                             className="animate-spin h-5 w-5 text-white"
                             xmlns="http://www.w3.org/2000/svg"
                             fill="none"
                             viewBox="0 0 24 24"
                        >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                        </svg>
                      )}
  {loading ? "Mengecek SK..." : "Cek SK Pemberian PIP"}
</button>
  </div>
)}


        {/* Pesan hasil cek */}
        {pesan && (
          <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-md text-red-700 whitespace-pre-line">
            {pesan}
          </div>
        )}

        {/* Jika ada data pip */}
        {pipRows && pipRows.length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-md text-green-800">
            {(() => {
              const chosen = [...pipRows].sort(
                (a, b) => Number(b.tahap) - Number(a.tahap)
              )[0];
              return (
                <>
                  <p className="font-semibold text-green-800">Selamat!</p>
                  <p className="mt-1">
                    {siswa.nama} telah ditetapkan sebagai penerima Dana
                    Bansos Program Indonesia Pintar (PIP) tahap{" "}
                    <span className="font-semibold">{chosen.tahap}</span> tahun
                    anggaran <span className="font-semibold">{chosen.tahun}</span>, berdasarkan SK Pemberian Nomor:{" "}
                    <span className="font-semibold">{chosen.no_sk}</span>, yang
                    diusulkan oleh{" "}
                    <span className="font-semibold">
                      {chosen.nama_pengusul}
                    </span>{" "}
                    dengan informasi pencairan dana{" "}
                    <span className="font-semibold">
                      {chosen.keterangan_pencairan}
                    </span>{" "}
                    di Bank BRI.
                  </p>
                  <p className="mt-2">
                    Persyaratan: fotokopi KK, KTP orang tua, buku tabungan
                    (rekening Simpel), dan Surat Rekomendasi dari kepala
                    sekolah.
                  </p>
                <div className="w-full flex items-center justify-center">
                  <button
                    disabled={loading}
                    onClick={() => handleBuatRekomendasi(chosen)}
                    className={`mt-4 w-full sm:w-96 rounded-full py-2 font-medium text-white transition flex items-center justify-center gap-2
                      ${loading 
                        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" 
                        : "bg-blue-600 hover:bg-blue-700"
                      }
                     `}
                     >
                      {loading && (
                        <svg
                             className="animate-spin h-5 w-5 text-white"
                             xmlns="http://www.w3.org/2000/svg"
                             fill="none"
                             viewBox="0 0 24 24"
                        >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                        </svg>
                      )}
                    {loading ? "Memproses data..." : "Buat Surat Rekomendasi"}
                  </button>
                  </div>
                </>
                
              );
            })()}
          </div>
        )}
      </div>
    </main>
  );
}
