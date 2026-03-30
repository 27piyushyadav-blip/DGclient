const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/auth/client';

export interface ExpertRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  statusCode?: number;
}

class ExpertAuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async register(credentials: ExpertRegisterRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/verify?token=${encodeURIComponent(token)}`);
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
  }

  async logout(accessToken: string): Promise<ApiResponse> {
    const url = `${this.baseURL}/logout`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return { message: 'Already logged out' };
      }
      throw new Error(data.message || 'Logout failed');
    }

    return data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/reset-password?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      body: JSON.stringify({ password: newPassword }),
    });
  }

  async googleLogin(): Promise<void> {
    window.location.href = `${this.baseURL}/google?state=client`;
  }
}

export const expertAuthService = new ExpertAuthService();
