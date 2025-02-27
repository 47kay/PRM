import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class ValidationPipe implements PipeTransform<any> {
    private readonly logger;
    transform(value: any, metadata: ArgumentMetadata): Promise<any>;
    private toValidate;
    private formatErrors;
}
