import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'admin';
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: 'teacher' | 'admin';
}

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// 비밀번호 확인
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT 토큰 생성
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // 7일 유효
  });
}

// JWT 토큰 검증
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// 쿠키에서 토큰 추출
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['auth-token'] || null;
}