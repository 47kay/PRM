export declare class CryptoUtil {
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static encrypt(text: string): string;
    static decrypt(text: string): string;
    static generateToken(length?: number): Promise<string>;
    static generateRandomString(length?: number): Promise<string>;
    static hashData(data: string): Promise<string>;
    static generateTimedToken(data: string, expiryMinutes?: number): string;
    static verifyTimedToken(token: string): {
        isValid: boolean;
        data?: string;
    };
    static sha256(data: string): string;
    static generateHmac(data: string, secret: string): string;
    static verifyHmac(data: string, signature: string, secret: string): boolean;
    static getRandomNumber(min: number, max: number): number;
}
