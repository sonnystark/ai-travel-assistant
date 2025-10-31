"use client";

import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export default function Input({ className = "", ...rest }: InputProps) {
  return (
    <input
      className={`w-full max-w-full border border-gray-200 rounded-md px-[var(--input-padding-x)] py-[var(--input-padding-y)] text-base bg transition-shadow focus:shadow-[var(--focus-ring)] focus:border-[var(--primary-600)] ${className}`}
      {...rest}
    />
  );
}
