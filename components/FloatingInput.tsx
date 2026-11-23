"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

interface FloatingInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  id: string;
  label: string;
  /** Example/hint text revealed once the label has floated up. */
  hint?: string;
  /** Optional trailing adornment (e.g. a password visibility toggle). */
  endAdornment?: ReactNode;
}

/**
 * Aurora/MUI-style filled input (ADR-011): a pale blue-grey filled field,
 * no border, with the label floating inside the top of the field once the
 * field is focused or filled. The label stays a real <label> bound to the
 * input (DESIGN.md: labels always visible, never placeholder-only) — it is
 * the placeholder=" " + peer pattern that drives the float, and the hint
 * text appears in the label's place only while the label is floated.
 */
export default function FloatingInput({
  id,
  label,
  hint,
  endAdornment,
  className = "",
  ...inputProps
}: FloatingInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        placeholder=" "
        className={`peer min-h-[56px] w-full rounded-lg bg-field px-3 pb-1.5 pt-5 text-base text-primary outline-none transition-shadow hover:bg-field-hover focus:bg-field focus:ring-2 focus:ring-accent disabled:opacity-60 ${endAdornment ? "pr-12" : ""} ${className}`}
        {...inputProps}
      />
      {hint ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-[26px] text-base text-secondary opacity-0 transition-opacity peer-focus:opacity-60 peer-[:not(:placeholder-shown)]:opacity-60"
        >
          {hint}
        </span>
      ) : null}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-secondary transition-all duration-150 peer-focus:top-[13px] peer-focus:text-xs peer-focus:font-medium peer-focus:text-accent-strong peer-[:not(:placeholder-shown)]:top-[13px] peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
      {endAdornment ? (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
          {endAdornment}
        </div>
      ) : null}
    </div>
  );
}
