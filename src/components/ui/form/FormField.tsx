"use client";

import React from "react";
import Label from "@/components/form/Label";

export interface FormFieldProps {
  label: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label, control, and inline validation message (matches `Input` hint styling). */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-error-500 ml-0.5">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-error-500 dark:text-error-400">{error}</p>
      ) : null}
    </div>
  );
}

export default FormField;
