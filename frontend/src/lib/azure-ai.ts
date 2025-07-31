import { buildUrl } from './local-db';

export interface AzureAIAnalysis {
  transcription?: string;
  detectedProducts?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence?: number;
  emotions?: string[];
  brands?: string[];
  categories?: string[];
  estimatedSpend?: string;
  location?: string;
}

export interface TextAnalyticsResult {
  transcription: string;
  sentiment: {
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence: number;
    sentences: any[];
  };
  keyPhrases: string[];
  entities: {
    products: Array<{ text: string; confidence: number }>;
    locations: Array<{ text: string; confidence: number }>;
    organizations: Array<{ text: string; confidence: number }>;
    all: Array<{ text: string; category: string; subCategory: string; confidence: number }>;
  };
}

export class AzureAIService {
  constructor() {
    // Browser-compatible AI service for food consumption analysis
  }

  async transcribeAudio(
    audioBlob: Blob,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(buildUrl('/transcribe'), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let msg = 'Transcription failed';
      try {
        const err = await response.json();
        msg = err.message || msg;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(msg);
    }

    const data: { text: string } = await response.json();
    onProgress?.(100);
    return data.text;
  }

  async analyzeConsumption(
    transcription: string,
    mediaType: 'audio' | 'video',
    onProgress?: (progress: number) => void
  ): Promise<AzureAIAnalysis> {
    try {
      // Call the backend text analysis endpoint
      const response = await fetch(buildUrl('/analyze-text'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcription }),
      });

      if (!response.ok) {
        let msg = 'Text analysis failed';
        try {
          const err = await response.json();
          msg = err.message || msg;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(msg);
      }

      const data: TextAnalyticsResult = await response.json();
      onProgress?.(100);

      // Transform the backend response to match the frontend interface
      return {
        transcription: data.transcription,
        detectedProducts: data.entities.products.map(p => p.text),
        sentiment: data.sentiment.sentiment,
        confidence: data.sentiment.confidence,
        emotions: this.mapSentimentToEmotions(data.sentiment.sentiment),
        brands: data.entities.organizations.map(o => o.text),
        categories: data.entities.all
          .filter(e => e.category === 'Product' || e.category === 'CommercialItem')
          .map(e => e.subCategory || e.category),
        estimatedSpend: this.parseEstimatedSpend(transcription),
        location: data.entities.locations.map(l => l.text).join(', ') || 'Unknown'
      };
    } catch (error) {
      console.error('Text analysis failed:', error);
      throw new Error('Failed to analyze text: ' + (error as Error).message);
    }
  }

  private mapSentimentToEmotions(sentiment: string): string[] {
    switch (sentiment) {
      case 'positive':
        return ['happy', 'satisfied', 'pleased'];
      case 'negative':
        return ['disappointed', 'frustrated', 'unsatisfied'];
      case 'mixed':
        return ['mixed', 'complex'];
      case 'neutral':
        return ['neutral', 'indifferent'];
      default:
        return ['neutral'];
    }
  }

  async analyzeImage(imageBlob: Blob): Promise<AzureAIAnalysis> {
    // In a real implementation, use Azure Computer Vision API
    // For now, simulate analysis
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          detectedProducts: ['Coca-Cola', 'French Fries'],
          brands: ['Coca-Cola', 'McDonald\'s'],
          categories: ['Beverages', 'Fast Food'],
          confidence: 0.85,
          estimatedSpend: '$12.50',
          location: 'Restaurant/Fast Food Chain'
        });
      }, 2000);
    });
  }

  private parseEstimatedSpend(text: string): string {
    // Regular expression to match currency amounts ($10, 10.50, etc.)
    const currencyRegex = /\$?\s?\d+(\.\d{1,2})?/g;
    const matches = text.match(currencyRegex) || [];
    
    let total = 0;
    matches.forEach(match => {
      // Remove non-numeric characters except decimal point
      const amount = parseFloat(match.replace(/[^\d.]/g, ''));
      if (!isNaN(amount)) {
        total += amount;
      }
    });
    
    // Format as currency
    return total > 0 ? '$' + total.toFixed(2) : 'Not available';
  }
}

export const azureAI = new AzureAIService();
