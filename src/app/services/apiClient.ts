type ApiError = {
  status: number;
  message: string;
};

function getApiBase() {
  const envBase = import.meta.env.VITE_API_BASE as string | undefined;
  return envBase || "http://localhost:3001";
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    body?: any;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method || (options.body ? "POST" : "GET"),
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: data?.error || res.statusText,
    };
    throw err;
  }

  return data as T;
}
