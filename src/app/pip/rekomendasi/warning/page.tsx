
import PertanyaanSudahTerbit from "app/pip/components/PertanyaanSudahTerbit";
import SKPemberian from "app/pip/components/SKPemberian";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peringatan",
  description: "Sistem Layanan Administrasi Sekolah SD Negeri 2 Bokat/ SD Pembina Kab. Buol",
};


export default function TerbitPage() {

  return (
    <div className="grid grid-row gap-2">
      <PertanyaanSudahTerbit />
      <SKPemberian />
    </div>
  );
}