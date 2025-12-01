export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
  groundingMetadata?: GroundingMetadata;
  image?: string; // For user uploaded images
}

export interface GroundingMetadata {
  groundingChunks: {
    web?: {
      uri: string;
      title: string;
    };
  }[];
}

export type StudyMode = 'chat' | 'homework' | 'creative' | 'editor';

export interface ImageGenConfig {
  aspectRatio: '1:1' | '16:9' | '4:3';
}

export interface HomeworkAnalysisResult {
  text: string;
}