export declare class CallLog {
    id: number;
    callUuid: string;
    callerNumber: string;
    destinationNumber: string;
    provider: string;
    status: string;
    startTime: Date;
    answerTime: Date;
    endTime: Date;
    duration: number;
    hangupCause: string;
    recordingUrl: string;
    callDirection: string;
    appointmentId: number;
    contactId: number;
    createdAt: Date;
    updatedAt: Date;
}
