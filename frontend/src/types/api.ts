// API Types - Clean type definitions for frontend/backend communication

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  passwordHash?: string; // Optional for frontend, required for backend
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
  users?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: string;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message: string;
}

export interface MediaUploadResponse {
  url: string;
  filename: string;
  type: 'photo' | 'audio' | 'video';
}

export interface AIAnalysisResponse {
  product?: string;
  brand?: string;
  category?: string;
  confidence?: number;
  transcription?: string;
  analysis?: any;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreateConsumptionLogRequest {
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
  points: number;
}