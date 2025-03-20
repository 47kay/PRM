import { addDays, addMonths, addYears, differenceInYears, format, parse, parseISO, startOfDay, endOfDay, isBefore, isAfter, isValid } from 'date-fns';
import { toZonedTime } from 'date-fns-tz'; // Only import toZonedTime

export class DateUtil {
    /**
     * Convert date to UTC
     */
    static toUTC(date: Date | string, timezone: string = 'UTC'): Date {
        const zonedDate = typeof date === 'string' ? parseISO(date) : date;
        // If the date is in a specific timezone, convert it to UTC by adjusting the offset
        const utcDate = new Date(zonedDate.toLocaleString('en-US', { timeZone: timezone }));
        return new Date(utcDate.toUTCString()); // Ensure UTC output
    }

    /**
     * Convert UTC to timezone
     */
    static toTimezone(date: Date | string, timezone: string): Date {
        const utcDate = typeof date === 'string' ? parseISO(date) : date;
        return toZonedTime(utcDate, timezone); // Still uses toZonedTime
    }

    /**
     * Format date to string
     */
    static format(date: Date | string, formatStr: string = 'yyyy-MM-dd HH:mm:ss', timezone: string = 'UTC'): string {
        const zonedDate = this.toTimezone(date, timezone);
        return format(zonedDate, formatStr);
    }

    /**
     * Parse string to date
     */
    static parse(dateStr: string, formatStr: string = 'yyyy-MM-dd HH:mm:ss', timezone: string = 'UTC'): Date {
        const parsedDate = parse(dateStr, formatStr, new Date());
        return this.toUTC(parsedDate, timezone);
    }

    /**
     * Get start of day
     */
    static startOfDay(date: Date | string, timezone: string = 'UTC'): Date {
        const zonedDate = this.toTimezone(date, timezone);
        return this.toUTC(startOfDay(zonedDate), timezone);
    }

    /**
     * Get end of day
     */
    static endOfDay(date: Date | string, timezone: string = 'UTC'): Date {
        const zonedDate = this.toTimezone(date, timezone);
        return this.toUTC(endOfDay(zonedDate), timezone);
    }

    /**
     * Add days to date
     */
    static addDays(date: Date | string, days: number, timezone: string = 'UTC'): Date {
        const zonedDate = this.toTimezone(date, timezone);
        return this.toUTC(addDays(zonedDate, days), timezone);
    }

    /**
     * Add months to date
     */
    static addMonths(date: Date | string, months: number, timezone: string = 'UTC'): Date {
        const zonedDate = this.toTimezone(date, timezone);
        return this.toUTC(addMonths(zonedDate, months), timezone);
    }

    /**
     * Add years to date
     */
    static addYears(date: Date | string, years: number, timezone: string = 'UTC'): Date {
        const zonedDate = this.toTimezone(date, timezone);
        return this.toUTC(addYears(zonedDate, years), timezone);
    }

    /**
     * Calculate age from date
     */
    static calculateAge(birthDate: Date | string, timezone: string = 'UTC'): number {
        const zonedBirthDate = this.toTimezone(birthDate, timezone);
        const zonedNow = this.toTimezone(new Date(), timezone);
        return differenceInYears(zonedNow, zonedBirthDate);
    }

    /**
     * Check if date is before another date
     */
    static isBefore(date: Date | string, compareDate: Date | string, timezone: string = 'UTC'): boolean {
        const zonedDate = this.toTimezone(date, timezone);
        const zonedCompareDate = this.toTimezone(compareDate, timezone);
        return isBefore(zonedDate, zonedCompareDate);
    }

    /**
     * Check if date is after another date
     */
    static isAfter(date: Date | string, compareDate: Date | string, timezone: string = 'UTC'): boolean {
        const zonedDate = this.toTimezone(date, timezone);
        const zonedCompareDate = this.toTimezone(compareDate, timezone);
        return isAfter(zonedDate, zonedCompareDate);
    }

    /**
     * Check if date is valid
     */
    static isValid(date: Date | string): boolean {
        if (typeof date === 'string') {
            const parsed = parseISO(date);
            return isValid(parsed);
        }
        return isValid(date);
    }

    /**
     * Get date parts
     */
    static getDateParts(date: Date | string, timezone: string = 'UTC') {
        const zonedDate = this.toTimezone(date, timezone);
        return {
            year: format(zonedDate, 'yyyy'),
            month: format(zonedDate, 'MM'),
            day: format(zonedDate, 'dd'),
            hour: format(zonedDate, 'HH'),
            minute: format(zonedDate, 'mm'),
            second: format(zonedDate, 'ss'),
            weekday: format(zonedDate, 'EEEE'),
        };
    }

    /**
     * Get formatted duration between two dates
     */
    static formatDuration(startDate: Date | string, endDate: Date | string): string {
        const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
        const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
        const diffMs = Math.abs(end.getTime() - start.getTime());
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);

        return parts.join(' ') || '0m';
    }
}