import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// Utility to merge class names and resolve Tailwind conflicts.
export function cn(...inputs: any[]) {
  return twMerge(clsx(...inputs));
}

export default cn;
