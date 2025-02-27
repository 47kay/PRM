import { NotificationsService } from '../../notifications/services/notifications.service';
import { EmailService } from '../../../shared/services/email.service';
import { AuditService } from '../../../shared/services/audit.service';
import { User } from '../entities/user.entity';
interface BaseUserEvent {
    user: User;
    performedBy?: string;
    organizationId?: string;
    metadata?: Record<string, any>;
}
interface PasswordChangeEvent extends BaseUserEvent {
    requiresReset?: boolean;
    expiresAt?: Date;
}
interface LoginEvent extends BaseUserEvent {
    ip?: string;
    userAgent?: string;
}
export declare class UserEventListener {
    private readonly notificationsService;
    private readonly emailService;
    private readonly auditService;
    private readonly logger;
    constructor(notificationsService: NotificationsService, emailService: EmailService, auditService: AuditService);
    handleUserCreated(event: BaseUserEvent): Promise<void>;
    handleUserUpdated(event: BaseUserEvent): Promise<void>;
    handlePasswordChanged(event: PasswordChangeEvent): Promise<void>;
    handleStatusChanged(event: BaseUserEvent): Promise<void>;
    handleUserDeleted(event: BaseUserEvent): Promise<void>;
    handleUserLogin(event: LoginEvent): Promise<void>;
}
export {};
