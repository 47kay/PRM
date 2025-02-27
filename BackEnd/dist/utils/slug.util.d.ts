export declare function generateSlug(text: string, options?: {
    lowercase?: boolean;
    separator?: string;
    removeStopWords?: boolean;
    maxLength?: number;
}): string;
export declare function generateRandomString(length?: number): string;
export declare function makeSlugUnique(slug: string, existingSlugs: string[]): string;
export declare function isValidSlug(slug: string): boolean;
