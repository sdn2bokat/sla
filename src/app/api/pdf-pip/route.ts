// /app/api/pdf-pip/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// environment (pastikan terdefinisi)
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE env for service role.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    // parse multipart form-data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rekomId = formData.get("rekomId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!rekomId) {
      return NextResponse.json({ error: "Missing rekomId" }, { status: 400 });
    }

    // buat filename & path
    const filename = file.name || `rekom_${rekomId}_${Date.now()}.pdf`;
    const filePath = `pdf/${filename}`;

    // baca blob jadi ArrayBuffer -> Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // upload ke bucket 'surat-pip' menggunakan service role
    const { error: uploadError } = await supabaseAdmin.storage
      .from("surat-pip")
      .upload(filePath, buffer, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Gagal upload file ke storage", detail: uploadError.message },
        { status: 500 }
      );
    }

    // dapatkan public url (atau signed jika Anda ingin)
    const { data: urlData } = supabaseAdmin.storage
      .from("surat-pip")
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json(
        { error: "Gagal mendapatkan public URL" },
        { status: 500 }
      );
    }

    // update tabel rekom_pip dan db_agenda_surat (kolom url_pdf)
    const updates = { url_pdf: publicUrl };

    const { error: e1 } = await supabaseAdmin
      .from("rekom_pip")
      .update(updates)
      .eq("id", rekomId);

    if (e1) {
      console.warn("Warn: gagal update rekom_pip:", e1);
      // lanjutkan proses meskipun warning
    }

    const { error: e2 } = await supabaseAdmin
      .from("db_agenda_surat")
      .update(updates)
      .eq("id", rekomId);

    if (e2) {
      console.warn("Warn: gagal update db_agenda_surat:", e2);
    }

    return NextResponse.json(
      { ok: true, publicUrl },
      { status: 200 }
    );
  } catch (err) {
    console.error("Server upload-pdf error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
