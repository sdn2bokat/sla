"use client";
import { useState } from "react";
import AppIcon from "../icons/AppIcon";

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
}

export default function SubmitButton({
  label,
  loadingLabel = "Memproses...",
}: SubmitButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="submit"
      onClick={() => setLoading(true)}
      className="btn flex items-center justify-center gap-2"
      disabled={loading}
    >
      {loading ? (
        <>
          <AppIcon name="line-md:loading-twotone-loop" />
          {loadingLabel}
        </>
      ) : (
        <>
          <AppIcon name="mdi:check-circle-outline" />
          {label}
        </>
      )}
    </button>
  );
}
