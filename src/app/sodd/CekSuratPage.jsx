"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function CekSuratPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t");

  const [msg, setMsg] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setMsg("Memeriksa keaslian dokumen...");
    const res = await fetch("/api/cek-surat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_hash: token }),
    });

    const result = await res.json();
    setLoading(false);

    if (!result.status) {
      setMsg("❌ Kode verifikasi tidak valid atau dokumen telah dibatalkan.");
      setData(null);
    } else {
      setMsg("✅ Dokumen Resmi & Sah");
      setData(result.data);
    }
  };

  useEffect(() => {
    if (token) {
      setMsg(`Kode verifikasi terdeteksi: ${token}`);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center px-4 py-8">
      {/* Header Logo */}
      <div className="text-center mb-6">
        <img
          src="/logo/kemdikbudristek.png"
          alt="Logo SDN 2 Bokat"
          className="mx-auto w-20 h-20"
        />
        <h1 className="text-xl font-bold mt-2 text-[#0A3A67]">
          SD NEGERI 2 BOKAT/ SD PEMBINA KAB. BUOL
        </h1>
        <p className="text-sm text-gray-600 -mt-1">
          Kabupaten Buol — Sulawesi Tengah
        </p>
        <div className="border-t-4 border-[#C9A552] w-24 mx-auto mt-2 mb-1"></div>
        <p className="font-medium text-[#0A3A67] tracking-wide">
          Sistem Verifikasi Dokumen Elektronik
        </p>
      </div>

      {/* Token Info */}
      {token && (
        <div className="bg-white shadow-lg rounded-xl p-4 mb-4 w-full max-w-md border border-[#e3e8ee]">
          <p className="text-gray-700">
            <span className="font-semibold">Kode Verifikasi:</span> {token}
          </p>
        </div>
      )}

      {/* Button */}
      {!data && token && (
        <button
          onClick={handleCheck}
          disabled={loading}
          className="bg-[#0A3A67] text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-[#0d4a8d] transition w-full max-w-md"
        >
          {loading ? "Memeriksa..." : "Verifikasi Dokumen"}
        </button>
      )}

      {/* Message */}
      {msg && (
        <div className="mt-4 text-center text-gray-800 font-medium w-full max-w-md">
          {msg}
        </div>
      )}

      {/* Data Display */}
      {data && (
        <div className="mt-6 bg-white shadow-lg rounded-xl p-5 w-full max-w-md border border-[#cfd6df]">
          <h2 className="text-lg font-bold text-[#0A3A67] mb-3">Detail Dokumen:</h2>

          <div className="space-y-1 text-sm text-gray-700">
            <p><b>Nomor Surat:</b> {data.nomor_surat}</p>
            <p><b>Perihal:</b> {data.perihal}</p>
            <p><b>Tanggal:</b> {data.tanggal}</p>
            <p><b>Penandatangan:</b> {data.penandatangan}</p>
            <p><b>Status:</b> ✅ Sah & Terverifikasi</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-xs text-gray-500 text-center">
        Sistem Otentikasi Dokumen Digital<br />
        © SD Negeri 2 Bokat — Kabupaten Buol
      </div>
    </div>
  );
}
