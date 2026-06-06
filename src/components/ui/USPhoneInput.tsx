"use client";

import React from "react";
import Input from "@/components/ui/input/Input";
import { formatUSPhoneForDisplay } from "@/services/utils/phoneNumberUtils";

export interface USPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: boolean;
  hint?: string;
}

/** US phone input with (XXX) XXX-XXXX formatting — aligned with Find Supervisor signup. */
export function USPhoneInput({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "(555) 000-0000",
  className,
  error,
  hint,
}: USPhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(formatUSPhoneForDisplay(e.target.value));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted) {
      e.preventDefault();
      onChange(formatUSPhoneForDisplay(pasted));
    }
  };

  return (
    <Input
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={14}
      className={className}
      error={error}
      hint={hint}
    />
  );
}

export default USPhoneInput;
