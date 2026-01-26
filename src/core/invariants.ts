/**
 * VAULT-KIT Invariants
 * 
 * Non-negotiable properties that MUST hold.
 * If any invariant can be violated, we do not ship the feature.
 */

import type { Plane, ActorType, Token, Grant, AuditEvent } from './types.js';

// =============================================================================
// INVARIANT DEFINITIONS
// =============================================================================

export const INVARIANTS = {
    // Human Era (INV-01 to INV-08)
    'INV-01': 'Broadcast plane API cannot read PII tables/fields',
    'INV-02': 'Token minted for OPS cannot call VAULT/PII endpoints',
    'INV-03': 'Volunteers cannot list/search vault resources',
    'INV-04': 'Non-family disclosure requires 2-of-3 approvals',
    'INV-05': 'Mode transition revokes all non-family grants + sessions',
    'INV-06': 'No download all — exports only via bounded packs',
    'INV-07': 'Case artifacts auto-expire; deletion emits audit events',
    'INV-08': 'Audit is append-only + tamper-evident',

    // AI Era (INV-AI-01 to INV-AI-07)
    'INV-AI-01': 'AI agents cannot access PII plane directly',
    'INV-AI-02': 'Agent tokens expire after single task',
    'INV-AI-03': 'All AI actions log principal + agent model + intent',
    'INV-AI-04': 'Aggregation queries >N items require approval',
    'INV-AI-05': 'AI-generated content is watermarked',
    'INV-AI-06': 'Biometric auth requires liveness + MFA',
    'INV-AI-07': 'Default AI processing tier is 0 (none)',
} as const;

export type InvariantId = keyof typeof INVARIANTS;

// =============================================================================
// INVARIANT CHECKS
// =============================================================================

/**
 * INV-01: Broadcast plane cannot access PII
 */
export function checkPlaneIsolation(
    requestingPlane: Plane,
    targetPlane: Plane
): { valid: boolean; violation?: string } {
    // Broadcast can only access broadcast
    if (requestingPlane === 'broadcast' && targetPlane !== 'broadcast') {
        return {
            valid: false,
            violation: `INV-01: Broadcast plane cannot access ${targetPlane} plane`,
        };
    }

    // OPS cannot access PII or Vault
    if (requestingPlane === 'ops' && (targetPlane === 'pii' || targetPlane === 'vault')) {
        return {
            valid: false,
            violation: `INV-02: OPS plane cannot access ${targetPlane} plane`,
        };
    }

    return { valid: true };
}

/**
 * INV-02: Token scope enforcement
 */
export function checkTokenScope(
    token: Token,
    requiredPlane: Plane
): { valid: boolean; violation?: string } {
    if (!token.planes.includes(requiredPlane)) {
        return {
            valid: false,
            violation: `INV-02: Token does not have access to ${requiredPlane} plane`,
        };
    }
    return { valid: true };
}

/**
 * INV-04: Approval requirements
 */
export function checkApprovalRequirements(
    grant: Grant,
    accessorType: ActorType
): { valid: boolean; violation?: string } {
    // Family members (owner, trustee) need 1 approval
    if (accessorType === 'owner' || accessorType === 'trustee') {
        if (grant.approvals.length < 1) {
            return {
                valid: false,
                violation: 'INV-04: Family disclosure requires at least 1 approval',
            };
        }
        return { valid: true };
    }

    // Non-family (volunteer, agent) need 2-of-3 approvals
    if (grant.approvals.length < 2) {
        return {
            valid: false,
            violation: 'INV-04: Non-family disclosure requires 2-of-3 approvals',
        };
    }

    return { valid: true };
}

/**
 * INV-AI-01: Agent PII restriction
 */
export function checkAgentPIIAccess(
    actorType: ActorType,
    targetPlane: Plane
): { valid: boolean; violation?: string } {
    if (actorType === 'agent' && targetPlane === 'pii') {
        return {
            valid: false,
            violation: 'INV-AI-01: AI agents cannot access PII plane directly',
        };
    }
    return { valid: true };
}

/**
 * INV-AI-02: Agent token single-use
 */
export function checkAgentTokenUsage(
    token: Token
): { valid: boolean; violation?: string } {
    if (token.actor_type === 'agent') {
        if (token.max_uses !== undefined && token.uses_remaining !== undefined) {
            if (token.uses_remaining <= 0) {
                return {
                    valid: false,
                    violation: 'INV-AI-02: Agent token has been exhausted',
                };
            }
        }
    }
    return { valid: true };
}

/**
 * INV-AI-04: Aggregation limit check
 */
export function checkAggregationLimit(
    resultCount: number,
    limit: number = 10
): { valid: boolean; requiresApproval: boolean; violation?: string } {
    if (resultCount > limit) {
        return {
            valid: false,
            requiresApproval: true,
            violation: `INV-AI-04: Aggregation of ${resultCount} items exceeds limit of ${limit}`,
        };
    }
    return { valid: true, requiresApproval: false };
}

/**
 * INV-08: Verify audit chain integrity
 */
export function verifyAuditChain(
    events: AuditEvent[],
    hashFn: (event: AuditEvent) => string
): { valid: boolean; brokenAt?: number } {
    for (let i = 1; i < events.length; i++) {
        const expectedHash = hashFn(events[i - 1]);
        if (events[i].prev_hash !== expectedHash) {
            return { valid: false, brokenAt: i };
        }
    }
    return { valid: true };
}

// =============================================================================
// INVARIANT POLICY TABLE
// =============================================================================

export interface PolicyRule {
    invariant: InvariantId;
    condition: string;
    enforcement: 'block' | 'audit' | 'alert';
    severity: 'critical' | 'high' | 'medium';
}

export const POLICY_RULES: PolicyRule[] = [
    { invariant: 'INV-01', condition: 'broadcast -> pii', enforcement: 'block', severity: 'critical' },
    { invariant: 'INV-02', condition: 'ops -> vault/pii', enforcement: 'block', severity: 'critical' },
    { invariant: 'INV-04', condition: 'non-family < 2 approvals', enforcement: 'block', severity: 'critical' },
    { invariant: 'INV-08', condition: 'audit chain broken', enforcement: 'alert', severity: 'critical' },
    { invariant: 'INV-AI-01', condition: 'agent -> pii', enforcement: 'block', severity: 'critical' },
    { invariant: 'INV-AI-02', condition: 'agent token reuse', enforcement: 'block', severity: 'high' },
    { invariant: 'INV-AI-04', condition: 'aggregation > N', enforcement: 'block', severity: 'high' },
];
