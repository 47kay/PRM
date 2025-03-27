import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

@Injectable()
export class ErrorHandlerService {
    notFound(entity: string, id: string): never {
        throw new NotFoundException(`${entity} with ID ${id} not found`);
    }
    
    badRequest(message: string): never {
        throw new BadRequestException(message);
    }
    
    conflict(message: string): never {
        throw new ConflictException(message);
    }
}