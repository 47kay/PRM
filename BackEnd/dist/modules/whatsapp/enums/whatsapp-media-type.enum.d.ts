export declare enum WhatsAppMediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT",
    STICKER = "STICKER",
    CONTACT_CARD = "CONTACT_CARD",
    CONTACT_CARD_MULTI = "CONTACT_CARD_MULTI",
    LOCATION = "LOCATION"
}
export declare const MediaTypeProperties: {
    [key in WhatsAppMediaType]: any;
};
export declare function isAllowedMimeType(mediaType: WhatsAppMediaType, mimeType: string): boolean;
export declare function isWithinSizeLimit(mediaType: WhatsAppMediaType, sizeInBytes: number): boolean;
export declare function validateImageDimensions(mediaType: WhatsAppMediaType, width: number, height: number): boolean;
export declare function validateLocationCoordinates(latitude: number, longitude: number): boolean;
