"use client";
import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";

export default function PdfThumbnail({ url, scale = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const load = async () => {
      const pdf = await pdfjsLib.getDocument(url).promise;
      const page = await pdf.getPage(1);

      // ambil device pixel ratio (biasanya 1.0 – 2.0)
      const dpr = window.devicePixelRatio || 1;

      // render PDF pada scale × pixel ratio agar tajam
      const viewport = page.getViewport({ scale: scale * dpr });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // ukuran canvas asli (besar & tajam)
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      

      

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;
    };

    load();
  }, [url, scale]);

  return (
    <canvas
      ref={canvasRef}
      className="text-center"
      style={{
        width: "100%",
        height: "auto",
      }}
    ></canvas>
  );
}
