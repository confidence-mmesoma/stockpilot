import 'dotenv/config';
import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret || rawSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to a long random string (32+ characters)');
}
const JWT_SECRET: string = rawSecret;

export const COOKIE_NAME = 'stockpilot_token';
const EXPIRES_IN_SECONDS = 8 * 60 * 60; 

const isProduction = process.env.NODE_ENV === 'production';

export const cookieOptions: CookieOptions = {
  httpOnly: true, 
  secure: isProduction, 
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: EXPIRES_IN_SECONDS * 1000,
  path: '/',
};

// The token only carries the user id. Role and active status are checked in the database.
export function signToken(userId: number) {
  return jwt.sign({}, JWT_SECRET, { subject: String(userId), expiresIn: EXPIRES_IN_SECONDS });
}

export function verifyToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === 'string' || !payload.sub) return null;
    const id = Number(payload.sub);
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}