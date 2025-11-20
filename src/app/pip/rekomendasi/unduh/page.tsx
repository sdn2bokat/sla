"use client";

import dynamic from "next/dynamic";

const UnduhSurat = dynamic(() => import("app/pip/components/UnduhSurat"), {
  ssr: false,
});

export default function UnduhPage() {
  return <UnduhSurat />;
}
