/**
 * Represents the possible statuses for a domain.
 * Tracks the domain's lifecycle from registration through various states.
 */
export enum DomainStatus {
    /**
     * Domain is newly added but not fully configured
     */
    PENDING = 'pending',

    /**
     * Domain is active and functioning normally
     */
    ACTIVE = 'active',

    /**
     * Domain is suspended due to compliance or policy issues
     */
    SUSPENDED = 'suspended',

    /**
     * Domain has expired but is within grace period
     */
    EXPIRED = 'expired',

    /**
     * Domain has expired and is in redemption period
     */
    REDEMPTION = 'redemption',

    /**
     * Domain pending deletion after redemption period
     */
    PENDING_DELETE = 'pending_delete',

    /**
     * Domain registration is being transferred
     */
    TRANSFER_IN_PROGRESS = 'transfer_in_progress',

    /**
     * Domain transfer has been initiated but needs approval
     */
    TRANSFER_PENDING = 'transfer_pending',

    /**
     * Domain is locked and cannot be modified
     */
    LOCKED = 'locked',

    /**
     * Domain is under legal dispute
     */
    DISPUTED = 'disputed',

    /**
     * Domain configuration is incomplete
     */
    INCOMPLETE = 'incomplete',

    /**
     * Domain is undergoing maintenance
     */
    MAINTENANCE = 'maintenance',

    /**
     * Domain has failed automated checks
     */
    FAILED = 'failed',

    /**
     * Domain requires manual review
     */
    REVIEW_REQUIRED = 'review_required',

    /**
     * Domain is reserved but not yet active
     */
    RESERVED = 'reserved',

    /**
     * Domain registration is processing
     */
    REGISTERING = 'registering',

    /**
     * Domain is blocked from registration
     */
    BLOCKED = 'blocked',

    /**
     * Domain has invalid configuration
     */
    INVALID = 'invalid',

    /**
     * Domain is archived and inactive
     */
    ARCHIVED = 'archived',

    /**
     * Domain deletion is scheduled
     */
    PENDING_REMOVAL = 'pending_removal',

    /**
     * Domain ownership is being verified
     */
    VERIFYING = 'verifying',

    /**
     * Domain has DNS configuration issues
     */
    DNS_INVALID = 'dns_invalid',

    /**
     * Domain requires renewal action
     */
    RENEWAL_REQUIRED = 'renewal_required',

    /**
     * Domain has active security issues
     */
    SECURITY_HOLD = 'security_hold',

    /**
     * Domain registrar update in progress
     */
    REGISTRAR_UPDATE = 'registrar_update',

    /**
     * Domain requires configuration update
     */
    UPDATE_REQUIRED = 'update_required',

    /**
     * Domain grace period after registration
     */
    GRACE_PERIOD = 'grace_period',

    /**
     * Domain is active but has warnings
     */
    WARNING = 'warning',

    /**
     * Domain has been deleted
     */
    DELETED = 'deleted'
}