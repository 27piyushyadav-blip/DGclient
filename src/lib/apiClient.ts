const ACCESS_TOKEN_KEY = 'client_access_token';
const REFRESH_TOKEN_KEY = 'client_refresh_token';

type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

async function refreshToken() {
  const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!rt) throw new Error("No refresh token");

  const response = await fetch(`http://localhost:3000/auth/client/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${rt}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    throw new Error("Refresh failed");
  }

  const data = await response.json();
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  return data.access_token;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  
  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAt = await refreshToken();
        isRefreshing = false;
        onTokenRefreshed(newAt);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        throw new ApiError("Session expired", 401);
      }
    }

    return new Promise((resolve, reject) => {
      subscribeTokenRefresh(async (newToken: string) => {
        try {
          headers.set("Authorization", `Bearer ${newToken}`);
          const retryResponse = await fetch(endpoint, {
            ...fetchOptions,
            headers,
          });
          resolve(await handleResponse<T>(retryResponse));
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(
      data.message || data.error || "Request failed",
      response.status,
      data
    );
  }

  return data as T;
}
