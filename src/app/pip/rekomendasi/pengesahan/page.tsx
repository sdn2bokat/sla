
import Pengesahan from "app/pip/components/Pengesahan";
import SKPemberian from "app/pip/components/SKPemberian";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengesahan Surat Rekomendasi PIP",
  description: "Sistem Layanan Administrasi Sekolah SD Negeri 2 Bokat/ SD Pembina Kab. Buol",
};

export default function PengesahanPage() {

  return (
    <div className="grid grid-row gap-2">
      <Pengesahan />
      <SKPemberian />
    </div>
  );
}