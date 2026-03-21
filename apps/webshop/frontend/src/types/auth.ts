export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthResponse {
  token: string
  email: string
  role: string
  firstName: string
  lastName: string
}

export interface AuthUser {
  email: string
  role: string
  firstName: string
  lastName: string
}
