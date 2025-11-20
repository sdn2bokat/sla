export default function NotFound() {
  return (
    <div className="text-center mt-20 space-y-4">
      <h2 className="text-3xl font-bold text-red-600">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-gray-600">Halaman yang Anda cari tidak tersedia.</p>
      <a href="/" className="btn">Kembali ke Beranda</a>
    </div>
  );
}
