export declare class DateUtil {
    static toUTC(date: Date | string, timezone?: string): Date;
    static toTimezone(date: Date | string, timezone: string): Date;
    static format(date: Date | string, formatStr?: string, timezone?: string): string;
    static parse(dateStr: string, formatStr?: string, timezone?: string): Date;
    static startOfDay(date: Date | string, timezone?: string): Date;
    static endOfDay(date: Date | string, timezone?: string): Date;
    static addDays(date: Date | string, days: number, timezone?: string): Date;
    static addMonths(date: Date | string, months: number, timezone?: string): Date;
    static addYears(date: Date | string, years: number, timezone?: string): Date;
    static calculateAge(birthDate: Date | string, timezone?: string): number;
    static isBefore(date: Date | string, compareDate: Date | string, timezone?: string): boolean;
    static isAfter(date: Date | string, compareDate: Date | string, timezone?: string): boolean;
    static isValid(date: Date | string): boolean;
    static getDateParts(date: Date | string, timezone?: string): {
        year: string;
        month: string;
        day: string;
        hour: string;
        minute: string;
        second: string;
        weekday: string;
    };
    static formatDuration(startDate: Date | string, endDate: Date | string): string;
}
