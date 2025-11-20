// /app/api/cek-surat/route.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // gunakan nama yang benar
);

export async function POST(req) {
  try {
    const { token_hash } = await req.json();
    if (!token_hash) {
      return new Response(JSON.stringify({ status: false, message: "token required" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("db_agenda_surat")
      .select("id, nomor_surat, perihal, tanggal, penandatangan, token_hash")
      .eq("token_hash", token_hash)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ status: false, message: "Token tidak valid" }), { status: 404 });
    }

    // (opsional) cek revoked/expired jika ada kolom tersendiri

    return new Response(JSON.stringify({ status: true, data }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ status: false, message: "Internal server error" }), { status: 500 });
  }
}
