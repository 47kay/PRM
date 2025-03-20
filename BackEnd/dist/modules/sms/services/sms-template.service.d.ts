import { Repository } from 'typeorm';
import { SmsTemplate, SmsTemplateType } from '../entities/sms-template.entity';
export declare class SmsTemplateService {
    private readonly smsTemplateRepository;
    private readonly logger;
    constructor(smsTemplateRepository: Repository<SmsTemplate>);
    findAll(organizationId?: string): Promise<SmsTemplate[]>;
    findOne(id: string, organizationId?: string): Promise<SmsTemplate>;
    findByType(type: SmsTemplateType, organizationId: string): Promise<SmsTemplate>;
    create(data: Partial<SmsTemplate>): Promise<SmsTemplate>;
    update(id: string, data: Partial<SmsTemplate>, organizationId?: string): Promise<SmsTemplate>;
    remove(id: string, organizationId?: string): Promise<void>;
    renderTemplate(template: SmsTemplate, variables: Record<string, any>): string;
}
