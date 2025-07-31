export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  passwordHash?: string;
  createdAt: string;
  points: number;
}

export interface ConsumptionLog {
  id: string;
  userId: string;
  product: string;
  brand?: string;
  category: string;
  spend?: number;
  companions?: string;
  location?: string;
  notes?: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'audio' | 'video';
  captureMethod: 'manual' | 'ai';
  aiAnalysis?: any;
  createdAt: string;
  points: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: string;
  isActive: boolean;
}

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  }
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc: any, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      acc[camelKey] = toCamelCase(value);
      return acc;
    }, {});
  }
  return obj;
}

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function buildUrl(endpoint: string): string {
  if (!API_BASE) return `/api${endpoint}`;
  let base = API_BASE.replace(/\/$/, '');
  if (base.endsWith('/api')) {
    base = base.slice(0, -4);
  }
  return `${base}/api${endpoint}`;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(buildUrl(endpoint), {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  const data = await res.json();
  return toCamelCase(data) as T;
}

export const localDbOperations = {
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'points'>): Promise<User> {
    return request<User>('/users', { method: 'POST', body: JSON.stringify(userData) });
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return request<User | null>(`/users/email/${encodeURIComponent(email)}`);
  },

  async getUserById(id: string): Promise<User | null> {
    return request<User | null>(`/users/${id}`);
  },

  async updateUserPoints(userId: string, points: number): Promise<User> {
    return request<User>(`/users/${userId}/points`, {
      method: 'PATCH',
      body: JSON.stringify({ points })
    });
  },

  async createConsumptionLog(logData: Omit<ConsumptionLog, 'id' | 'createdAt'>): Promise<ConsumptionLog> {
    return request<ConsumptionLog>('/logs', {
      method: 'POST',
      body: JSON.stringify(logData)
    });
  },

  async getUserConsumptionLogs(userId: string): Promise<ConsumptionLog[]> {
    return request<ConsumptionLog[]>(`/logs/user/${userId}`);
  },

  async getAllConsumptionLogs(): Promise<ConsumptionLog[]> {
    return request<ConsumptionLog[]>('/logs');
  },

  async getConsumptionAnalytics(): Promise<Array<{ category: string; createdAt: string; points: number }>> {
    return request('/analytics/logs');
  },

  async getRewards(): Promise<Reward[]> {
    return request('/rewards');
  },

  async getLeaderboard(): Promise<Array<{ id: string; name: string; points: number }>> {
    return request('/leaderboard');
  }
};
