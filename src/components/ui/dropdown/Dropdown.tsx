"use client";
import type React from "react";
import { useEffect, useRef } from "react";
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /**
   * When set, the menu is rendered in a portal and positioned with Floating UI.
   * Use this when the trigger lives inside overflow:auto/hidden so the menu is not clipped.
   */
  referenceElement?: Element | null;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  referenceElement,
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const portaled = Boolean(referenceElement);

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
    elements:
      portaled && referenceElement
        ? { reference: referenceElement }
        : undefined,
  });

  useEffect(() => {
    if (!isOpen) return;

    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if ((event.target as HTMLElement).closest?.(".dropdown-toggle")) return;
      onClose();
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setFloatingRef = (node: HTMLDivElement | null) => {
    dropdownRef.current = node;
    if (portaled) {
      refs.setFloating(node);
    }
  };

  const shellClass =
    "rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark";

  const content = (
    <div
      ref={setFloatingRef}
      className={
        portaled
          ? `${shellClass} z-[200] ${className}`
          : `absolute right-0 z-40 mt-2 ${shellClass} ${className}`
      }
      style={portaled ? floatingStyles : undefined}
    >
      {children}
    </div>
  );

  if (portaled) {
    return <FloatingPortal>{content}</FloatingPortal>;
  }

  return content;
};
