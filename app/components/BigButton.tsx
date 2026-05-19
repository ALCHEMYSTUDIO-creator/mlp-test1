"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type BigButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "soft";
};

const variants = {
  primary: "bg-[#496b4f] text-white",
  secondary: "bg-white text-[#2c251f] border border-[#e4d6c2]",
  soft: "bg-[#edf3e8] text-[#35533a] border border-[#d5e2cf]",
};

export function BigButton({
  children,
  href,
  variant = "primary",
  className = "",
  ...buttonProps
}: BigButtonProps) {
  const disabledClasses = buttonProps.disabled
    ? "cursor-not-allowed opacity-55 active:scale-100"
    : "active:scale-[0.99]";
  const classes = `flex min-h-13 w-full items-center justify-center rounded-xl px-5 py-3.5 text-center text-base font-bold transition ${disabledClasses} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type="button" {...buttonProps}>
      {children}
    </button>
  );
}
