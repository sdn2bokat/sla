"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "utils/supabase-client";
import { Icon } from "@iconify/react";
 
export default function FormMasuk() {
  const router = useRouter();

  const [jenisData, setJenisData] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);
  // Fungsi buat captcha acak
  function generateCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 5 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPesan("");

    // Validasi form
    if (!jenisData) return setPesan("Silakan pilih jenis data terlebih dahulu.");
    if (!inputValue.trim()) return setPesan("Kolom tidak boleh kosong.");
    if (captchaInput.toUpperCase() !== captcha) {
      setPesan("Kode captcha salah. Silakan coba lagi.");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }

    setLoading(true);

    try {
      // Query ke Supabase
      const column = jenisData === "nisn" ? "nisn" : "nik";
      const { data, error } = await supabase
        .from("db_siswa")
        .select("*")
        .eq(column, inputValue.trim())
        .single();

      if (error || !data) {
        setPesan("Data tidak ditemukan. Periksa kembali " + jenisData.toUpperCase() + ".");
        setLoading(false);
        return;
      }

      // ✅ Jika berhasil login → simpan data & redirect
      localStorage.setItem("siswaLogin", JSON.stringify(data));
      router.push("/pip/rekomendasi"); // arahkan ke halaman CekPenerimaPip.tsx
    } catch (err) {
      console.error(err);
      setPesan("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container max-w-full overflow-hidden" id="formmasuk">
      <h1 className="text-[20px] sm:text-[24px] font-roboto font-tight text-gray-800 flex items-center">
        Siswa / Orang Tua
      </h1>
      <p className="text-sm sm:text-base text-gray-800 font-roboto font-tight flex items-center mt-[-6] mb-2 italic">
        Masuk tanpa akun menggunakan data Siswa
      </p>
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto py-4 sm:px-10"
    >
      {/* Dropdown Jenis Data */}
      <div className="relative text-sm w-full">
      <label htmlFor="jenis_data_select" className="sr-only">
      Pilih jenis data
      </label>

      <select id="jenis_data_select" className="block py-2.5 ps-0 w-full text-sm text-textTitle bg-transparent border-0 border-b-2 border-[#03538bff] mb-4 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
      value={jenisData}
      onChange={(e) => setJenisData(e.target.value)}
      >
        <option value="">Pilih jenis data</option>
        <option value="nisn">NISN</option>
        <option value="nik">NIK Siswa</option>
      </select>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </span>
      </div>
      {/* Input NISN/NIK */}
      {jenisData && (
  <div className="relative w-full mb-4">
    {/* Input */}
    <input
      type="text"
      id="input_identitas"
      className="
        block
        px-4
        pb-2.5
        pt-3
        w-full
        text-sm
        text-textTitle
        bg-bgLight
        rounded-full
        border
        border-[#03538bff]
        appearance-none
        focus:outline-none
        focus:ring-0
        focus:border-blue-500
        peer
      "
      placeholder=" "
      maxLength={jenisData === "nisn" ? 10 : 16}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
    />

    {/* Floating Label */}
    <label
      htmlFor="input_identitas"
      className="
        absolute 
        text-sm 
        text-gray-500
        duration-300 
        transform 
        -translate-y-4 
        scale-75 
        top-2 
        z-10 
        origin-[0] 
        bg-bgLight 
        px-2
        mx-2 
        peer-focus:px-2
        peer-focus:mx-2
        peer-focus:text-blue-600
        peer-placeholder-shown:scale-100 
        peer-placeholder-shown:-translate-y-1/2 
        peer-placeholder-shown:top-1/2 
        peer-focus:top-2 
        peer-focus:scale-75 
        peer-focus:-translate-y-4
        start-1
      "
    >
      {jenisData === "nisn"
        ? "Masukkan NISN Siswa"
        : "Masukkan NIK Siswa"}
    </label>
  </div>
)}


      {/* CAPTCHA */}
<div className="w-full mx-auto flex items-center justify-center gap-2 mb-5">

  {/* Kotak CAPTCHA */}
  <div className="flex items-center justify-center text-gray-100 text-opacity-50 font-customFont text-shadow font-semibold text-xl sm:text-2xl tracking-[0.46em] 
                  bg-[url('/captcha.jpg')] bg-cover bg-center border rounded-full px-3 sm:px-6 pt-2.5 pb-1 shadow-sm select-none">
    {captcha}
  </div>

  {/* Input CAPTCHA */}
  <div className="relative w-full">
  <input
    type="text"
    id="input_captcha"
    value={captchaInput}
    onChange={(e) => setCaptchaInput(e.target.value)}
    className="block
        px-4
        pb-2.5
        pt-3
        w-full
        text-sm
        text-textTitle
        uppercase
        bg-bgLight
        rounded-full
        border
        border-[#03538bff]
        appearance-none
        focus:outline-none
        focus:ring-0
        focus:border-blue-500
        peer"
        placeholder=" "
  />
  <label
      htmlFor="input_captcha"
      className="
        absolute 
        text-sm 
        text-gray-500
        duration-300 
        transform 
        -translate-y-4 
        scale-75 
        top-2 
        z-10 
        origin-[0] 
        bg-bgLight 
        px-2
        mx-2 
        peer-focus:px-2
        peer-focus:mx-2
        peer-focus:text-blue-600
        peer-placeholder-shown:scale-100 
        peer-placeholder-shown:-translate-y-1/2 
        peer-placeholder-shown:top-1/2 
        peer-focus:top-2 
        peer-focus:scale-75 
        peer-focus:-translate-y-4
        start-1
      "
    >
      Ketik kode
    </label>
  </div>
  {/* Tombol Refresh */}
  <button
    type="button"
    onClick={() => setCaptcha(generateCaptcha())}
    className="flex flex-col items-center text-blue-600 hover:text-blue-700"
  >
    <Icon icon="logos:recaptcha" className="w-10 h-10" />
  </button>
</div>

{/* Pesan error */}
{pesan && <p className="text-red-500 text-sm mb-3">{pesan}</p>}


      {/* Tombol submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full text-white font-semibold rounded-full py-3 transition flex items-center justify-center gap-2
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
        {loading ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
    </main>
  );
}
