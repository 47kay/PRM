// src/utils/validation.util.ts

export class ValidationUtil {
    /**
     * Email validation
     */
    static isValidEmail(email: string): boolean {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    }

    /**
     * Phone number validation (international format)
     */
    static isValidPhoneNumber(phone: string): boolean {
        const pattern = /^\+?[1-9]\d{1,14}$/;
        return pattern.test(phone.replace(/[\s-()]/g, ''));
    }

    /**
     * Password strength validation
     */
    static isValidPassword(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Medical license number validation
     */
    static isValidLicenseNumber(license: string): boolean {
        // Format: 2 letters followed by 6 digits
        const pattern = /^[A-Z]{2}\d{6}$/;
        return pattern.test(license);
    }

    /**
     * National ID validation
     */
    static isValidNationalId(id: string): boolean {
        // Format: 9 digits followed by 1 letter or digit
        const pattern = /^\d{9}[A-Z0-9]$/;
        return pattern.test(id);
    }

    /**
     * Insurance policy number validation
     */
    static isValidPolicyNumber(policy: string): boolean {
        // Format: 3 letters followed by 9 digits
        const pattern = /^[A-Z]{3}\d{9}$/;
        return pattern.test(policy);
    }

    /**
     * URL validation
     */
    static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * UUID validation
     */
    static isValidUUID(uuid: string): boolean {
        const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return pattern.test(uuid);
    }

    /**
     * Age validation
     */
    static isValidAge(birthDate: Date, minAge: number = 0, maxAge: number = 150): boolean {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= minAge && age <= maxAge;
    }

    /**
     * Blood type validation
     */
    static isValidBloodType(bloodType: string): boolean {
        const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        return validTypes.includes(bloodType);
    }

    /**
     * Postal code validation
     */
    static isValidPostalCode(code: string, countryCode: string = 'US'): boolean {
        const patterns: { [key: string]: RegExp } = {
            US: /^\d{5}(-\d{4})?$/,
            UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
            CA: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
            // Add more country patterns as needed
        };

        return patterns[countryCode]?.test(code) ?? false;
    }

    /**
     * Credit card validation (Luhn algorithm)
     */
    static isValidCreditCard(number: string): boolean {
        const digits = number.replace(/\D/g, '');
        
        if (digits.length < 13 || digits.length > 19) {
            return false;
        }

        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Currency amount validation
     */
    static isValidCurrencyAmount(amount: string): boolean {
        const pattern = /^\d+(\.\d{1,2})?$/;
        return pattern.test(amount);
    }

    /**
     * Time format validation (24-hour)
     */
    static isValidTime(time: string): boolean {
        const pattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return pattern.test(time);
    }

    /**
     * RGB color validation
     */
    static isValidRGBColor(color: string): boolean {
        const pattern = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
        if (!pattern.test(color)) return false;

        const [_, r, g, b] = color.match(pattern) || [];
        return [r, g, b].every(val => parseInt(val) >= 0 && parseInt(val) <= 255);
    }
}