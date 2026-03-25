export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  name: string;
}

export interface AuthUser {
  name: string;
  role: string;
}
