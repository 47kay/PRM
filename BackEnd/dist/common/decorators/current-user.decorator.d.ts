import { User } from '../../modules/users/entities/user.entity';
export declare const CurrentUser: (...dataOrPipes: (string | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
export declare const TypedCurrentUser: <T = User>(propertyPath?: keyof T) => ParameterDecorator;
