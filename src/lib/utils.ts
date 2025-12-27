import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSize(bytes: number, decimals = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let index = 0;
  let value = bytes;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }

  const formatted =
    decimals > 0
      ? parseFloat(value.toFixed(decimals)).toString()
      : Math.round(value).toString();

  return `${formatted} ${units[index]}`;
}

export function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ?? "-";
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function getNameFromPath(path: string): string {
  if (!path) return "";

  const normalized = path.replace(/[/\\]+$/, "");

  const parts = normalized.split(/[/\\]/);
  return parts[parts.length - 1];
}
