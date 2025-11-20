"use client";

import { useEffect, useState } from "react";
import { supabase } from "utils/supabase-client";
import Image from "next/image";

interface PreviewModalProps {
  nisn: string;
  open: boolean;
  onClose: () => void;
}

export default function PreviewModal({ nisn, open, onClose }: PreviewModalProps) {
  const [rowData, setRowData] = useState<any | null>(null);
  const [htmlPreview, setHtmlPreview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !nisn) return;
    document.body.style.overflow = "hidden";
    async function fetchData() {
      setLoading(true);

      try {
        // 1. Ambil data rekomendasi berdasarkan NISN (paling terakhir)
        const { data: row, error } = await supabase
          .from("rekom_pip")
          .select("*")
          .eq("nisn", nisn)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error || !row) {
          console.error("Data tidak ditemukan:", error);
          setLoading(false);
          return;
        }

        setRowData(row);

        // 2. Ambil template HTML
        const rawHtml = await fetch("/api/template-pip").then(r => r.text());

        // 3. Ganti placeholder {{key}} dengan nilai dari row
        let filled = rawHtml;
        Object.keys(row).forEach((key) => {
          const regex = new RegExp(`{{${key}}}`, "g");
          filled = filled.replace(regex, row[key] ?? "");
        });

        // Placeholder opsional
        filled = filled.replace(/{{url_tte}}/g, row.url_tte ?? "#");

        setHtmlPreview(filled);
      } catch (err) {
        console.error("Error fetch:", err);
      }

      setLoading(false);
    }

    fetchData();
  }, [open, nisn]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 sm:p-8">
      <div className="bg-white w-full max-w-[794px] h-[100vh] sm:h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="p-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Pratinjau Konsep Surat</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black text-xl">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="text-center text-gray-500">Memuat Konsep Surat...</p>
          ) : (
            <div className="a4-preview">
            <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
