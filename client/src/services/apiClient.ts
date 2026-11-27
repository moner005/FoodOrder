const baseURL =
  (
    import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }
  ).env?.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/api";

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

interface ApiError extends Error {
  response?: ApiResponse<unknown>;
}

function getAccessToken(): string | null {
  return typeof localStorage === "undefined"
    ? null
    : localStorage.getItem("accessToken");
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers = new Headers({
    Accept: "application/json",
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseURL}/${url.replace(/^\//, "")}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  const result: ApiResponse<T> = {
    data: data as T,
    status: response.status,
    statusText: response.statusText,
  };

  if (!response.ok) {
    const error = new Error(
      typeof data === "object" && data !== null && "message" in data
        ? String(data.message)
        : `Request failed with status ${response.status}`,
    ) as ApiError;
    error.response = result;
    throw error;
  }

  return result;
}

export const apiClient = {
  get: <T = unknown>(url: string) => request<T>("GET", url),
  post: <T = unknown>(url: string, body?: unknown) =>
    request<T>("POST", url, body),
  put: <T = unknown>(url: string, body?: unknown) =>
    request<T>("PUT", url, body),
  patch: <T = unknown>(url: string, body?: unknown) =>
    request<T>("PATCH", url, body),
  delete: <T = unknown>(url: string, body?: unknown) =>
    request<T>("DELETE", url, body),
};
