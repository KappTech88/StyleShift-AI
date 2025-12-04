export enum PhotoType {
  HEADSHOT = 'HEADSHOT',
  MID_BODY = 'MID_BODY',
  FULL_BODY = 'FULL_BODY'
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

export interface ImageState {
  original: string | null; // Base64
  current: string | null; // Base64 (could be edited)
  history: string[];
}

export interface SavedLook {
  id: string;
  name: string;
  slotId: string; // 'head', 'top', etc. Matches INVENTORY_SLOTS ids
  imageSrc: string; // The full image state associated with this item
  timestamp: number;
}