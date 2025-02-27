export declare class ValidationUtil {
    static isValidEmail(email: string): boolean;
    static isValidPhoneNumber(phone: string): boolean;
    static isValidPassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    static isValidLicenseNumber(license: string): boolean;
    static isValidNationalId(id: string): boolean;
    static isValidPolicyNumber(policy: string): boolean;
    static isValidUrl(url: string): boolean;
    static isValidUUID(uuid: string): boolean;
    static isValidAge(birthDate: Date, minAge?: number, maxAge?: number): boolean;
    static isValidBloodType(bloodType: string): boolean;
    static isValidPostalCode(code: string, countryCode?: string): boolean;
    static isValidCreditCard(number: string): boolean;
    static isValidCurrencyAmount(amount: string): boolean;
    static isValidTime(time: string): boolean;
    static isValidRGBColor(color: string): boolean;
}
