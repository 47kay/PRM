import { CreateTicketDto, TicketStatus } from './create-ticket.dto';
declare const UpdateTicketDto_base: import("@nestjs/common").Type<Partial<Omit<CreateTicketDto, "type" | "source">>>;
export declare class UpdateTicketDto extends UpdateTicketDto_base {
    status?: TicketStatus;
    statusNote?: string;
    resolution?: string;
}
export {};
