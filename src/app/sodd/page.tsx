import { Suspense } from "react";
import CekSuratPage from "./CekSuratPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Memuat...</div>}>
      <CekSuratPage />
    </Suspense>
  );
}
