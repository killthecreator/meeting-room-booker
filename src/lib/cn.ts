import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with clsx and resolves Tailwind conflicts with tailwind-merge.
 * @example
 * cn("p-2", condition && "p-4") // => "p-4" when condition is true
 * cn("px-2 py-1", "px-4")       // => "py-1 px-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
