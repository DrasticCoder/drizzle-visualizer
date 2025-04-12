import { toast } from 'sonner';
import lzString from 'lz-string';

export function encodeState<T>(state: T): string {
  try {
    const jsonString = JSON.stringify(state);

    // Use LZ-string for better compression
    const compressed = lzString.compressToEncodedURIComponent(jsonString);

    // Fallback to base64 if LZ-string compression fails
    if (!compressed) {
      return btoa(encodeURIComponent(jsonString));
    }

    return compressed;
  } catch (error) {
    console.error('Error encoding state:', error);
    toast('Error creating share link', {
      description: 'There was a problem generating the share link.',
    });
    return '';
  }
}

export function decodeState<T>(encoded: string): T {
  try {
    // Try LZ-string decompression first
    let jsonString = lzString.decompressFromEncodedURIComponent(encoded);

    // If LZ-string decompression failed, try base64 decoding as fallback
    if (!jsonString) {
      jsonString = decodeURIComponent(atob(encoded));
    }

    const parsedState = JSON.parse(jsonString) as T;
    console.log('Decoded state:', parsedState);
    return parsedState;
  } catch (error) {
    console.error('Error decoding state:', error);
    throw new Error('Failed to decode state');
  }
}
