
import PenerbitanSurat from "app/pip/components/PenerbitanSurat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penerbitan Surat Rekomendasi PIP",
  description: "Sistem Layanan Administrasi Sekolah SD Negeri 2 Bokat/ SD Pembina Kab. Buol",
};

export default function TerbitPage() {
  
  return (
    <div>
      <PenerbitanSurat />
    </div>
  );
}