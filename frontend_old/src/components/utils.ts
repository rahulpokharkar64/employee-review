import { ApiError } from "../api";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "DUPLICATE_REVIEW") {
      return "A review already exists for this employee and period.";
    }
    if (error.code === "REVIEW_PERIOD_CLOSED") {
      return "This review period is closed. Choose an open period.";
    }
    return error.message;
  }
  if (error instanceof TypeError) {
    return "Unable to reach the API. Check that the backend is running at http://localhost:8000.";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please try again.";
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function avatarTone(id: number): string {
  return `avatar-tone-${(id % 5) + 1}`;
}

export function formatMonth(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", { month: "short" })
    .format(date)
    .toUpperCase();
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ratingLabel(value: number): string {
  switch (value) {
    case 5:
      return "Excellent";
    case 4:
      return "Strong";
    case 3:
      return "Meets expectations";
    case 2:
      return "Developing";
    default:
      return "Needs improvement";
  }
}
