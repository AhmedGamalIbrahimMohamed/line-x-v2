export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
  lastLogin: string | null;
}

/** The refresh token is an httpOnly cookie and never appears in the response body. */
export interface AuthSession {
  user: AdminUser;
  accessToken: string;
  expiresIn: string;
}
