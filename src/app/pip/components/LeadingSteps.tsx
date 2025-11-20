"use client";
import React, { useEffect, useState } from "react";

interface LeadingStepsProps {
  activeStep: number | null;
}

// 🔹 Daftar pesan per step
const stepMessages: Record<number, string[]> = {
  1: [
    "(1/5) mengirim permohonan surat",
    "(2/5) permohonan diterima",
    "(3/5) memeriksa data siswa",
    "(4/5) memeriksa template surat",
    "(5/5) approval data & surat",
    "approval selesai",
  ],
  2: [
    "(1/5) proses pendaftaran agenda",
    "(2/5) pengecekan klasifikasi surat",
    "(3/5) mengirim agenda ke SODD",
    "(4/5) penerbitan otentikasi",
    "(5/5) penerbitan nomor oleh SODD",
    "nomor surat selesai",
  ], 
  3: [
    "(1/5) mengirim permohonan tte",
    "(2/5) permohonan diterima SODD",
    "(3/5) verifikasi permintaan tte",
    "(4/5) penerbitan otentikasi tte",
    "(5/5) penerbitan tte oleh SODD",
    "tandatangan elektronik selesai",
  ], 
  4: [
    "(1/5) mengecek validasi",
    "(2/5) mengirim data localstorage",
    "(3/5) verifikan id pengguna",
    "(4/5) mengambil data pengesahan",
    "(5/5) pengesahan berhasil disimpan",
    "sinkronisasi selesai",
  ],
};

// 🔹 Durasi tiap kalimat per step (ms)
const stepDurations: Record<number, number[]> = {
  1: [500, 200, 800, 300, 200, 500], // total sekitar 8300ms
  2: [300, 200, 1200, 800, 600, 500],
  3: [400, 600, 1300, 1200, 800, 500],
  4: [300, 800, 200, 1000, 300, 600],
};

export default function LeadingSteps({ activeStep }: LeadingStepsProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (activeStep === null) return;

    const messages = stepMessages[activeStep];
    const durations = stepDurations[activeStep];
    if (!messages || !durations) return;

    setMessageIndex(0);

    let current = 0;
    let timeout: NodeJS.Timeout;

    const showNextMessage = () => {
      if (current < messages.length - 1) {
        timeout = setTimeout(() => {
          current += 1;
          setMessageIndex(current);
          showNextMessage();
        }, durations[current]);
      }
    };

    showNextMessage();

    return () => clearTimeout(timeout);
  }, [activeStep]);

  if (activeStep === null) return null;

  const messages = stepMessages[activeStep];
  const currentMessage = messages[messageIndex];

  return (
    <div className="flex items-center w-full">
      <div>
        {currentMessage}
      </div>
    </div>
  );
}
