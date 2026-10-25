import type { Employee, Review, ReviewCreate, ReviewPeriod } from "./types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"
).replace(/\/$/, "");

type ApiErrorBody = {
  code?: string;
  message?: string;
  detail?: Array<{ msg?: string }>;
};

export class ApiError extends Error {
  code: string | undefined;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  const responseText = await response.text();
  let body: unknown;

  if (responseText) {
    try {
      body = JSON.parse(responseText) as unknown;
    } catch {
      throw new ApiError("The API returned an invalid response.");
    }
  }

  if (!response.ok) {
    const errorBody =
      typeof body === "object" && body !== null
        ? (body as ApiErrorBody)
        : undefined;
    const detailMessage = errorBody?.detail
      ?.map((issue) => issue.msg)
      .filter((message): message is string => Boolean(message))
      .join(" ");
    throw new ApiError(
      errorBody?.message ??
        detailMessage ??
        `The request failed with status ${response.status}.`,
      errorBody?.code,
    );
  }

  return body as T;
}

export function getEmployees(): Promise<Employee[]> {
  return request<Employee[]>("/employees");
}

export function getReviewPeriods(): Promise<ReviewPeriod[]> {
  return request<ReviewPeriod[]>("/review-periods");
}

export function getReviews(
  employeeCode?: string,
  periodId?: string,
): Promise<Review[]> {
  const query = new URLSearchParams();
  if (employeeCode) query.set("employee_id", employeeCode);
  if (periodId) query.set("period_id", periodId);
  const suffix = query.size ? `?${query.toString()}` : "";
  return request<Review[]>(`/reviews${suffix}`);
}

export function getReview(id: number): Promise<Review> {
  return request<Review>(`/reviews/${id}`);
}

export function createReview(payload: ReviewCreate): Promise<Review> {
  return request<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
