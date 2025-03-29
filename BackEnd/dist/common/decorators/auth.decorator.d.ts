import { Role } from '../../modules/users/enums/role.enum';
export declare const AUTH_ROLES_KEY = "roles";
export declare const AUTH_ORG_KEY = "requireOrganization";
export interface AuthOptions {
    roles?: Role[];
    requireOrganization?: boolean;
}
export declare function Auth(options?: AuthOptions): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function Public(): import("@nestjs/common").CustomDecorator<string>;
export declare function RequireOrganization(): import("@nestjs/common").CustomDecorator<string>;
export declare const CurrentUser: (...dataOrPipes: (string | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
export declare const CurrentOrganization: (...dataOrPipes: (string | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
