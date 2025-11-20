import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import playwright from "playwright-core";

type RekomRecord = {
  id?: number | string;
  nisn?: string;
  [key: string]: any;
};

export async function POST(req: Request) {
  try {
    // 1. baca body & validasi
    const body = await req.json();
    const rekomId = body?.rekomId;
    if (!rekomId) {
      return NextResponse.json({ error: "rekomId wajib dikirim" }, { status: 400 });
    }

    // 2. cek env vars
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: "ENV Supabase belum diatur. Pastikan NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY tersedia."
      }, { status: 500 });
    }

    // 3. inisialisasi client Supabase (server-side)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 4. ambil record dari tabel rekom_pip
    const { data: rekomData, error: errRekom } = await supabase
      .from("rekom_pip")
      .select("*")
      .eq("id", rekomId)
      .single();

    if (errRekom || !rekomData) {
      return NextResponse.json({ error: "Data rekomendasi tidak ditemukan" }, { status: 404 });
    }

    const rekom: RekomRecord = rekomData as RekomRecord;

    // 5. ambil template HTML dari bucket
    const { data: tmplFile, error: errTmpl } = await supabase.storage
      .from("surat-pip")
      .download("template/template.html");

    if (errTmpl || !tmplFile) {
      console.error("Error download template:", errTmpl);
      return NextResponse.json({ error: "Template HTML tidak ditemukan" }, { status: 500 });
    }

    const rawHtml = await tmplFile.text();

    // 6. ganti placeholder berdasarkan kolom di record
    let filledHtml = String(rawHtml);
    Object.keys(rekom).forEach((k) => {
      const v = rekom[k] == null ? "" : String(rekom[k]);
      const keyEsc = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filledHtml = filledHtml.replace(new RegExp(`{{${keyEsc}}}`, "g"), v);
    });

    // 7. bungkus dengan head + Tailwind CDN
    const finalHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @page { size: A4; margin: 18mm; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
    </style>
  </head>
  <body>${filledHtml}</body>
</html>`;

    // 8. generate PDF dengan playwright-core
    const browser = await playwright.chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "networkidle" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();

    // 9. upload PDF ke Supabase Storage
    const filename = `pdf/${rekom.nisn || "unknown"}-${Date.now()}.pdf`;

    const { error: errUpload } = await supabase.storage
      .from("surat-pip")
      .upload(filename, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (errUpload) {
      console.error("Upload error:", errUpload);
      return NextResponse.json({ error: "Gagal upload PDF ke storage" }, { status: 500 });
    }

    // 10. Ambil URL dari storage
    const publicRes = supabase.storage.from("surat-pip").getPublicUrl(filename);
    const publicUrl = publicRes?.data?.publicUrl ?? null;

    // ===================================================
    // 11. UPDATE url_pdf di tabel rekom_pip
    // ===================================================
    const { error: errUpdateRekom } = await supabase
      .from("rekom_pip")
      .update({ url_pdf: publicUrl })
      .eq("id", rekomId);

    if (errUpdateRekom) {
      console.error("Gagal update rekom_pip:", errUpdateRekom);
    }

    // ===================================================
    // 12. UPDATE url_surat di db_agenda_surat
    //      Anggap terdapat kolom rekom_id → relasi ke rekom_pip.id
    // ===================================================
    const { error: errUpdateAgenda } = await supabase
      .from("db_agenda_surat")
      .update({ url_pdf: publicUrl })
      .eq("id", rekomId);

    if (errUpdateAgenda) {
      console.error("Gagal update db_agenda_surat:", errUpdateAgenda);
    }

    // ===================================================
    // 13. Response final
    // ===================================================
    return NextResponse.json({
      success: true,
      url_pdf: publicUrl,
      path: filename,
    });

  } catch (err: any) {
    console.error("Error generate PDF:", err);
    return NextResponse.json({ error: err?.message ?? "Terjadi kesalahan server" }, { status: 500 });
  }
}
