"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import VersiWebApp from "components/VersiWebApp/VersiWebApp";

const menuItems = [
  { label: "Cek SK Pemberian", href: "/pip/rekomendasi", icon: "material-symbols:person-search-rounded" },
  { label: "Verifikasi Data", href: "/pip/rekomendasi/prosul", icon: "fluent:document-checkmark-16-filled" },
  { label: "Pengesahan Surat", href: "/pip/rekomendasi/pengesahan", icon: "fa6-solid:file-signature" },
  { label: "Penerbitan Surat", href: "/pip/rekomendasi/terbitkan", icon: "mdi:file-pdf-box" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 h-screen w-64 h-full bg-white border-r shadow-sm flex flex-col"
    >
      {/* LOGO */}
      <div className="flex items-center gap-2 px-5 py-3 border-b">
        <img
          src="/images/sililah2bokat.png" // letakkan file di /public/logo.png
          alt="SiLALah"
          className="h-10"
        />
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
        <p className="text-center text-bgDark text-shadow font-bold py-2 bg-header-gradient rounded-t-[18px]">
          📄Surat Rekomendasi PIP</p>
        <hr className="block sm:hidden my-3"/>
        {menuItems.map((item, index) => {
          const active = pathname === item.href;
          return (
            <div
              key={index}
              className={`flex items-center gap-3 px-4 py-2 my-1 rounded-tl-[20px] rounded-br-[20px] font-medium transition-all ${
                active
                  ? "bg-header-gradient text-bgDark text-shadow shadow-sm"
                  : "text-gray-800 hover:bg-blue-50 hover:border-1"
              }`}
            >
              <Icon icon={item.icon} className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* FOOTER (opsional) */}
      <div className="px-4 py-3 border-t">
        <VersiWebApp />
      </div>
    </aside>
  );
}
