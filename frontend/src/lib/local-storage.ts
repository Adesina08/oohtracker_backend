export interface UploadResult {
  url: string;
  filename: string;
  success: boolean;
  error?: string;
}

import { buildUrl } from './local-db';

export class LocalStorageService {
  private uploadEndpoint = buildUrl('/upload');

  async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(this.uploadEndpoint, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }
      const data = await res.json();
      return {
        url: data.url as string,
        filename: data.filename as string,
        success: true,
      };
    } catch (error) {
      console.error('Local upload error:', error);
      return {
        url: '',
        filename: '',
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}

let localStorageInstance: LocalStorageService | null = null;

export const getLocalStorage = (): LocalStorageService => {
  if (!localStorageInstance) {
    localStorageInstance = new LocalStorageService();
  }
  return localStorageInstance;
};
