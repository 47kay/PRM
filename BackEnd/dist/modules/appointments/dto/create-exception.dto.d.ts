export declare enum ScheduleExceptionType {
    VACATION = "VACATION",
    SICK_LEAVE = "SICK_LEAVE",
    CONFERENCE = "CONFERENCE",
    PERSONAL = "PERSONAL",
    OTHER = "OTHER"
}
export declare class CreateExceptionDto {
    doctorId: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    isFullDay: boolean;
    type: ScheduleExceptionType;
    reason?: string;
}
