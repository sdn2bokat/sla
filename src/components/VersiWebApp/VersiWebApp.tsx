export default function VersiWebApp() {

  return (
    <>
      {/* versi */}
      <div className="text-center text-xs text-gray-500 leading-tight">
        © {new Date().getFullYear()} SD Negeri 2 Bokat<br />
        SiLALah versi 1.2.1<br />
        <b className="bg-gray-600 text-white px-[2px] text-[7px] sm:text-[9px]">POWERED BY</b> 
        <b className="text-gray-500 text-[8px] md:text-[10px]"> Sistem Digitalisasi</b>
      </div>
      </>
  );
}
