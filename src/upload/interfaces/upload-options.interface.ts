export interface ImageUploadOptions {
  type: 'avatar' | 'banner';
  entityId: string;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  quality?: number;
}

export interface AttachmentMetadata {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface ProcessedImage {
  url: string;
  filename: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}
