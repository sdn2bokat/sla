"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import BagikanSosmed from "components/BagikanSosmed/BagikanSosmed";

export default function TerimaKasih(){

  return (
    <main className="container max-w-full h-screen flex items-center justify-center overflow-hidden p-4" id="terimakasih">
     <div className="text-sm sm:text-base text-center font-roboto leading-tight">
      <div className="flex items-center justify-center">
      <Icon
        icon="hugeicons:love-korean-finger"
        className="w-14 h-14 text-green-600 text-center"
      />
      </div>
     <h1 className="text-[30px] sm:text-[34px] text-green-600 text-center font-vibes font-medium">
        Terima Kasih!
      </h1>
      <p className="sm:text-lg text-center mb-6">
        Sudah Menggunakan Layanan Administrasi Sekolah<br />
        SD NEGERI 2 BOKAT/ SD PEMBINA KAB. BUOL
      </p>

      <div className="flex items-center justify-center">
        <a
          href="https://sdn2bokat.sch.id"
          rel="noopener noreferrer"
          className="mt-2 px-6 bg-blue-600 hover:bg-blue-700 text-center text-white font-medium w-auto rounded-full py-2 transition"
        >
            Oke
            </a>
      </div>
      
      <p className="sm:text-lg text-center mt-6 mb-3">
        Bagikan ke:
      </p>
      <BagikanSosmed/>
      <div className="mt-40 sm:mt-20">
        <p className="font-poppins text-xs sm:text-sm text-center text-gray-700 font-tight">Hak Cipta © {new Date().getFullYear()} SD NEGERI 2 BOKAT/ SD PEMBINA KAB. BUOL
      </p>
      <div className="pt-2 bg-transparent flex items-center justify-center gap-1 sm:gap-2 opacity-90 select-none" onContextMenu={(e) => e.preventDefault()}>
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
    </main>
  );
}
