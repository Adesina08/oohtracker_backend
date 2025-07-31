
import { User } from '@/types/api';
import { localDbOperations } from './local-db';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('VITE_JWT_SECRET environment variable is required');
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  isAdmin?: boolean;
  exp: number;
}

// Browser-compatible JWT implementation
class BrowserJWT {
  private static base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private static base64UrlDecode(str: string): string {
    // Add padding if needed
    str += '='.repeat((4 - str.length % 4) % 4);
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  }

  static async sign(payload: any, secret: string): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const headerBase64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadBase64 = this.base64UrlEncode(JSON.stringify(payload));
    
    const data = `${headerBase64}.${payloadBase64}`;
    
    // Create signature using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const signatureBase64 = this.base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
    
    return `${data}.${signatureBase64}`;
  }

  static async verify(token: string, secret: string): Promise<any | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerBase64, payloadBase64, signatureBase64] = parts;
      
      // Verify signature
      const data = `${headerBase64}.${payloadBase64}`;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      // Convert base64url signature to ArrayBuffer
      const signatureStr = this.base64UrlDecode(signatureBase64);
      const signature = new Uint8Array(signatureStr.length);
      for (let i = 0; i < signatureStr.length; i++) {
        signature[i] = signatureStr.charCodeAt(i);
      }

      const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
      if (!isValid) return null;

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(payloadBase64));
      
      // Check expiration
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }
}

export const authUtils = {
  async generateToken(user: User): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      isAdmin: user.email === 'admin@inicio-insights.com', // Admin check
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };
    
    return await BrowserJWT.sign(payload, JWT_SECRET);
  },

  isAdminUser(user: User): boolean {
    return user.email === 'admin@inicio-insights.com';
  },

  async verifyToken(token: string): Promise<AuthTokenPayload | null> {
    return await BrowserJWT.verify(token, JWT_SECRET);
  },

  async hashPassword(password: string): Promise<string> {
    // In a real app, use bcrypt. For demo purposes, we'll use a simple hash
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  },

  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  },

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  removeAuthToken() {
    localStorage.removeItem('authToken');
  },

  async getCurrentUser(): Promise<User | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    const payload = await this.verifyToken(token);
    if (!payload) {
      this.removeAuthToken();
      return null;
    }

    try {
      const user = await localDbOperations.getUserById(payload.userId);
      if (!user) {
        this.removeAuthToken();
        return null;
      }
      return user;
    } catch (error) {
      this.removeAuthToken();
      return null;
    }
  }
};
