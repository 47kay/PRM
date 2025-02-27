import { CreateOrganizationDto } from './create-organization.dto';
declare const UpdateOrganizationDto_base: import("@nestjs/common").Type<Partial<Omit<CreateOrganizationDto, "subscriptionPlan">>>;
export declare class UpdateOrganizationDto extends UpdateOrganizationDto_base {
    isActive?: boolean;
    isVerified?: boolean;
}
export {};
