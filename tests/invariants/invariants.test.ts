/**
 * VAULT-KIT Invariant Tests
 * 
 * These tests verify the non-negotiable VAULT properties.
 * If any test fails, the feature MUST NOT be shipped.
 */

import { describe, it, expect } from 'vitest';
import {
    checkPlaneIsolation,
    checkTokenScope,
    checkApprovalRequirements,
    checkAgentPIIAccess,
    checkAgentTokenUsage,
    checkAggregationLimit,
    verifyAuditChain,
    INVARIANTS,
} from '../src/core/invariants.js';
import type { Token, Grant, AuditEvent, Approval } from '../src/core/types.js';

describe('Human Era Invariants', () => {

    describe('INV-01: Plane Isolation', () => {
        it('should block broadcast plane from accessing PII', () => {
            const result = checkPlaneIsolation('broadcast', 'pii');
            expect(result.valid).toBe(false);
            expect(result.violation).toContain('INV-01');
        });

        it('should block broadcast plane from accessing vault', () => {
            const result = checkPlaneIsolation('broadcast', 'vault');
            expect(result.valid).toBe(false);
        });

        it('should allow broadcast plane to access broadcast', () => {
            const result = checkPlaneIsolation('broadcast', 'broadcast');
            expect(result.valid).toBe(true);
        });
    });

    describe('INV-02: Token Scope Enforcement', () => {
        it('should reject OPS token accessing vault plane', () => {
            const result = checkPlaneIsolation('ops', 'vault');
            expect(result.valid).toBe(false);
            expect(result.violation).toContain('INV-02');
        });

        it('should reject OPS token accessing PII plane', () => {
            const result = checkPlaneIsolation('ops', 'pii');
            expect(result.valid).toBe(false);
        });

        it('should allow OPS token accessing OPS plane', () => {
            const result = checkPlaneIsolation('ops', 'ops');
            expect(result.valid).toBe(true);
        });

        it('should reject token without required plane', () => {
            const token: Token = {
                actor_id: 'volunteer-1',
                actor_type: 'volunteer',
                planes: ['ops'],
                issued_at: new Date(),
                expires_at: new Date(Date.now() + 3600000),
            };

            const result = checkTokenScope(token, 'vault');
            expect(result.valid).toBe(false);
            expect(result.violation).toContain('INV-02');
        });
    });

    describe('INV-04: Approval Requirements', () => {
        const createGrant = (approvals: Approval[]): Grant => ({
            id: 'grant-1',
            resource_id: 'burial_preferences',
            accessor_id: 'volunteer-1',
            reason: 'Coordinate burial',
            created_at: new Date(),
            expires_at: new Date(Date.now() + 86400000),
            conditions: [],
            status: 'pending',
            approvals,
        });

        it('should require 2 approvals for non-family disclosure', () => {
            const grant = createGrant([
                { approver_id: 'trustee-1', approved_at: new Date() },
            ]);

            const result = checkApprovalRequirements(grant, 'volunteer');
            expect(result.valid).toBe(false);
            expect(result.violation).toContain('INV-04');
            expect(result.violation).toContain('2-of-3');
        });

        it('should accept 2 approvals for non-family disclosure', () => {
            const grant = createGrant([
                { approver_id: 'trustee-1', approved_at: new Date() },
                { approver_id: 'trustee-2', approved_at: new Date() },
            ]);

            const result = checkApprovalRequirements(grant, 'volunteer');
            expect(result.valid).toBe(true);
        });

        it('should require 1 approval for family disclosure', () => {
            const grant = createGrant([]);

            const result = checkApprovalRequirements(grant, 'trustee');
            expect(result.valid).toBe(false);
        });

        it('should accept 1 approval for family disclosure', () => {
            const grant = createGrant([
                { approver_id: 'owner', approved_at: new Date() },
            ]);

            const result = checkApprovalRequirements(grant, 'trustee');
            expect(result.valid).toBe(true);
        });
    });
});

describe('AI Era Invariants', () => {

    describe('INV-AI-01: Agent PII Restriction', () => {
        it('should block agent access to PII plane', () => {
            const result = checkAgentPIIAccess('agent', 'pii');
            expect(result.valid).toBe(false);
            expect(result.violation).toContain('INV-AI-01');
        });

        it('should allow human access to PII plane', () => {
            const result = checkAgentPIIAccess('owner', 'pii');
            expect(result.valid).toBe(true);
        });

        it('should allow agent access to ops plane', () => {
            const result = checkAgentPIIAccess('agent', 'ops');
            expect(result.valid).toBe(true);
        });
    });

    describe('INV-AI-02: Agent Token Single-Use', () => {
        it('should reject exhausted agent token', () => {
            const token: Token = {
                actor_id: 'agent-1',
                actor_type: 'agent',
                planes: ['ops'],
                issued_at: new Date(),
                expires_at: new Date(Date.now() + 3600000),
                max_uses: 1,
                uses_remaining: 0,
                principal_id: 'owner-1',
            };

            const result = checkAgentTokenUsage(token);
            expect(result.valid).toBe(false);
            expect(result.violation).toContain('INV-AI-02');
        });

        it('should accept fresh agent token', () => {
            const token: Token = {
                actor_id: 'agent-1',
                actor_type: 'agent',
                planes: ['ops'],
                issued_at: new Date(),
                expires_at: new Date(Date.now() + 3600000),
                max_uses: 1,
                uses_remaining: 1,
                principal_id: 'owner-1',
            };

            const result = checkAgentTokenUsage(token);
            expect(result.valid).toBe(true);
        });
    });

    describe('INV-AI-04: Aggregation Limits', () => {
        it('should flag aggregation exceeding limit', () => {
            const result = checkAggregationLimit(100, 10);
            expect(result.valid).toBe(false);
            expect(result.requiresApproval).toBe(true);
            expect(result.violation).toContain('INV-AI-04');
        });

        it('should accept aggregation within limit', () => {
            const result = checkAggregationLimit(5, 10);
            expect(result.valid).toBe(true);
            expect(result.requiresApproval).toBe(false);
        });
    });
});

describe('Audit Chain Integrity (INV-08)', () => {
    const mockHash = (event: AuditEvent): string => {
        return `hash-${event.id}`;
    };

    it('should verify valid audit chain', () => {
        const events: AuditEvent[] = [
            {
                id: 'event-1',
                timestamp: new Date(),
                actor_id: 'owner',
                actor_type: 'owner',
                action: 'GRANT_ISSUED',
                plane: 'vault',
                metadata: {},
                prev_hash: 'genesis',
                hash: 'hash-event-1',
            },
            {
                id: 'event-2',
                timestamp: new Date(),
                actor_id: 'trustee',
                actor_type: 'trustee',
                action: 'RESOURCE_ACCESSED',
                plane: 'vault',
                metadata: {},
                prev_hash: 'hash-event-1',
                hash: 'hash-event-2',
            },
        ];

        const result = verifyAuditChain(events, mockHash);
        expect(result.valid).toBe(true);
    });

    it('should detect broken audit chain', () => {
        const events: AuditEvent[] = [
            {
                id: 'event-1',
                timestamp: new Date(),
                actor_id: 'owner',
                actor_type: 'owner',
                action: 'GRANT_ISSUED',
                plane: 'vault',
                metadata: {},
                prev_hash: 'genesis',
                hash: 'hash-event-1',
            },
            {
                id: 'event-2',
                timestamp: new Date(),
                actor_id: 'trustee',
                actor_type: 'trustee',
                action: 'RESOURCE_ACCESSED',
                plane: 'vault',
                metadata: {},
                prev_hash: 'TAMPERED',  // Wrong hash!
                hash: 'hash-event-2',
            },
        ];

        const result = verifyAuditChain(events, mockHash);
        expect(result.valid).toBe(false);
        expect(result.brokenAt).toBe(1);
    });
});

describe('Invariant Registry', () => {
    it('should have 8 human era invariants', () => {
        const humanInvariants = Object.keys(INVARIANTS).filter(k => k.startsWith('INV-') && !k.startsWith('INV-AI'));
        expect(humanInvariants.length).toBe(8);
    });

    it('should have 7 AI era invariants', () => {
        const aiInvariants = Object.keys(INVARIANTS).filter(k => k.startsWith('INV-AI'));
        expect(aiInvariants.length).toBe(7);
    });
});
