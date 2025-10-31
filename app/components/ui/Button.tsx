"use client";

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "lg" | "md" | "sm";
  className?: string;
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center min-w-0 font-semibold rounded-base focus:outline-none disabled:opacity-60 transition-transform";
  const sizes =
    size === "lg"
      ? `px-[calc(var(--button-padding-x)*1.4)] py-[calc(var(--button-padding-y)*1.2)] text-base`
      : size === "sm"
        ? `px-[calc(var(--button-padding-x)*0.9)] py-[calc(var(--button-padding-y)*0.9)] text-sm`
        : `px-[var(--button-padding-x)] py-[var(--button-padding-y)] text-base`;

  const variants =
    variant === "ghost"
      ? `bg-[rgba(15,23,42,0.04)] text-muted hover:bg-[rgba(15,23,42,0.06)]`
      : `bg-[var(--primary)] text-white shadow-sm`;

  const motion =
    "transform will-change-transform hover:-translate-y-1 hover:shadow-[var(--shadow-hover)] active:scale-[var(--active-scale)] focus:shadow-[var(--focus-ring)]";

  return (
    <button
      className={`${base} ${sizes} ${variants} ${motion} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
