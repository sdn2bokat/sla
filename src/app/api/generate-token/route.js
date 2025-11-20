// /app/api/generate-token/route.js
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "id required" }), { status: 400 });
    }

    // generate token
    let token;
    for (let i = 0; i < 5; i++) {
      token = Math.random().toString(36).slice(2, 14);
      const { data: exists } = await supabase
        .from("db_agenda_surat")
        .select("id")
        .eq("token_hash", token)
        .limit(1);

      if (!exists?.length) break;
      token = null;
    }

    if (!token) {
      return new Response(JSON.stringify({ error: "Failed generate token" }), { status: 500 });
    }

    // URL verifikasi
    const verifyUrl = `https://silalah.sdn2bokat.sch.id/sodd?t=${token}`;

    // generate QR (base64)
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 6 });

    // convert base64 -> buffer PNG
    const base64 = qrDataUrl.split(",")[1];
    const buffer = Buffer.from(base64, "base64");

    // filename
    const filename = `qr_${id}_${Date.now()}.png`;

    // upload ke storage
    const { error: uploadError } = await supabase.storage
      .from("tte")
      .upload(filename, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      return new Response(JSON.stringify({ error: "Upload QR failed" }), { status: 500 });
    }

    // get public URL
    const { data: publicUrl } = supabase.storage
      .from("tte")
      .getPublicUrl(filename);

    // update DB (token + link)
    const { data, error } = await supabase
      .from("db_agenda_surat")
      .update({
        token_hash: token,
        url_tte: publicUrl.publicUrl
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({
      success: true,
      token,
      verifyUrl,
      qrUrl: publicUrl.publicUrl, // link PNG QR
      data
    }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
