"use client";

import { useEffect, useState } from "react";
import { supabase } from "utils/supabase-client";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import LeadingSteps from "./LeadingSteps";
import Alert from "components/Alert";

// jika kamu punya previewModal di path itu, dynamic import (SSR false)
let PreviewModal: any = null;
try {
  PreviewModal = dynamic(() => import("./popup/previewModal"), {
    ssr: false,
  });
} catch (e) {
  PreviewModal = null;
}

export default function Pengesahan() {
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

  // state siswa yang sedang diproses (ambil dari localStorage atau param)
  const [siswa, setSiswa] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepState, setStepState] = useState({
    s1: "idle", // idle | loading | done
    s2: "idle",
    s3: "idle",
    s4: "idle",
  });

  const [btnLabel, setBtnLabel] = useState("Kirim Permohonan Surat");
  const [processingStep, setProcessingStep] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // data results from operations
  const [rekomRow, setRekomRow] = useState<any | null>(null);
  const [agendaRow, setAgendaRow] = useState<any | null>(null);

  useEffect(() => {
    // ambil siswa dari localStorage (sama dengan flow verifikasi)
    const raw = localStorage.getItem("siswaLogin");
    if (!raw) {
      // jika tidak ada data, redirect ke daftar
      router.push("/pip");
      return;
    }
    const parsed = JSON.parse(raw);
    setSiswa(parsed);
    setLoading(false);
  }, [router]);

  // util: delay/timeout await
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // util: ubah bulan jadi romawi
  const bulanRomawi = (d = new Date()) => {
    const m = d.getMonth() + 1;
    const map: any = {
      1: "I",
      2: "II",
      3: "III",
      4: "IV",
      5: "V",
      6: "VI",
      7: "VII",
      8: "VIII",
      9: "IX",
      10: "X",
      11: "XI",
      12: "XII",
    };
    return map[m];
  };

  // ----- STEP 1: Approval Data dan Surat -----
async function handleApproval() {
  if (!siswa?.nisn) {
    setAlertData({
        type: "error",
        title: "Kesalahan!",
        message: "Verifikasi data tidak ditemukan. Harap verifikasi kembali.",
      });
    return;
  }

  setProcessingStep(1);
  setStepState((s) => ({ ...s, s1: "loading" }));
  setBtnLabel("Menunggu approval...");

  await wait(2200);

  // 🔹 Helper: Konversi angka ke format ribuan (1.000.000)
    const formatRupiah = (num: number | string) => {
      const n = typeof num === "string" ? parseInt(num) : num;
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // 🔹 Helper: Konversi angka ke huruf terbilang dalam rupiah
    function terbilangRupiah(nominal: number | string): string {
      const angka = typeof nominal === "string" ? parseInt(nominal) : nominal;
      if (isNaN(angka)) return "";
      const satuan = [
        "",
        "Satu",
        "Dua",
        "Tiga",
        "Empat",
        "Lima",
        "Enam",
        "Tujuh",
        "Delapan",
        "Sembilan",
      ];

      function toWords(n: number): string {
        if (n < 10) return satuan[n];
        else if (n < 20) return satuan[n - 10] + " Belas";
        else if (n < 100)
          return (
            satuan[Math.floor(n / 10)] +
            " Puluh " +
            satuan[n % 10]
          ).trim();
        else if (n < 200)
          return "Seratus " + toWords(n - 100);
        else if (n < 1000)
          return (
            satuan[Math.floor(n / 100)] +
            " Ratus " +
            toWords(n % 100)
          ).trim();
        else if (n < 2000)
          return "Seribu " + toWords(n - 1000);
        else if (n < 1000000)
          return (
            toWords(Math.floor(n / 1000)) +
            " Ribu " +
            toWords(n % 1000)
          ).trim();
        else if (n < 1000000000)
          return (
            toWords(Math.floor(n / 1000000)) +
            " Juta " +
            toWords(n % 1000000)
          ).trim();
        else return "";
      }

      return (toWords(angka).trim() + " Rupiah").replace(/\s+/g, " ");
    }

  try {
    // 🔹 Ambil data dari db_pip berdasarkan NISN
    const { data: pipRow, error: e1 } = await supabase
      .from("db_pip")
      .select("*")
      .eq("nisn", siswa.nisn)
      .single();

    if (e1 || !pipRow) throw e1 ?? new Error("Row db_pip tidak ditemukan");

    // 🔹 Format nominal dan buat teks terbilang
    const nominalFormatted = formatRupiah(pipRow.nominal);
    const terbilangText = terbilangRupiah(pipRow.nominal);

    // 🔹 Siapkan data untuk insert
    const insert = {
      nama: pipRow.nama,
      nisn: pipRow.nisn,
      tempat_lhr: pipRow.tempat_lhr,
      tgl_lhr: pipRow.tgl_lhr,
      kelas: pipRow.kelas,
      smst: pipRow.smst,
      rekening: pipRow.rekening,
      nominal: nominalFormatted, // sudah diformat
      terbilang: terbilangText,  // hasil konversi huruf
      acc: pipRow.acc,
      tahap: pipRow.tahap,
      ta: pipRow.tahun,
      no_sk: pipRow.no_sk,
      tgl_sk: pipRow.tgl_sk,
      nik: pipRow.nik,
      ibu: pipRow.ibu,
      ayah: pipRow.ayah,
      keldes: pipRow.keldes,
      kec: pipRow.kec,
      kabkot: pipRow.kab,
      prov: pipRow.prov,
      kontak: pipRow.kontak,
    };

    // 🔹 Cek berdasarkan kolom ACC, bukan ID
    const { data: exist } = await supabase
      .from("rekom_pip")
      .select("acc")
      .eq("acc", pipRow.acc)
      .maybeSingle();

    let rekomInsertResult: any = null;
    if (!exist) {
      // Jika belum ada ACC yang sama → INSERT
      const { data: inserted, error: e2 } = await supabase
        .from("rekom_pip")
        .insert(insert)
        .select()
        .single();
      if (e2) throw e2;
      rekomInsertResult = inserted;
    } else {
      // Jika sudah ada ACC yang sama → UPDATE
      const { data: updated, error: e3 } = await supabase
        .from("rekom_pip")
        .update(insert)
        .eq("acc", pipRow.acc)
        .select()
        .single();
      if (e3) throw e3;
      rekomInsertResult = updated;
    }

    // 🔹 Selesai Step 1
    setStepState((s) => ({ ...s, s1: "done" }));
    setRekomRow(rekomInsertResult);
    setBtnLabel("Daftar Nomor Agenda Surat");
    setProcessingStep(null);
    setAlertData({
        type: "success",
        title: "SUKSES!",
        message: "Data dan Permohonan Surat Digital Berhasil di Approval. Selanjutnya tekan [Daftar Nomor Agenda Surat] untuk Proses Penerbitan Nomor Agenda Surat.",
      });
  } catch (err: any) {
    console.error("Approval error:", err);
    setAlertData({
        type: "error",
        title: "Peringatan!",
        message:
          "Approval Data dan Permohonan Surat di Tolak. Silakan Hubungani Customer Service.",
          });
    setStepState((s) => ({ ...s, s1: "idle" }));
    setBtnLabel("Kirim Permohonan Surat");
  } finally {
    setProcessingStep(null);
  }
}


 // ----- STEP 2: Ajukan Registrasi Surat -----
async function handleRegistrasi() {
  if (!rekomRow) {
    setAlertData({
        type: "error",
        title: "Kesalahan!",
        message: "Silakan lakukan Approval Data dan Surat terlebih dahulu..",
      });
    return;
  }


  setProcessingStep(2);
  setStepState((s) => ({ ...s, s2: "loading" }));
  setBtnLabel("Proses registrasi no...");

  await wait(3300);

  try {
    // Ambil data rekom terkait untuk ambil acc
    const { data: rekomData, error: errRekom } = await supabase
      .from("rekom_pip")
      .select("acc, tahap, ta, nama")
      .eq("id", rekomRow.id)
      .single();

    if (errRekom) throw errRekom;
    if (!rekomData) throw new Error("Data rekom_pip tidak ditemukan.");

    const pencatat = rekomData.acc || "Sistem Layanan Administrasi";

    // Ambil nomor terakhir dari db_agenda_surat
    const { data: lastAgenda } = await supabase
      .from("db_agenda_surat")
      .select("no, no_agenda")
      .order("no", { ascending: false })
      .limit(1)
      .single();

    const nextNo = lastAgenda?.no ? Number(lastAgenda.no) + 1 : 1;
    const nextNoAgenda = lastAgenda?.no_agenda
      ? Number(lastAgenda.no_agenda) + 1
      : 1;

    // Siapkan perihal
    const tahapText = rekomData.tahap ?? "";
    const taText = rekomData.ta ?? "";
    const perihal = `Rekomendasi Permohonan Pencairan Dana Bansos PIP SD Tahap ${tahapText} Tahun Anggaran ${taText}`;

    // Data dasar surat
    const tglSurat = new Date();
    const tglSuratISO = new Date().toISOString().slice(0, 10);
    const berlakuDate = new Date(tglSurat);
    berlakuDate.setMonth(berlakuDate.getMonth() + 3);
    const berlakuISO = berlakuDate.toISOString().slice(0, 10);
    const baseAgenda = {
      id: rekomRow.id,
      no: nextNo,
      tgl_surat_keluar: tglSuratISO,
      berlaku: berlakuISO,
      kls_no_surat: "400.3.5.6",
      no_agenda: nextNoAgenda,
      jenis: "Surat Dinas",
      naskah: "SR",
      instansi: "SDN2BOKAT",
      bln: bulanRomawi(new Date()),
      thn: new Date().getFullYear(),
      perihal,
      isi_singkat:
        `Kepala SD Negeri 2 Bokat/ SD Pembina Kab. Buol dengan ini memberikan rekomendasi pencairan Dana Bansos PIP kepada ${rekomData.nama}`,
      tujuan: rekomData.nama,
      tt_de: "RAHMAN A. MAJID, S.Pd",
      pencatat, // ambil dari kolom acc
    };

    // Buat nomor surat
    const no_surat_val = `${baseAgenda.kls_no_surat}/${baseAgenda.no_agenda}/${baseAgenda.naskah}-${baseAgenda.instansi}/${baseAgenda.bln}/${baseAgenda.thn}`;

    // Gabungkan data insert
    const agendaInsert = { ...baseAgenda, no_surat: no_surat_val };

    // Insert ke tabel db_agenda_surat
    const { data: insertedAgenda, error: e } = await supabase
      .from("db_agenda_surat")
      .insert(agendaInsert)
      .select()
      .single();

    if (e) throw e;

    // Sukses
    setAgendaRow(insertedAgenda);
    setStepState((s) => ({ ...s, s2: "done" }));
    setBtnLabel("Kirim Permohonan Tandatangan");
    setProcessingStep(null);
    setAlertData({
        type: "success",
        title: "SUKSES!",
        message: "Nomor Agenda Surat Berhasil Diterbitkan. Selanjutnya tekan [Kirim Permohonan Tandatangan] untuk Proses Penerbitan Tandatangan Elektronik oleh SODD.",
      });
  } catch (err: any) {
    console.error("Registrasi error:", err);
    setAlertData({
        type: "error",
        title: "Peringatan!",
        message:
    "Pendaftaran Nomor Agenda Surat di Tolak. Silakan Hubungani Customer Service.",
    });
    setStepState((s) => ({ ...s, s2: "idle" }));
    setBtnLabel("Daftar Nomor Agenda Surat");
  }
  finally {
    setProcessingStep(null);
  }
}


  // ----- STEP 3: Ajukan Tanda Tangan Surat (generate token/url via API) -----
  async function handleGenerateTTE() {
    if (!rekomRow || !agendaRow) {
      setAlertData({
        type: "error",
        title: "Kesalahan!",
        message: "Silakan selesaikan langkah sebelumnya terlebih dahulu.",
      });
      return;
    }

    setProcessingStep(3);
    setStepState((s) => ({ ...s, s3: "loading" }));
    setBtnLabel("Memproses El-Signature...");

    await wait(4500);

    try {
      // call API generate-token dengan payload minimal
      const payload = {
        id: rekomRow.id,
        nama: rekomRow.nama,
        nisn: rekomRow.nisn,
        no_surat: rekomRow.no_surat,
      };

      const resp = await fetch("/api/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error("Gagal generate Signature");
      const data = await resp.json();
      // expect { token, url, url_tte } or similar
      const { token, url, url_tte } = data;

      // update db_agenda_surat with token & url_tte
      await supabase
        .from("db_agenda_surat")
        .update({
          token,
          url,
          url_tte,
        })
        .eq("id", agendaRow.id);

      setStepState((s) => ({ ...s, s3: "done" }));
      setBtnLabel("Sinkronisasi Data Pengesahan");
      setProcessingStep(null);
      setAlertData({
        type: "success",
        title: "SUKSES!",
        message: "Tandatangan Electronik berhasil Diterbitkan oleh Sistem Otentikasi Dokumen Digital (SODD). Selanjutnya tekan [Sinkronisasi Data Pengesahan] untuk Proses Sinkronisasi Pengesahan Surat, jika Berhasil Anda akan dialihkan secara Otomatis ke Halaman Penerbitan Surat.",
      });
    } catch (err: any) {
      console.error("TTE error:", err);
      setAlertData({
        type: "error",
        title: "Peringatan!",
        message:
        "Tandatangan Electronik di Tolak. Silakan Hubungani Customer Service.",
    });
      setStepState((s) => ({ ...s, s3: "idle" }));
      setBtnLabel("Kirim Permohonan Tandatangan");
    } finally {
    setProcessingStep(null);
  }
  }

  // ----- STEP 4: Registrasi Pengesahan Surat -----
async function handlePengesahan() {
  if (!rekomRow) {
    setAlertData({
        type: "error",
        title: "Kesalahan!",
        message: "Silakan selesaikan langkah sebelumnya terlebih dahulu.",
      });
    return;
  }


  setProcessingStep(4);
  setStepState((s) => ({ ...s, s4: "loading" }));
  setBtnLabel("Sinkronisasi berjalan...");

  await wait(2900);

  try {
    // Ambil data dari db_agenda_surat berdasar pencatat = acc
    const { data: agendaData, error: errAgenda } = await supabase
      .from("db_agenda_surat")
      .select("no_surat, tgl_surat_keluar, id, url_tte")
      .eq("id", rekomRow.id)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (errAgenda) throw errAgenda;
    if (!agendaData) throw new Error("Data agenda tidak ditemukan untuk akun ini.");

    // Format tanggal surat mis: 05 November 2025
    const tglSuratFormatted = new Date(agendaData.tgl_surat_keluar).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Update tabel rekom_pip berdasar acc = pencatat
    const { error: updateErr } = await supabase
      .from("rekom_pip")
      .update({
        no_surat: agendaData.no_surat,
        url_tte: agendaData.url_tte,
        tgl_surat: tglSuratFormatted,
      })
      .eq("id", agendaData.id);

    if (updateErr) throw updateErr;

    // Sukses
    setStepState((s) => ({ ...s, s4: "done" }));
    setBtnLabel("Pengesahan Selesai");

    // Jeda 0,8 detik lalu redirect
    setTimeout(() => {
      router.push("/pip/rekomendasi/terbitkan");
    }, 700);
  } catch (err: any) {
    console.error("Sinkronisasi error:", err);
    setAlertData({
        type: "error",
        title: "Peringatan!",
        message:
        "Sinkronisasi Pengesahan Surat Gagal. Silakan Hubungani Customer Service.",
  });
    setStepState((s) => ({ ...s, s4: "idle" }));
    setBtnLabel("Sinkronisasi Data Pengesahan");
  } finally {
    setProcessingStep(null);
  }
}

// Tombol utama handler
async function handleMainButton() {
  if (btnLabel === "Kirim Permohonan Surat") return handleApproval();
  if (btnLabel === "Daftar Nomor Agenda Surat") return handleRegistrasi();
  if (btnLabel === "Kirim Permohonan Tandatangan") return handleGenerateTTE();
  if (btnLabel === "Sinkronisasi Data Pengesahan") return handlePengesahan();
  return;
}

// Komponen StepIcon tetap sama
const StepIcon = ({ idx }: { idx: number }) => {
  const key = `s${idx}` as keyof typeof stepState;
  const st = (stepState as any)[key] as string;
  if (st === "loading") {
    return <Icon icon="line-md:loading-twotone-loop" className="w-6 h-6" />;
  }
  if (st === "done") {
    return <Icon icon="game-icons:confirmed" className="w-6 h-6 text-green-600" />;
  }
  const mapIcon: any = {
    1: "mdi:number-1-circle-outline",
    2: "mdi:number-2-circle-outline",
    3: "mdi:number-3-circle-outline",
    4: "mdi:number-4-circle-outline",
  };
  return <Icon icon={mapIcon[idx]} className="w-6 h-6" />;
};

// Komponen warna label
{[1, 2, 3, 4].map((n) => {
  const key = `s${n}` as keyof typeof stepState;
  const st = stepState[key]; // ambil status step

  return (
    <div key={n} className="flex items-center mx-4 gap-3">
      <div>
        <StepIcon idx={n} />
      </div>
      <div>
        <div
          className={`text-sm sm:text-base font-medium transition-colors
            ${st === "done" ? "text-green-600" : "text-[#046ede]"}
          `}
        >
          {n === 1 && "Approval Data dan Surat"}
          {n === 2 && "Penerbitan Nomor Agenda Surat"}
          {n === 3 && "Penerbitan Tandatangan Elektronik"}
          {n === 4 && "Sinkronisasi Pengesahan Surat"}
        </div>
      </div>
    </div>
  );
})}

  return (
    <main className="container max-w-full overflow-hidden" id="pengesahan">
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

      {/* Verifikasi */}
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
            href="/pip/rekomendasi/prosul"
            className="ms-1 text-xs font-medium text-primary hover:text-blue-800 md:ms-2 dark:text-gray-400 dark:hover:text-white"
          >
            Verifikasi
          </a>
        </div>
      </li>

      {/* Pengesahan */}
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
            Pengesahan
          </span>
        </div>
      </li>

    </ol>
  </nav>
</div>

      <h1 className="text-[20px] sm:text-[28px] text-textTitle font-roboto font-semibold flex items-center mb-2">
        Pengesahan Surat
      </h1>
      <div className="rounded-xl bg-white border shadow-sm p-4 md:flex md:items-center md:justify-between gap-6">
        {/* Left: checklist */}
        
        <div className="w-full max-w-full items-center">
          <h2 className="bg-header-gradient shadow-lg rounded-tl-xl rounded-br-xl px-3 py-1 text-lg sm:text-xl text-white text-shadow font-bold flex items-center gap-2 mb-1">
            <Icon icon="svg-spinners:blocks-scale" className="w-5 h-5" />
            Panel Pengesahan Surat</h2>

          {/* Container utama responsif */}
<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6 mt-4">

  {/* Left: Progress list */}
  <div className="xs:flex-2 w-full bg-light border border-blue-100 shadow-sm rounded-tl-[18px] rounded-br-[18px] pb-4 space-y-2">
    <div className="bg-header-gradient rounded-tl-[18px] text-xs sm:text-sm text-white text-shadow px-4 py-1 mb-4 font-tight flex items-center gap-2">
  <span className="font-semibold">TIMELINE:</span>
  {processingStep !== null && <LeadingSteps activeStep={processingStep} />}
</div>

    {[1, 2, 3, 4].map((n) => {
  const key = `s${n}` as keyof typeof stepState;
  const st = stepState[key]; // ambil status step: "idle" | "loading" | "done"

  return (
    <div
      key={n}
      className="flex items-center text-[#046ede] shadow-blue mx-4 gap-3"
    >
      <div>
        <StepIcon idx={n} />
      </div>
      <div>
        <div
          className={`text-shadow-blue text-sm sm:text-base font-medium transition-colors
            ${st === "done" ? "text-green-600 font-semibold text-shadow" : "text-[#046ede]"}
          `}
        >
          {n === 1 && "Approval Data dan Surat"}
          {n === 2 && "Penerbitan Nomor Agenda Surat"}
          {n === 3 && "Penerbitan Tandatangan Elektronik"}
          {n === 4 && "Sinkronisasi Pengesahan Surat"}
        </div>
      </div>
    </div>
  );
})}
  </div>

  {/* Right: Card Preview */}
  <div className="w-full flex flex-col items-center md:items-start gap-6 cursor-pointer" onClick={() => setShowModal(true)}>
    <div
      className="w-full bg-header-gradient shadow-sm border rounded-[18px] flex justify-between items-center overflow-hidden relative pl-6 sm:pl-10 pr-3 pt-2 sm:pt-5"
      style={{ minHeight: 100 }}
    >
      <div className="justify-center pb-1 sm:pb-5">
        <h3 className="text-white text-base sm:text-xl text-shadow font-semibold leading-tight mb-1">
          Pratinjau Konsep Surat
        </h3>
        <p className="text-white text-[10px] sm:text-sm text-shadow font-tight sm:font-medium leading-tight">
          Klik untu melihat pratinjau surat anda
        </p>
      </div>

      <div className="flex-shrink-0">
        <img
          src="/images/pipicon.png"
          alt="konsep"
          className="h-28 md:h-40 object-contain transform transition-transform duration-150 hover:-translate-x-1 hover:scale-105"
        />
      </div>
    </div>
  </div>
</div>
<div className="my-4 space-y-4">
          {alertData.type && (
        <Alert
          type={alertData.type}
          title={alertData.title}
          message={alertData.message}
          onClose={() => setAlertData({ type: null, title: "", message: "" })}
          duration={20000}
        />
      )}
        </div>
          {/* tombol utama */}
          <div className="w-full flex items-center justify-center py-1">
            <button
  onClick={handleMainButton}
  disabled={loading || processingStep !== null}
  className={`text-white font-medium w-full sm:w-96 rounded-full py-2 transition
    ${
      processingStep !== null
        ? "bg-gray-500 cursor-wait opacity-80"
        : btnLabel.includes("Approval") ? "bg-yellow-500 hover:bg-yellow-600" :
          btnLabel.includes("Registrasi") ? "bg-indigo-600 hover:bg-indigo-700" :
          btnLabel.includes("TTD") ? "bg-emerald-600 hover:bg-emerald-700" :
          btnLabel.includes("Sinkronisasi") ? "bg-green-600 hover:bg-green-700" :
          "bg-blue-600 hover:bg-blue-700"
    }`}
>
  {processingStep !== null ? "Memproses..." : btnLabel}
</button>

          </div>
          </div>
        </div>
       <PreviewModal
  nisn={siswa?.nisn}
  open={showModal}
  onClose={() => setShowModal(false)}
/>

      
    </main>
  );
}
