import type { Metadata } from "next";
import { Inter, Poppins, Nunito } from "next/font/google";
import "./globals.css";
import React from "react";

// Import 3 font Google (kombinasi sesuai kebutuhan)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-poppins" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: {
    default: "SiLALah SD Negeri 2 Bokat/ SD Pembina Kab. Buol",
    template: "%s | SiLALah SD Negeri 2 Bokat/ SD Pembina Kab. Buol",
  },
  description: "Sistem Layanan Administrasi Sekolah SD Negeri 2 Bokat/ SD Pembina Kab. Buol.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${poppins.variable} ${nunito.variable}`}>
      <body className="bg-gray-50">
        <main>{children}</main>
      </body>
    </html>
  );
}
