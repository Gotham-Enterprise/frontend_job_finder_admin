"use client";
import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  anchorEl?: HTMLElement | null;
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
  anchorEl,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  // After the portal element is painted, measure it and compute final position.
  useLayoutEffect(() => {
    if (isOpen && anchorEl && dropdownRef.current) {
      const rect = anchorEl.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight + 8 && rect.top > dropdownHeight + 8;
      const newTop = openUpward ? rect.top - dropdownHeight - 8 : rect.bottom + 8;
      const newRight = window.innerWidth - rect.right;
      setCoords((prev) => {
        if (prev && prev.top === newTop && prev.right === newRight) return prev;
        return { top: newTop, right: newRight };
      });
    }
  }, [isOpen, anchorEl]);

  useEffect(() => {
    if (!isOpen) setCoords(null);
  }, [isOpen]);

  useEffect(() => {
    const clickOutSide = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.dropdown-toggle')
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", clickOutSide);
    return () => {
      document.removeEventListener("mousedown", clickOutSide);
    };
  }, [onClose]);

  if (!isOpen) return null;

  if (anchorEl) {
    return createPortal(
      <div
        ref={dropdownRef}
        style={
          coords
            ? { top: coords.top, right: coords.right }
            : { top: -9999, right: -9999 }
        }
        className={`fixed z-[9999] rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
      >
        {children}
      </div>,
      document.body
    );
  }

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-40 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
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
