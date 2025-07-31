
export interface AzureStorageConfig {
  accountName: string;
  containerName: string;
  sasToken: string;
}

export interface UploadResult {
  url: string;
  blobName: string;
  success: boolean;
  error?: string;
}

export class AzureStorageService {
  private config: AzureStorageConfig;

  constructor(config: AzureStorageConfig) {
    this.config = config;
  }

  private generateBlobName(file: File): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    return `uploads/${timestamp}-${randomSuffix}.${extension}`;
  }

  async uploadFile(file: File): Promise<UploadResult> {
    try {
      const blobName = this.generateBlobName(file);
      const url = `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/${blobName}${this.config.sasToken}`;

      const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const publicUrl = `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/${blobName}`;

      return {
        url: publicUrl,
        blobName,
        success: true,
      };
    } catch (error) {
      console.error('Azure Storage upload error:', error);
      return {
        url: '',
        blobName: '',
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async deleteFile(blobName: string): Promise<boolean> {
    try {
      const url = `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/${blobName}${this.config.sasToken}`;

      const response = await fetch(url, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Azure Storage delete error:', error);
      return false;
    }
  }
}

// Singleton instance - will be configured with user's Azure credentials
let azureStorageInstance: AzureStorageService | null = null;

export const getAzureStorage = (): AzureStorageService | null => {
  return azureStorageInstance;
};

export const initializeAzureStorage = (config: AzureStorageConfig): AzureStorageService => {
  azureStorageInstance = new AzureStorageService(config);
  return azureStorageInstance;
};
