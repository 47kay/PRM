export enum TicketActivityType {
    // Creation and Deletion
    TICKET_CREATED = 'ticket_created',
    TICKET_DELETED = 'ticket_deleted',
    TICKET_RESTORED = 'ticket_restored',

    // Status Changes
    STATUS_CHANGED = 'status_changed',
    PRIORITY_CHANGED = 'priority_changed',
    CATEGORY_CHANGED = 'category_changed',

    ESCALATION = 'ESCALATION',
    RESPONSE = 'RESPONSE',
    RESOLUTION = 'RESOLUTION',

    // Assignment
    ASSIGNED = 'assigned',
    UNASSIGNED = 'unassigned',
    SELF_ASSIGNED = 'self_assigned',
    TEAM_ASSIGNED = 'team_assigned',

    // Comments and Communication
    COMMENT_ADDED = 'comment_added',
    COMMENT_UPDATED = 'comment_updated',
    COMMENT_DELETED = 'comment_deleted',
    INTERNAL_NOTE_ADDED = 'internal_note_added',
    EMAIL_SENT = 'email_sent',
    EMAIL_RECEIVED = 'email_received',

    // Attachments
    ATTACHMENT_ADDED = 'attachment_added',
    ATTACHMENT_REMOVED = 'attachment_removed',

    // Tags
    TAG_ADDED = 'tag_added',
    TAG_REMOVED = 'tag_removed',

    // Linking and References
    LINKED_TO_TICKET = 'linked_to_ticket',
    UNLINKED_FROM_TICKET = 'unlinked_from_ticket',
    DUPLICATED_FROM = 'duplicated_from',
    MERGED_WITH = 'merged_with',

    // Workflow and Automation
    WORKFLOW_TRIGGERED = 'workflow_triggered',
    AUTOMATION_EXECUTED = 'automation_executed',
    SLA_UPDATED = 'sla_updated',
    SLA_BREACHED = 'sla_breached',
    ESCALATED = 'escalated',

    // Time Tracking
    TIME_LOGGED = 'time_logged',
    TIME_ESTIMATE_UPDATED = 'time_estimate_updated',
    DEADLINE_UPDATED = 'deadline_updated',

    // Collaboration
    SHARED_WITH_USER = 'shared_with_user',
    MENTIONED_USER = 'mentioned_user',
    SUBSCRIPTION_ADDED = 'subscription_added',
    SUBSCRIPTION_REMOVED = 'subscription_removed',

    // Customer Interaction
    CUSTOMER_REPLIED = 'customer_replied',
    CUSTOMER_VIEWED = 'customer_viewed',
    FEEDBACK_SUBMITTED = 'feedback_submitted',
    SATISFACTION_RATED = 'satisfaction_rated',

    // Knowledge Base
    KB_ARTICLE_LINKED = 'kb_article_linked',
    KB_ARTICLE_UNLINKED = 'kb_article_unlinked',
    SOLUTION_ADDED = 'solution_added',
    SOLUTION_APPROVED = 'solution_approved',

    // Access and Visibility
    VISIBILITY_CHANGED = 'visibility_changed',
    PERMISSIONS_UPDATED = 'permissions_updated',
    CONFIDENTIALITY_CHANGED = 'confidentiality_changed',

    // Custom Fields
    CUSTOM_FIELD_UPDATED = 'custom_field_updated',
    CUSTOM_FIELD_ADDED = 'custom_field_added',
    CUSTOM_FIELD_REMOVED = 'custom_field_removed',

    // Integrations
    INTEGRATION_TRIGGERED = 'integration_triggered',
    WEBHOOK_SENT = 'webhook_sent',
    EXTERNAL_REFERENCE_ADDED = 'external_reference_added',
    EXTERNAL_REFERENCE_REMOVED = 'external_reference_removed',

    // System Activities
    SYSTEM_UPDATE = 'system_update',
    MAINTENANCE_NOTE = 'maintenance_note',
    ERROR_LOGGED = 'error_logged',
    WARNING_LOGGED = 'warning_logged',

    // Archive and History
    ARCHIVED = 'archived',
    UNARCHIVED = 'unarchived',
    HISTORY_CLEARED = 'history_cleared',
    EXPORTED = 'exported',

    // Reports and Analytics
    REPORT_GENERATED = 'report_generated',
    METRICS_UPDATED = 'metrics_updated',
    ANALYTICS_EVENT = 'analytics_event',

    // Billing and Costs
    COST_UPDATED = 'cost_updated',
    BILLING_STATUS_CHANGED = 'billing_status_changed',
    EXPENSE_ADDED = 'expense_added',
    EXPENSE_REMOVED = 'expense_removed',

    // Compliance and Audit
    COMPLIANCE_CHECK = 'compliance_check',
    AUDIT_LOG_CREATED = 'audit_log_created',
    SECURITY_REVIEW = 'security_review',
    GDPR_REQUEST = 'gdpr_request'
}