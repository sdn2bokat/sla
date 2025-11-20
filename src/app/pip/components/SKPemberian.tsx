"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Icon } from "@iconify/react";

interface DbPipRow {
  tahap: number;
  created_at: string;
  tgl_cair: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SKPemberian() {
  const [jumlahSK, setJumlahSK] = useState<number>(0);
  const [tahapList, setTahapList] = useState<string>("-");
  const [lastUpdate, setLastUpdate] = useState<string>("-");
  const [jumlahCair, setJumlahCair] = useState<string>("-");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ambil data dari tabel db_pip
        const { data, error } = await supabase
          .from("db_pip")
          .select("tahap, tgl_cair, created_at");

        if (error) throw error;

        console.log("✅ Data dari Supabase:", data);

        if (data && data.length > 0) {
  // Jumlah SK
  setJumlahSK(data.length);

  // Hitung jumlah data yang sudah cair
  const cairCount = data.filter((row) => row.tgl_cair !== null).length;
  setJumlahCair(cairCount.toLocaleString("id-ID") + " siswa");

  // Tahap unik urut kecil ke besar
  const tahapUnik = Array.from(
    new Set(data.map((row) => row.tahap))
  ).sort((a, b) => Number(a) - Number(b));

  setTahapList(tahapUnik.join(", "));

  // Ambil waktu pembaruan terbaru
  const terbaru = data.reduce((acc, row) => {
    return new Date(row.created_at) > new Date(acc.created_at)
      ? row
      : acc;
  });

  const waktu = new Date(terbaru.created_at);
  const formatWaktu = waktu.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  setLastUpdate(formatWaktu);
} else {
  setJumlahSK(0);
  setTahapList("-");
  setLastUpdate("-");
  setJumlahCair("-");
}
      } catch (err) {
        console.error("❌ Error fetching db_pip:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 max-w-full overflow-hidden" id="skpemberian">
      <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                <Icon icon="mdi:database-sync-outline" className="w-6 h-6 text-blue-600" />
                Rekap SK Pemberian {new Date().getFullYear()}
              </h2>
      {/* Waktu pembaruan */}
          <p className="text-textHijau text-xs sm:text-sm italic mb-2 sm:ml-8">
            Update database:{" "}
            <span className="text-textHijau">{lastUpdate} Wita</span>
          </p>
          
      {loading ? (
  <p className="text-gray-500">Memuat data...</p>
) : (
  <div className="grid grid-cols-3 items-center justify-center gap-2 mt-1">
    {/* Card 1: Jumlah SK */}
    <div className="bg-blue-50 shadow border border-blue-100 rounded-lg pt-1">
      <h3 className="text-sm sm:text-base text-center justify-center text-gray-800">
        Siswa SK Pemberian
      </h3>
      <p className="text-center justify-center text-base sm:text-lg font-semibold text-green-700">
        {jumlahSK.toLocaleString("id-ID")} siswa
      </p>
    </div>

    {/* Card 2: Tahap Pemberian */}
    <div className="bg-green-50 shadow border border-green-100 rounded-xl pt-1">
      <h3 className="text-sm sm:text-base text-center justify-center text-gray-800">
        Tahap Pemberian
      </h3>
      <p className="text-center justify-center text-base sm:text-lg font-semibold text-green-700">
        {tahapList}
      </p>
    </div>

    {/* Card 3: Konfirmasi Cair */}
    <div className="bg-yellow-50 shadow border border-green-100 rounded-xl pt-1">
      <h3 className="text-sm sm:text-base text-center justify-center text-gray-800">
        Konfirmasi Cair
      </h3>
      <p className="text-center justify-center text-base sm:text-lg font-semibold text-green-700">
        {jumlahCair}
      </p>
    </div>
  </div>
)}
      </div>
  );
}
