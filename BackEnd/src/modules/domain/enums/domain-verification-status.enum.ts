/**
 * Represents the possible verification statuses for a domain.
 * Used to track the state of domain ownership verification.
 */
export enum DomainVerificationStatus {
    /**
     * Verification process has not been initiated
     */
    UNVERIFIED = 'unverified',

    /**
     * Verification process has been initiated but not completed
     */
    PENDING = 'pending',

    /**
     * Verification is in progress (e.g., DNS propagation)
     */
    IN_PROGRESS = 'in_progress',

    /**
     * Domain has been successfully verified
     */
    VERIFIED = 'verified',

    /**
     * Verification attempt failed
     */
    FAILED = 'failed',

    /**
     * Verification has expired and needs to be re-initiated
     */
    EXPIRED = 'expired',

    /**
     * Verification process was cancelled by the user
     */
    CANCELLED = 'cancelled',

    /**
     * Verification is temporarily suspended
     */
    SUSPENDED = 'suspended',

    /**
     * Verification requires action from the user
     */
    ACTION_REQUIRED = 'action_required',

    /**
     * Previous verification has been invalidated
     */
    INVALIDATED = 'invalidated',

    /**
     * Verification is being retried after a failure
     */
    RETRYING = 'retrying',

    /**
     * Domain has changed and requires re-verification
     */
    REQUIRES_REVERIFICATION = 'requires_reverification',

    /**
     * Verification is blocked due to policy or security concerns
     */
    BLOCKED = 'blocked',

    /**
     * Verification record exists but hasn't been checked yet
     */
    UNCHECKED = 'unchecked',

    /**
     * Verification is waiting for external service response
     */
    AWAITING_RESPONSE = 'awaiting_response',

    /**
     * Verification succeeded but with warnings
     */
    VERIFIED_WITH_WARNINGS = 'verified_with_warnings'
}