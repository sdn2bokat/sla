"use client";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  register,
  error,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1 mb-3">
      <label className="font-medium text-sm text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className={`border rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-lightblue ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error && <p className="text-red-500 text-xs">{error.message}</p>}
    </div>
  );
}
