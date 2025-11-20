"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "utils/supabase-client";
import { Icon } from "@iconify/react";
 
export default function PertanyaanSudahTerbit() {
    const [siswa, setSiswa] = useState<any | null>(null);
    const router = useRouter();
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
  
    async function PernyataanSudahTerbit() {
      if (!siswa) return;
      setLoading(true);
      setPesan(null);
  
      try {
        const { data, error } = await supabase
          .from("db_pip")
          .select("*")
          .eq("nisn", siswa.thp);
  
        if (error) throw error;
      }  finally {
        setLoading(false);
      }}

  return (
  <main className="container max-w-full overflow-hidden" id="verifikasi">
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

      {/* Pengesahan */}
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
            Peringatan
          </span>
        </div>
      </li>

    </ol>
  </nav>
</div>
      <div className="text-sm sm:text-base text-center font-roboto leading-tight mt-10">
      <div className="flex items-center justify-center">
      <Icon
        icon="fxemoji:warningsign"
        className="w-14 h-14 text-green-yellow-500 text-center"
      />
      </div>
     <h1 className="text-[30px] sm:text-[34px] text-[#ffb636] text-shadow-sm text-center font-xirod font-medium mb-4">
        Peringatan!
      </h1>
      <p className="sm:text-lg text-center mb-6 px-6">
        Anda tidak dapat mengajukan Penerbitan Surat Rekomendasi Permohonan Pencairan Dana Bansos PIP, karena surat tersebut hanya dapat diterbitkan 1 (satu) kali dalam 1 (satu) tahun anggaran. 
        Saat ini, untuk surat rekomendasi atas nama <strong>{siswa.nama}</strong> sudah diterbitkan. <a href="https://sdn2bokat.sch.id/hubungi_kami" className="text-blue-600">Hubungi kami</a> untuk informasi lebih lanjut.</p>

      <div className="flex items-center justify-center mb-4">
        <a
          href="/terima-kasih"
          rel="noopener noreferrer"
          className="mt-1 px-6 bg-blue-600 hover:bg-blue-700 text-center text-white font-medium w-auto rounded-full py-2 transition"
        >
            Oke
            </a>
      </div>
      </div>
    </main>
  );
}
