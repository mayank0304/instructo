import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
export const JUDGE_API_URL =
  import.meta.env.VITE_JUDGE_API_URL || "http://localhost:8080";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
 