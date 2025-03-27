import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
export declare class MessageRepository {
    private readonly repository;
    constructor(repository: Repository<Message>);
    findById(id: string, organizationId: string): Promise<Message | null>;
    create(data: any): Promise<Message>;
}
