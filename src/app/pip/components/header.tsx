"use client";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  async function Header() {
    if (!siswa) return;
    setLoading(true);
    setPesan(null);

    try {
      const { data, error } = await supabase
        .from("db_pip")
        .select("*")
        .eq("nisn", siswa.nisn);

      if (error) throw error;
    }  finally {
      setLoading(false);
    }}

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // misalnya kamu mau hapus session Supabase / localStorage
    localStorage.removeItem("nik");
    window.location.href = "/pip"; // kembali ke halaman login
  };

  return (
    <header
      className="sticky top-0 bottom-1 z-50 w-full bg-white shadow-sm border-b flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16"
    >
      {/* KIRI: Logo + Hamburger (mobile) */}
      <div className="flex items-center gap-3">
        {/* Tampilkan hamburger hanya di mobile */}
        <button
          onClick={onToggleSidebar}
          className="block sm:hidden text-gray-700 hover:text-blue-600 transition"
          aria-label="Toggle sidebar"
        >
          <Icon icon="mdi:menu" className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/images/sililah2bokat.png" // ubah ke logo kamu di public/logo.png
            alt="Logo"
            className="block sm:hidden h-7"
          />
          <span className="hidden sm:block font-medium text-gray-800 sm:text-xl text-shadow">
            👋 Hai <strong className="text-textHijau">{siswa.nama}</strong>
          </span>
        </div>
      </div>

      {/* KANAN: Tombol keluar */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700 hover:text-red-600 transition"
      >
        <Icon icon="mdi:logout" className="w-5 h-5" />
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </header>
  );
}
