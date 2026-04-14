"use client";
import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  anchorEl?: HTMLElement | null;
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
    >
      {children}
    </div>
  );
};
