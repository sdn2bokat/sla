"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import FormMasuk from "./components/FormMasuk";

export default function Pip() {
  const router = useRouter();

  return (
    <div
      className="fixed flex items-center justify-center"
    >
      
      {/* container: 80% width & height, no rounded corners */}
      <div
        className="relative w-[100vw] h-[100vh] overflow-auto md:p-4"
      >
        {/* main content: two columns on large, stacked on small */}
        <div className="sm:h-full flex flex-col">
          <div className="h-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            {/* KIRI */}
            
            <div className="bg-header-gradient md:rounded-[18px] border-l 
            md:border-l-0 pl-5 py-4 md:pt-7 md:pl-8 overflow-hidden relative select-none" onContextMenu={(e) => e.preventDefault()}>
          <div className="prose max-w-none">
      {/* Logo kiri atas */}
      <div className="flex">
        <img
          src="/images/sililah2bokat.png"
          alt="Layanan SD Negeri 2 Bokat"
          className="h-5 sm:h-10"
          
        />
        <div className='block md:hidden'>
          {/* Banner */}
          <img
            src="/images/img_login_mobi.png"
            alt="Banner Layanan"
            className="
              w-40
              absolute
              right-2 bottom-0
            "
          />
        </div> 
      </div>

      {/* Konten utama */}
      <div className="flex sm:pl-6">
        {/* Teks + Banner wrapper */}
        <div className="relative flex pt-5 md:pt-10">
          {/* Teks H1 */}
          <h1 className="text-2xl md:text-[50px] font-semibold text-bgDark z-10 leading-tight text-shadow">
            Selamat datang <br/>
            di <b className="text-[#FFD60A] font-semibold">Layanan <br className="hidden sm:block"/>SD <br className="block sm:hidden"/>Negeri <br className="hidden sm:block"/>2 Bokat</b>
          </h1>
        </div>
        <div className='hidden sm:block'>
          {/* Banner */}
          <img
            src="/images/img_login.png"
            alt="Banner Layanan"
            className="
              w-full
              sm:self-start
              absolute
              right-0 bottom-0 
            "
          />
        </div> 
        </div>
        </div>
      </div>
            {/* KANAN */}
      <div className="flex flex-col gap-3 px-6">
        <div className="flex items-center mb-2 ml-[-18px]">
        <a
          href="/"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-transparent hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
        >
        <Icon
        icon="ion:chevron-back-outline"
        className="w-5 h-5 font-semibold text-primaryDark"
         />
        <span className="text-sm font-semibold text-primaryDark">
        Kembali
        </span>
      </a>
  </div>
        <div className="flex items-center mb-4 gap-3">
        <img
       src="/images/masuk.png"
       alt="Layanan Orang Tua dan Siswa"
       className="h-10 sm:h-14 leading-tight"
     />
    <span className="text-[17px] sm:text-[22px] font-medium text-black leading-tight italic">
      Permohonan Rekomendasi PIP
      <p className="bg-header-gradient border-blue-500 rounded-tl-xl rounded-br-xl px-2 py-[1.5px] text-center text-bgDark 
      text-[10px] md:text-[16px] font-semibold italic text-shadow">Sistem Layanan Administrasi Sekolah</p>
    </span>
  </div>
  <div className="flex flex-col items-center">
    <FormMasuk />
  </div>
        <div className="pt-2 mt-6 bg-transparent border-t border-gray-200 flex items-center justify-center gap-1 sm:gap-2 opacity-90 select-none" onContextMenu={(e) => e.preventDefault()}>
          <img
           src="/images/logo-sililah.png"
           alt="Sistem Layanan Informasi Sekolah"
           className="h-5 sm:h-7"
          />
            <p className="text-[8.3px] md:text-[11px] font-tight leading-tight">
              <b className="text-[#0e47a1] font-semiblod opacity-70">Sistem Layanan Administrasi Sekolah</b>
              <br /><b className="bg-gray-600 text-white px-[2px] text-[5px] sm:text-[7px]">POWERED BY</b> 
              <b className="text-gray-500 text-[6px] md:text-[8px]"> Sistem Digitalisasi</b> <b className="text-[#37b0f5] text-[6px] md:text-[8px] font-medium ml-1">🌐www.sidi.my.id</b>
            </p>
        </div>
         
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
