import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Message } from '../entities/message.entity';


@Injectable()
export class MessageRepository {
    constructor(
        @InjectRepository(Message)
        private readonly repository: Repository<Message>,
    ) {}
    
    async findById(id: string, organizationId: string): Promise<Message | null> {
        return this.repository.findOne({
            where: { id, organizationId },
            relations: ['contact', 'sender', 'attachments'],
        });
    }
    
    async create(data: any): Promise<Message> {
        // Create a single entity, bypassing type checking with `any`
        const entity = this.repository.create(data as any);
        
        // Save the entity and properly handle the result
        const result = await this.repository.save(entity);
        
        // Ensure we return a single entity
        if (Array.isArray(result)) {
            if (result.length === 0) {
                throw new Error('Failed to create entity');
            }
            return result[0];
        }
        
        return result;
    }


    



    
    
    // Other repository methods
}