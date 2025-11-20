
import SKPemberian from "../components/SKPemberian";
import DasborCek from "../components/DasborCek";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cek Status PIP",
  description: "Sistem Layanan Administrasi Sekolah SD Negeri 2 Bokat/ SD Pembina Kab. Buol",
};


export default function RekomendasiPage() {

  return (
    <div className="grid grid-row gap-2">
      <DasborCek />
      <SKPemberian />
    </div>
  );
}