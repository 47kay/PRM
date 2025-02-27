// src/common/pipes/validation.pipe.ts

import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
    Type,
    Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

interface ValidationError {
    property: string;
    constraints?: { [type: string]: string };
    children?: ValidationError[];
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    private readonly logger = new Logger(ValidationPipe.name);

    async transform(value: any, metadata: ArgumentMetadata) {
        const { metatype } = metadata;

        // If no validation type is specified or the value is null, return as is
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        // Convert plain object to class instance
        const object = plainToClass(metatype, value);

        // Validate the object
        const errors = await validate(object, {
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
            validationError: {
                target: false,
                value: false,
            },
        });

        if (errors.length > 0) {
            const formattedErrors = this.formatErrors(errors);
            this.logger.warn(`Validation failed: ${JSON.stringify(formattedErrors)}`);
            throw new BadRequestException({
                message: 'Validation failed',
                errors: formattedErrors,
            });
        }

        return object;
    }

    private toValidate(metatype: Type<any>): boolean {
        const types: Type<any>[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }

    private formatErrors(errors: ValidationError[]): Record<string, any> {
        return errors.reduce((acc, error) => {
            // Handle nested validation errors
            if (error.children && error.children.length > 0) {
                acc[error.property] = this.formatErrors(error.children);
            }
            // Handle direct validation errors
            else if (error.constraints) {
                acc[error.property] = Object.values(error.constraints)[0];
            }
            return acc;
        }, {} as Record<string, any>);
    }
}

// Example usage with custom validation decorators:
/*
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// Custom IsPasswordStrong decorator
export function IsPasswordStrong(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isPasswordStrong',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const password = value as string;
                    const hasUpperCase = /[A-Z]/.test(password);
                    const hasLowerCase = /[a-z]/.test(password);
                    const hasNumbers = /\d/.test(password);
                    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                    return (
                        password.length >= 8 &&
                        hasUpperCase &&
                        hasLowerCase &&
                        hasNumbers &&
                        hasSpecialChars
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters';
                },
            },
        });
    };
}

// Custom IsNotFutureDate decorator
export function IsNotFutureDate(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isNotFutureDate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const date = new Date(value);
                    return date <= new Date();
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} cannot be a future date`;
                },
            },
        });
    };
}

// Example DTO with custom validation:
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    firstName: string;

    @IsString()
    @MinLength(2)
    lastName: string;

    @IsEmail()
    email: string;

    @IsPasswordStrong()
    password: string;

    @IsNotFutureDate()
    dateOfBirth: Date;
}

// Usage in controller:
@Post()
async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
}
*/

// Example global validation pipe setup in main.ts:
/*
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            validationError: {
                target: false,
                value: false,
            },
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    await app.listen(3000);
}
*/