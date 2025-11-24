import { NextResponse } from "next/server";
import CloudConvert from "cloudconvert";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// -------- SUPABASE CLIENT (Service Role) -------------
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ---------------- CLOUDCONVERT CLIENT -----------------
const cloudconvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY!);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id wajib dikirim" }, { status: 400 });
    }

    // 1. AMBIL DATA TABEL
    const { data: rekom, error: errRekom } = await supabase
      .from("rekom_pip")
      .select("*")
      .eq("id", id)
      .single();

    if (errRekom || !rekom) {
      return NextResponse.json(
        { error: "Data rekom_pip tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. AMBIL TEMPLATE HTML
    const { data: fileTemplate } = await supabase.storage
      .from("surat-pip")
      .download("template/template.html");

    if (!fileTemplate) {
      return NextResponse.json(
        { error: "Template HTML tidak ditemukan" },
        { status: 500 }
      );
    }

    let template = await fileTemplate.text();

    // 3. REPLACE PLACEHOLDER
    const replaced = template
      .replace(/{{tgl_surat}}/g, rekom.tgl_surat || "")
      .replace(/{{no_surat}}/g, rekom.no_surat || "")
      .replace(/{{tahap}}/g, rekom.tahap || "")
      .replace(/{{ta}}/g, rekom.ta || "")
      .replace(/{{no_sk}}/g, rekom.no_sk || "")
      .replace(/{{tgl_sk}}/g, rekom.tgl_sk || "")
      .replace(/{{nama}}/g, rekom.nama || "")
      .replace(/{{nisn}}/g, rekom.nisn || "")
      .replace(/{{nik}}/g, rekom.nik || "")
      .replace(/{{tempat_lhr}}/g, rekom.tempat_lhr || "")
      .replace(/{{tgl_lhr}}/g, rekom.tgl_lhr || "")
      .replace(/{{kelas}}/g, rekom.kelas || "")
      .replace(/{{smst}}/g, rekom.smst || "")
      .replace(/{{ibu}}/g, rekom.ibu || "")
      .replace(/{{ayah}}/g, rekom.ayah || "")
      .replace(/{{keldes}}/g, rekom.keldes || "")
      .replace(/{{kec}}/g, rekom.kec || "")
      .replace(/{{kabkot}}/g, rekom.kabkot || "")
      .replace(/{{prov}}/g, rekom.prov || "")
      .replace(/{{rekening}}/g, rekom.rekening || "")
      .replace(/{{nominal}}/g, rekom.nominal || "")
      .replace(/{{terbilang}}/g, rekom.terbilang || "")
      .replace(/{{acc}}/g, rekom.acc || "")
      .replace(/{{url_tte}}/g, rekom.url_tte || "");

    // 4. KONVERSI CLOUDCONVERT (PERBAIKAN FINAL)
    const job = await cloudconvert.jobs.create({
      tasks: {
        "import-html": {
          operation: "import/raw",
          file: replaced,
          filename: "surat.html",
        },
        convert: {
  operation: "convert",
  input: "import-html",
  output_format: "pdf",
  pdf: {
    paper_size: "a4",
    orientation: "portrait",
    margin_top: "12mm",
    margin_bottom: "12mm",
    margin_left: "23mm",
    margin_right: "20mm",
    scale: 1,
  },
},
        export: {
          operation: "export/url",
          input: "convert",
        },
      },
    });

    // 🔥 WAJIB: TUNGGU SAMPAI JOB SELESAI 🔥
    const completedJob = await cloudconvert.jobs.wait(job.id);

    // AMBIL TASK EXPORT DARI JOB YANG SUDAH SELESAI
    const exportTask = completedJob.tasks.find(
      (t: any) => t.name === "export"
    );

    if (!exportTask?.result?.files?.length) {
      return NextResponse.json(
        { error: "Gagal mengambil file PDF dari CloudConvert" },
        { status: 500 }
      );
    }

    const fileUrl = exportTask.result.files[0].url;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "URL file CloudConvert tidak ditemukan" },
        { status: 500 }
      );
    }

    // 5. DOWNLOAD PDF
    const pdfRes = await fetch(fileUrl);
    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    // 6. UPLOAD PDF KE STORAGE
    const filePath = `pdf/rekom-${id}.pdf`;

    const { error: uploadErr } = await supabase.storage
      .from("surat-pip")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json(
        { error: "Gagal upload PDF ke storage" },
        { status: 500 }
      );
    }

    const { data: publicURL } = supabase.storage
      .from("surat-pip")
      .getPublicUrl(filePath);

    // 7. UPDATE TABEL UTAMA
    await supabase
      .from("rekom_pip")
      .update({ url_pdf: publicURL.publicUrl })
      .eq("id", id);

    // 8. UPDATE TABEL AGENDA SURAT
    await supabase
      .from("db_agenda_surat")
      .update({ url_pdf: publicURL.publicUrl })
      .eq("id", id);

    // 9. SUKSES
    return NextResponse.json({
      success: true,
      message: "PDF berhasil dibuat",
      url_pdf: publicURL.publicUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
