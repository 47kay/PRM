export enum WhatsAppMediaType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    DOCUMENT = 'DOCUMENT',
    STICKER = 'STICKER',
    CONTACT_CARD = 'CONTACT_CARD',
    CONTACT_CARD_MULTI = 'CONTACT_CARD_MULTI',
    LOCATION = 'LOCATION'
  }
  
  // Media type properties and constraints
  export const MediaTypeProperties: { [key in WhatsAppMediaType]: any } = {
    [WhatsAppMediaType.IMAGE]: {
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp'
      ],
      maxDimensions: {
        width: 5000,
        height: 5000
      }
    },
    [WhatsAppMediaType.VIDEO]: {
      maxSizeBytes: 16 * 1024 * 1024, // 16MB
      allowedMimeTypes: [
        'video/mp4',
        'video/3gpp'
      ],
      maxDuration: 60 // seconds
    },
    [WhatsAppMediaType.AUDIO]: {
      maxSizeBytes: 16 * 1024 * 1024, // 16MB
      allowedMimeTypes: [
        'audio/aac',
        'audio/mp4',
        'audio/amr',
        'audio/mpeg',
        'audio/ogg'
      ]
    },
    [WhatsAppMediaType.DOCUMENT]: {
      maxSizeBytes: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
      ]
    },
    [WhatsAppMediaType.STICKER]: {
      maxSizeBytes: 100 * 1024, // 100KB
      allowedMimeTypes: [
        'image/webp'
      ],
      dimensions: {
        width: 512,
        height: 512
      }
    },
    [WhatsAppMediaType.LOCATION]: {
      properties: {
        latitude: { min: -90, max: 90 },
        longitude: { min: -180, max: 180 }
      }
    },
    [WhatsAppMediaType.CONTACT_CARD]: undefined,
    [WhatsAppMediaType.CONTACT_CARD_MULTI]: undefined
  };
  
  // Helper function to check if mime type is allowed for media type
  export function isAllowedMimeType(mediaType: WhatsAppMediaType, mimeType: string): boolean {
    const properties = MediaTypeProperties[mediaType];
    if (!properties || !properties.allowedMimeTypes) {
      return false;
    }
    return properties.allowedMimeTypes.includes(mimeType);
  }
  
  // Helper function to check if file size is within limits
  export function isWithinSizeLimit(mediaType: WhatsAppMediaType, sizeInBytes: number): boolean {
    const properties = MediaTypeProperties[mediaType];
    if (!properties || !properties.maxSizeBytes) {
      return false;
    }
    return sizeInBytes <= properties.maxSizeBytes;
  }
  
  // Helper function to validate image dimensions
  export function validateImageDimensions(
    mediaType: WhatsAppMediaType,
    width: number,
    height: number
  ): boolean {
    const properties = MediaTypeProperties[mediaType];
    if (!properties || !properties.maxDimensions) {
      return true;
    }
  
    if (mediaType === WhatsAppMediaType.STICKER) {
      return width === properties.dimensions.width && height === properties.dimensions.height;
    }
  
    return width <= properties.maxDimensions.width && height <= properties.maxDimensions.height;
  }
  
  // Helper function to validate location coordinates
  export function validateLocationCoordinates(latitude: number, longitude: number): boolean {
    const properties = MediaTypeProperties[WhatsAppMediaType.LOCATION].properties;
    return (
      latitude >= properties.latitude.min &&
      latitude <= properties.latitude.max &&
      longitude >= properties.longitude.min &&
      longitude <= properties.longitude.max
    );
  }