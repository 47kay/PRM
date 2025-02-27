// src/utils/crypto.util.ts

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-min-32-chars';
const IV_LENGTH = 16;
const SALT_ROUNDS = 12;

export class CryptoUtil {
    /**
     * Hash a password using bcrypt
     */
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Compare a password with its hash
     */
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Encrypt sensitive data
     */
    static encrypt(text: string): string {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            Buffer.from(ENCRYPTION_KEY),
            iv
        );
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    /**
     * Decrypt encrypted data
     */
    static decrypt(text: string): string {
        const [ivHex, encryptedHex] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(ENCRYPTION_KEY),
            iv
        );
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    /**
     * Generate a random token
     */
    static async generateToken(length: number = 32): Promise<string> {
        const bytes = await randomBytes(length);
        return bytes.toString('hex');
    }

    /**
     * Generate a secure random string
     */
    static async generateRandomString(length: number = 16): Promise<string> {
        const bytes = await randomBytes(Math.ceil(length / 2));
        return bytes.toString('hex').slice(0, length);
    }

    /**
     * Hash sensitive data for storage (one-way)
     */
    static async hashData(data: string): Promise<string> {
        return bcrypt.hash(data, SALT_ROUNDS);
    }

    /**
     * Generate a time-based token that expires
     */
    static generateTimedToken(data: string, expiryMinutes: number = 60): string {
        const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
        const payload = `${data}:${expiryTime}`;
        return this.encrypt(payload);
    }

    /**
     * Verify a time-based token
     */
    static verifyTimedToken(token: string): { isValid: boolean; data?: string } {
        try {
            const decrypted = this.decrypt(token);
            const [data, expiryTime] = decrypted.split(':');
            const isValid = parseInt(expiryTime) > Date.now();
            return {
                isValid,
                data: isValid ? data : undefined
            };
        } catch (error) {
            return { isValid: false };
        }
    }

    /**
     * Hash data with SHA-256
     */
    static sha256(data: string): string {
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('hex');
    }

    /**
     * Generate HMAC signature
     */
    static generateHmac(data: string, secret: string): string {
        return crypto
            .createHmac('sha256', secret)
            .update(data)
            .digest('hex');
    }

    /**
     * Verify HMAC signature
     */
    static verifyHmac(data: string, signature: string, secret: string): boolean {
        const expectedSignature = this.generateHmac(data, secret);
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    /**
     * Generate a cryptographically secure random number within a range
     */
    static getRandomNumber(min: number, max: number): number {
        const range = max - min + 1;
        const bytesNeeded = Math.ceil(Math.log2(range) / 8);
        const maxNum = Math.pow(256, bytesNeeded);
        const maxValidNum = maxNum - (maxNum % range);

        let randomNum;
        do {
            randomNum = parseInt(
                crypto.randomBytes(bytesNeeded).toString('hex'),
                16
            );
        } while (randomNum >= maxValidNum);

        return min + (randomNum % range);
    }
}