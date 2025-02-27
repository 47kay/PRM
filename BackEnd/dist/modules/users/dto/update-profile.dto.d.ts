export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    title?: string;
    bio?: string;
    timezone?: string;
    language?: string;
    preferences?: {
        emailNotifications?: boolean;
        pushNotifications?: boolean;
        theme?: 'light' | 'dark' | 'system';
        dateFormat?: string;
        timeFormat?: string;
        [key: string]: any;
    };
    metadata?: Record<string, any>;
}
