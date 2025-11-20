"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";

const menuItems = [
  { number: 1, label: "Cek Penerima", href: "/pip/rekomendasi" },
  { number: 2, label: "Verifikasi Data", href: "/pip/rekomendasi/prosul" },
  { number: 3, label: "Pengesahan", href: "/pip/rekomendasi/pengesahan" },
  { number: 4, label: "Penerbitan Surat", href: "/pip/rekomendasi/terbitkan" },
];

export default function StepbyStep() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow-sm md:flex md:items-center md:justify-between md:p-6">
      <ol className="flex items-center justify-between w-full text-sm font-medium text-center text-gray-500 sm:text-base">
        {menuItems.map((item, index) => {
          const active = pathname === item.href;
          const isLast = index === menuItems.length - 1;

          return (
            <li
              key={item.number}
              className={`flex items-center ${
                active ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {/* Lingkaran nomor */}
              <span
                className={`flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0 ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-400 text-gray-500"
                }`}
              >
                {item.number}
              </span>

              {/* Label dan ikon */}
              <Link href={item.href} className="flex items-center">
                <span className="hidden sm:block">{item.label}</span>
              </Link>

              {/* Panah (kecuali terakhir) */}
              {!isLast && (
                <svg
                  className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 12 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m7 9 4-4-4-4M1 9l4-4-4-4"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
