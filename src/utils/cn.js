import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind classes safely
 * handles conflicts correctly (e.g. padding-4 vs padding-8)
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
