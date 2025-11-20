"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "utils/supabase-client";
import { Icon } from "@iconify/react";
import Alert from "components/Alert";

export default function VerifikasiData() {
  const router = useRouter();
  const [alertData, setAlertData] = useState<{
    type: "success" | "error" | null;
    title: string;
    message: string;
  }>({
    type: null,
    title: "",
    message: "",
  });
  const [siswa, setSiswa] = useState<any | null>(null);
  const [pipData, setPipData] = useState<any | null>(null);
  const [nik, setNik] = useState("");
  const [ayah, setAyah] = useState("");
  const [prov, setProv] = useState("");
  const [kab, setKab] = useState("");
  const [kec, setKec] = useState("");
  const [keldes, setKeldes] = useState("");
  const [tglCair, setTglCair] = useState("");
  const [kontak, setKontak] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingText, setLoadingText] = useState("Selesai...");
  const [error, setError] = useState<string | null>(null);

  const [listProv, setListProv] = useState<any[]>([]);
  const [listKab, setListKab] = useState<any[]>([]);
  const [listKec, setListKec] = useState<any[]>([]);
  const [listDesa, setListDesa] = useState<any[]>([]);

  // Ambil data siswa dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("siswaLogin");
    if (!saved) {
      router.push("/pip");
      return;
    }
    setSiswa(JSON.parse(saved));
  }, [router]);

  // Ambil data dari Supabase berdasarkan NISN
  useEffect(() => {
    if (!siswa?.nisn) return;
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from("db_pip")
          .select("*")
          .eq("nisn", siswa.nisn)
          .single();
        if (error) throw error;
        setPipData(data);
        setNik(data.nik || "");
        setAyah(data.ayah || "");
        setProv(data.prov || "");
        setKab(data.kab || "");
        setKec(data.kec || "");
        setKeldes(data.keldes || "");
        setTglCair(data.tgl_cair || "");
        setKontak(data.kontak || "");
      } catch (err) {
        console.error(err);
        setError("Data PIP tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [siswa]);

  // --- API Wilayah (bps-api) ---
  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((r) => r.json())
      .then(setListProv);
  }, []);

  useEffect(() => {
    if (!prov) return;
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${prov}.json`)
      .then((r) => r.json())
      .then(setListKab);
  }, [prov]);

  useEffect(() => {
    if (!kab) return;
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kab}.json`)
      .then((r) => r.json())
      .then(setListKec);
  }, [kab]);

  useEffect(() => {
    if (!kec) return;
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${kec}.json`)
      .then((r) => r.json())
      .then(setListDesa);
  }, [kec]);

  // --- VALIDASI STATUS ---
  const provName = listProv.find((p) => p.id === prov)?.name || "";
  const kabName = listKab.find((k) => k.id === kab)?.name || "";
  const kecName = listKec.find((k) => k.id === kec)?.name || "";
  const desName = listDesa.find((d) => d.id === keldes)?.name || "";
  const statusNIK = nik.slice(-4) === "0000" || !nik ? "Invalid" : "Valid";
  const statusAyah = !ayah ? "Invalid" : "Valid";
  const statusTambahan =
    prov && kab && kec && keldes && tglCair && kontak ? "Valid" : "Invalid";

  const formatRupiah = (num: number | string) =>
    "Rp " + Number(num || 0).toLocaleString("id-ID");

  useEffect(() => {
  if (!saving) return;

  const messages = [
    { text: "Menyimpan data...", duration: 1000 },
    { text: "Memverifikasi data...", duration: 2000 },
    { text: "Membuat permohonan surat...", duration: 3200 },
  ];

  let i = 0;
  let timer: any;

  function runSequence() {
    setLoadingText(messages[i].text);

    timer = setTimeout(() => {
      i = (i + 1) % messages.length;
      runSequence(); 
    }, messages[i].duration);
  }

  runSequence();

  return () => clearTimeout(timer);
}, [saving]);


  async function handleSimpan() {
    if (statusNIK === "Invalid" || statusAyah === "Invalid" || statusTambahan === "Invalid") {
      setAlertData({
        type: "error",
        title: "Kesalahan!",
        message: "Masih ada data yang belum valid. Harap periksa kembali semuan status data sebelum menyimpan!",
      });
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 6000));
    try {
      await supabase
        .from("db_pip")
        .update({
          nik,
          ayah,
          prov: provName,
          kab: kabName,
          kec: kecName,
          keldes: desName,
          tgl_cair: tglCair,
          kontak,
        })
        .eq("nisn", siswa.nisn);

      router.push("/pip/rekomendasi/pengesahan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data!");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <main className="container max-w-full bg-green-100 text-green-800 hover:bg-green-200 rounded-lg transition-all p-4 cursor-pointer ml-auto shrink-0">
        <p><strong>Mohon Tunggu!</strong><br/>
        Aplikasi sedang memuat data untuk diverifikasi...</p>
      </main>
    );

  if (error || !pipData)
    return (
      <main className="container max-w-full bg-red-100 text-red-800 hover:bg-red-200 rounded-lg transition-all p-4 cursor-pointer ml-auto shrink-0">
        <p><strong>Kesalahan!</strong><br/>{error || "Data untuk diverifikasi tidak ditemukan atau tidak tersedia..."}</p>
      </main>
    );


  return (
  <main className="container max-w-full overflow-hidden" id="verifikasi">
    <div className="hidden sm:block w-auto mt-[-2px]">
  <nav className="flex" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
      
      {/* Beranda */}
      <li className="inline-flex items-center">
        <a
          href="https://sdn2bokat.sch.id"
          className="inline-flex items-center text-xs font-medium text-primary hover:text-blue-800 dark:text-gray-400 dark:hover:text-white"
        >
          <svg
            className="w-3 h-3 me-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
          </svg>
          Beranda
        </a>
      </li>

      {/* Status */}
      <li>
        <div className="flex items-center">
          <svg
            className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <a
            href="/pip/rekomendasi"
            className="ms-1 text-xs font-medium text-primary hover:text-blue-800 md:ms-2 dark:text-gray-400 dark:hover:text-white"
          >
            Status
          </a>
        </div>
      </li>

      {/* Verifikasi Data */}
      <li aria-current="page">
        <div className="flex items-center">
          <svg
            className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <span className="ms-1 text-xs font-medium text-gray-500 md:ms-2 dark:text-gray-400">
            Verifikasi Data
          </span>
        </div>
      </li>

    </ol>
  </nav>
</div>
      <h1 className="text-[20px] sm:text-[28px] text-textTitle font-roboto font-semibold flex items-center mb-2">
        Verifikasi Data
      </h1>

    {/* ===== DATA SISWA ===== */}
    <section className="mb-2 bg-white rounded-xl border shadow-sm px-6 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon
          icon="fluent:accessibility-checkmark-24-filled"
          className="w-5 h-5 text-gray-800 flex-shrink-0"
        />
        <h2 className="text-lg font-semibold text-gray-800">
          Data Siswa
        </h2>
      </div>

      {/* Tampilan TABEL di layar besar */}
      <div className="hidden md:block">
        <table className="w-full border text-sm">
          <thead className="bg-blue-50 text-shadow-sm">
            <tr>
              <th className="border p-2 w-10">No</th>
              <th className="border p-2">Verifikasi</th>
              <th className="border p-2">Data</th>
              <th className="border p-2 w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Nama Siswa", pipData.nama, "Valid"],
              ["NISN", pipData.nisn, "Valid"],
              [
                "NIK",
                nik,
                nik && nik.length === 16 && !nik.endsWith("0000")
                  ? "Valid"
                  : "Invalid",
              ],
              [
                "Tempat, Tgl. Lahir",
                `${pipData.tempat_lhr}, ${pipData.tgl_lhr}`,
                "Valid",
              ],
              ["Kelas / Semester", `${pipData.kelas} / ${pipData.smst}`, "Valid"],
            ].map(([verif, data, status], i) => (
              <tr key={i}>
                <td className="border p-2 text-center">{i + 1}</td>
                <td className="border p-2">{verif}</td>
                <td className="border p-2">
                  {verif === "NIK" ? (
                    <input
                      type="text"
                      value={nik}
                      onChange={(e) =>
                        setNik(e.target.value.replace(/\D/g, ""))
                      }
                      className={`w-full p-1 focus:ring-1 focus:ring-blue-500 ${
                        nik && nik.length === 16 && !nik.endsWith("0000")
                          ? "bg-white"
                          : "text-red-500"
                      }`}
                      placeholder="Masukkan 16 digit NIK"
                      maxLength={16}
                    />
                  ) : (
                    data
                  )}
                </td>
                <td
                  className={`text-center font-semibold ${
                    status === "Valid" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tampilan CARD di mobile */}
      <div className="md:hidden space-y-2">
        {[
          ["Nama Siswa", pipData.nama, "Valid"],
          ["NISN", pipData.nisn, "Valid"],
          [
            "NIK",
            nik,
            nik && nik.length === 16 && !nik.endsWith("0000")
              ? "Valid"
              : "Invalid",
          ],
          [
            "Tempat, Tgl. Lahir",
            `${pipData.tempat_lhr}, ${pipData.tgl_lhr}`,
            "Valid",
          ],
          ["Kelas / Semester", `${pipData.kelas} / ${pipData.smst}`, "Valid"],
        ].map(([verif, data, status], i) => (
          <div
            key={i}
            className="border rounded-lg p-3 shadow-sm bg-white text-sm"
          >
            <p className="font-semibold mb-1">
              {i + 1}. {verif}
            </p>
            <div className="mb-1">
              {verif === "NIK" ? (
                <input
                  type="text"
                  value={nik}
                  onChange={(e) =>
                    setNik(e.target.value.replace(/\D/g, ""))
                  }
                  className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 ${
                    nik && nik.length === 16 && !nik.endsWith("0000")
                      ? "bg-white border-gray-300"
                      : "bg-white text-red-500 border-gray-300"
                  }`}
                  placeholder="Masukkan 16 digit NIK"
                  maxLength={16}
                />
              ) : (
                <span>{data}</span>
              )}
            </div>
            <p
              className={`font-semibold ${
                status === "Valid" ? "text-green-600" : "text-red-600"
              }`}
            >
              Status: {status}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* ===== DATA PENERIMAAN ===== */}
    <section className="mb-2 bg-white rounded-xl border shadow-sm px-6 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon
          icon="fluent:slide-text-title-checkmark-24-filled"
          className="w-5 h-5 text-gray-800 flex-shrink-0"
        />
        <h2 className="text-lg font-semibold text-gray-800">
          Data Rekening
        </h2>
      </div>

  {/* Tampilan tabel di desktop */}
  <div className="hidden md:block">
    <table className="w-full border text-sm">
      <thead className="bg-green-100 text-shadow-sm">
        <tr>
          <th className="border p-2 w-10">No</th>
          <th className="border p-2">Verifikasi</th>
          <th className="border p-2">Data</th>
          <th className="border p-2 w-24">Status</th>
        </tr>
      </thead>
      <tbody>
        {[
          ["Rekening", pipData.rekening, "Valid"],
          ["Nominal", formatRupiah(pipData.nominal), "Valid"],
          ["Virtual ACC", pipData.acc, "Valid"],
        ].map(([v, d, s], i) => (
          <tr key={i}>
            <td className="border p-2 text-center">{i + 1}</td>
            <td className="border p-2">{v}</td>
            <td className="border p-2">{d}</td>
            <td
              className={`border text-center font-semibold ${
                s === "Valid" ? "text-green-600" : "text-red-600"
              }`}
            >
              {s}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Tampilan card di mobile */}
  <div className="md:hidden space-y-2">
    {[
      ["Rekening", pipData.rekening, "Valid"],
      ["Nominal", formatRupiah(pipData.nominal), "Valid"],
      ["Virtual ACC", pipData.acc, "Valid"],
    ].map(([v, d, s], i) => (
      <div key={i} className="border rounded-lg p-3 shadow-sm bg-white text-sm">
        <p className="font-semibold mb-1">
          {i + 1}. {v}
        </p>
        <p className="mb-1">{d}</p>
        <p
          className={`font-semibold ${
            s === "Valid" ? "text-green-600" : "text-red-600"
          }`}
        >
          Status: {s}
        </p>
      </div>
    ))}
  </div>
</section>

{/* ===== DATA ORANG TUA ===== */}
<section className="mb-2 bg-white rounded-xl border shadow-sm px-6 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon
          icon="fluent:people-checkmark-24-filled"
          className="w-5 h-5 text-gray-800 flex-shrink-0"
        />
        <h2 className="text-lg font-semibold text-gray-800">
          Data Orang Tua
        </h2>
      </div>

  {/* Tabel desktop */}
  <div className="hidden md:block">
    <table className="w-full border text-sm">
      <thead className="bg-yellow-50 text-shadow-sm">
        <tr>
          <th className="border p-2 w-10">No</th>
          <th className="border p-2">Verifikasi</th>
          <th className="border p-2">Data</th>
          <th className="border p-2 w-24">Status</th>
        </tr>
      </thead>
      <tbody>
        {[
          ["Nama Ibu", pipData.ibu, "Valid"],
          [
            "Nama Ayah",
            <input
              key="ayah"
              type="text"
              value={ayah}
              onChange={(e) => setAyah(e.target.value)}
              className="w-full p-1 focus:ring-1 focus:ring-blue-500"
              placeholder="Masukkan nama ayah"
            />,
            statusAyah,
          ],
        ].map(([v, d, s], i) => (
          <tr key={i}>
            <td className="border p-2 text-center">{i + 1}</td>
            <td className="border p-2">{v}</td>
            <td className="border p-2">{d}</td>
            <td
              className={`border text-center font-semibold ${
                s === "Valid" ? "text-green-600" : "text-red-600"
              }`}
            >
              {s}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Card mobile */}
  <div className="md:hidden space-y-2">
    {[
      ["Nama Ibu", pipData.ibu, "Valid"],
      [
        "Nama Ayah",
        <input
          key="ayah-mobile"
          type="text"
          value={ayah}
          onChange={(e) => setAyah(e.target.value)}
          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
          placeholder="Masukkan nama ayah"
        />,
        statusAyah,
      ],
    ].map(([v, d, s], i) => (
      <div key={i} className="border rounded-lg p-3 shadow-sm bg-white text-sm">
        <p className="font-semibold mb-1">
          {i + 1}. {v}
        </p>
        <div className="mb-1">{d}</div>
        <p
          className={`font-semibold ${
            s === "Valid" ? "text-green-600" : "text-red-600"
          }`}
        >
          Status: {s}
        </p>
      </div>
    ))}
  </div>
</section>

      {/* ===== DATA TAMBAHAN ===== */}
      <section className="mb-2 bg-white rounded-xl border shadow-sm px-6 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon
          icon="fluent:calligraphy-pen-checkmark-20-filled"
          className="w-5 h-5 text-gray-800 flex-shrink-0"
        />
        <h2 className="text-lg font-semibold text-gray-800">
          Data Pemohon:{" "}
          <span
            className={`font-bold ${
              statusTambahan === "Valid" ? "text-green-600" : "text-red-600"
            }`}
          >
            {statusTambahan}
          </span>
        </h2>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

  {/* PROVINSI */}
  <div className="relative">
    <select
      className="w-full border rounded-lg p-2 pr-10 cursor-pointer appearance-none"
      value={prov}
      onChange={(e) => setProv(e.target.value)}
    >
      <option value="">Pilih Provinsi</option>
      {listProv.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>

    {/* Ikon Arrow */}
    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </div>

  {/* KABUPATEN */}
  <div className="relative">
    <select
      className="w-full border rounded-lg p-2 pr-10 cursor-pointer appearance-none"
      value={kab}
      onChange={(e) => setKab(e.target.value)}
    >
      <option value="">Pilih Kabupaten</option>
      {listKab.map((k) => (
        <option key={k.id} value={k.id}>
          {k.name}
        </option>
      ))}
    </select>

    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </div>

  {/* KECAMATAN */}
  <div className="relative">
    <select
      className="w-full border rounded-lg p-2 pr-10 cursor-pointer appearance-none"
      value={kec}
      onChange={(e) => setKec(e.target.value)}
    >
      <option value="">Pilih Kecamatan</option>
      {listKec.map((k) => (
        <option key={k.id} value={k.id}>
          {k.name}
        </option>
      ))}
    </select>

    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </div>

  {/* DESA / KELURAHAN */}
  <div className="relative">
    <select
      className="w-full border rounded-lg p-2 pr-10 cursor-pointer appearance-none"
      value={keldes}
      onChange={(e) => setKeldes(e.target.value)}
    >
      <option value="">Pilih Desa/Kelurahan</option>
      {listDesa.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </select>

    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </div>

          <div className="flex items-center gap-4">
            <label className="w-56 sm:w-[380px] pl-2 sm:font-medium">
            Rencana Tgl. Pencairan
          </label>
          <input
            type="date"
            className="w-full border rounded-lg p-2"
            value={tglCair}
            onChange={(e) => setTglCair(e.target.value)}
            placeholder="Tanggal Pencairan"
          />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-56 sm:w-[260px] pl-2 sm:font-medium">
            No. Kontak Pemohon
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            placeholder="Cnth: 081234567890"
            value={kontak}
            onChange={(e) => setKontak(e.target.value)}
          />
        </div>
        </div>
      </section>

      <div className="fixed top-16 sm:top-[67px] sm:w-96 sm:right-0 z-50 px-4 leading-tight">
                {alertData.type && (
              <Alert
                type={alertData.type}
                title={alertData.title}
                message={alertData.message}
                onClose={() => setAlertData({ type: null, title: "", message: "" })}
                duration={4000}
              />
            )}
              </div>
      {/* Tombol Simpan */}
      <div className="flex justify-center">
        <button
          onClick={handleSimpan}
          disabled={saving}
          className={`mt-2 w-full sm:w-96 rounded-full py-2 font-medium text-white transition flex items-center justify-center gap-2
                      ${saving 
                        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" 
                        : "bg-blue-600 hover:bg-blue-700"
                      }
                     `}
          >
          {saving && (
                        <svg
                             className="animate-spin h-5 w-5 text-white"
                             xmlns="http://www.w3.org/2000/svg"
                             fill="none"
                             viewBox="0 0 24 24"
                        >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                        </svg>
                      )}
          {saving ? loadingText : "Simpan dan Verifikasi"}
        </button>
      </div>
    </main>
  );
}
