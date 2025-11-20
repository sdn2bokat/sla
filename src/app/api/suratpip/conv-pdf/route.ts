import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "edge";

type RekomRecord = {
  id?: number | string;
  nisn?: string;
  [key: string]: any;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rekomId = body?.rekomId;

    if (!rekomId) {
      return NextResponse.json({ error: "rekomId wajib dikirim" }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "ENV Supabase belum diatur" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: rekomData } = await supabase
      .from("rekom_pip")
      .select("*")
      .eq("id", rekomId)
      .single();

    if (!rekomData) {
      return NextResponse.json({ error: "Data rekomendasi tidak ditemukan" }, { status: 404 });
    }

    const rekom = rekomData as RekomRecord;

    // -----------------------------
    // AMBIL TEMPLATE
    // -----------------------------
    const { data: tmplFile, error: tmplErr } = await supabase.storage
      .from("surat-pip")
      .download("template/template.html");

    if (tmplErr || !tmplFile) {
      return NextResponse.json({ error: "Template HTML tidak ditemukan" }, { status: 500 });
    }

    const rawHtml = await tmplFile.text();

    // -----------------------------
    // GANTI PLACEHOLDER
    // -----------------------------
    let filledHtml = rawHtml;
    for (const key of Object.keys(rekom)) {
      const value = rekom[key] ?? "";
      filledHtml = filledHtml.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }

    const finalHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @page { size: A4; margin: 18mm; }
    </style>
  </head>
  <body>${filledHtml}</body>
</html>`;

    // -----------------------------
    // PUPPETEER FIX (FINAL)
    // -----------------------------
    let execPath = await chromium.executablePath();

    if (!execPath || execPath.length === 0) {
      execPath = "/usr/bin/chromium-browser"; // Fallback untuk Vercel production
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: execPath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // -----------------------------
    // UPLOAD PDF KE SUPABASE
    // -----------------------------
    const filename = `pdf/${rekom.nisn || "unknown"}-${Date.now()}.pdf`;

    const { error: uploadErr } = await supabase.storage
      .from("surat-pip")
      .upload(filename, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json({ error: "Gagal upload PDF" }, { status: 500 });
    }

    const publicUrl = supabase.storage
      .from("surat-pip")
      .getPublicUrl(filename).data.publicUrl;

    await supabase.from("rekom_pip").update({ url_pdf: publicUrl }).eq("id", rekomId);
    await supabase.from("db_agenda_surat").update({ url_pdf: publicUrl }).eq("id", rekomId);

    return NextResponse.json({
      success: true,
      url_pdf: publicUrl,
      path: filename,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Kesalahan server" },
      { status: 500 }
    );
  }
}