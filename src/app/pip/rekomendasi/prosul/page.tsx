
import VerifikasiData from "app/pip/components/VerifikasiData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Data Rekomendasi PIP",
  description: "Sistem Layanan Administrasi Sekolah SD Negeri 2 Bokat/ SD Pembina Kab. Buol",
};


export default function ProsesUsulPage() {

  return (
    <div>
      <VerifikasiData />
    </div>
  );
}