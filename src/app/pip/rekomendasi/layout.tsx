"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import StepbyStep from "../components/StepbyStep";

export default function RekomendasiLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  
    useEffect(() => {
      const siswaLogin = localStorage.getItem("siswaLogin");
      if (!siswaLogin) {
        router.push("/pip");
      }
    }, [router]);
  return (
      <div className="min-h-screen flex bg-gray-50">
        {/* BACKDROP MOBILE */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
  
        {/* SIDEBAR */}
        <div
          className={`fixed sm:static z-50 sm:z-auto transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
          `}
        >
          <Sidebar />
        </div>
  
        {/* KONTEN */}
        <div className="flex-1 flex flex-col">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-2 sm:p-6">
            {children}
          </main>
          <div className="block sm:hidden flex-1 mt-8 p-2 sm:px-6">
          <StepbyStep />
          </div>
        </div>
      </div>
    );
  }
