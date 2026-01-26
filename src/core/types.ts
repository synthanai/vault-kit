/**
 * VAULT-KIT Core Types
 * 
 * Verified · Auditable · Unleakable · Limited · Traceable
 * Built to reveal less while helping more.
 */

// =============================================================================
// PLANES - Data isolation by sensitivity
// =============================================================================

export type Plane = 'pii' | 'vault' | 'ops' | 'broadcast';

export interface PlaneAccess {
    plane: Plane;
    read: boolean;
    write: boolean;
}

// =============================================================================
// MODES - Crisis lifecycle phases
// =============================================================================

export type Mode = 'PRE' | 'CASUALTY' | 'POST' | 'CLOSED';

export interface ModeConfig {
    mode: Mode;
    default_days?: number;
    extended_days?: number;
    note?: string;
}

export interface ModeTransition {
    from: Mode;
    to: Mode;
    timestamp: Date;
    triggered_by: string;
    revocations_issued: number;
}

// =============================================================================
// ACTORS - Who can interact with the system
// =============================================================================

export type ActorType = 'owner' | 'trustee' | 'volunteer' | 'agent' | 'system';

export interface Actor {
    id: string;
    type: ActorType;
    email?: string;
    planes: Plane[];
    principal?: string; // For agents: who authorized this agent
    model?: string;     // For agents: which AI model
}

export interface Token {
    actor_id: string;
    actor_type: ActorType;
    planes: Plane[];
    issued_at: Date;
    expires_at: Date;
    max_uses?: number;   // For agents: token-per-task
    uses_remaining?: number;
    principal_id?: string;
}

// =============================================================================
// GRANTS - Bounded disclosure
// =============================================================================

export interface Grant {
    id: string;
    resource_id: string;
    accessor_id: string;
    reason: string;
    created_at: Date;
    expires_at: Date;
    conditions: GrantCondition[];
    status: 'pending' | 'active' | 'expired' | 'revoked';
    revoked_reason?: string;
    approvals: Approval[];
}

export interface GrantCondition {
    type: 'mode_equals' | 'time_before' | 'time_after' | 'accessor_type';
    value: string;
}

export interface Approval {
    approver_id: string;
    approved_at: Date;
    note?: string;
}

// =============================================================================
// AUDIT - Tamper-evident logging
// =============================================================================

export interface AuditEvent {
    id: string;
    timestamp: Date;
    actor_id: string;
    actor_type: ActorType;
    action: AuditAction;
    resource_id?: string;
    plane: Plane;
    metadata: Record<string, unknown>;
    prev_hash: string;
    hash: string;

    // AI-era extensions
    principal_id?: string;
    agent_model?: string;
    intent?: string;
}

export type AuditAction =
    | 'GRANT_REQUESTED'
    | 'GRANT_APPROVED'
    | 'GRANT_ISSUED'
    | 'GRANT_REVOKED'
    | 'RESOURCE_ACCESSED'
    | 'RESOURCE_CREATED'
    | 'RESOURCE_DELETED'
    | 'MODE_TRANSITION'
    | 'TOKEN_ISSUED'
    | 'TOKEN_REVOKED';

// =============================================================================
// CASE - Core lifecycle entity
// =============================================================================

export interface Case {
    id: string;
    created_at: Date;
    mode: Mode;
    mode_history: ModeTransition[];
    owner_id: string;
    trustees: string[];
    active_grants: string[];
    metadata: Record<string, unknown>;
}

// =============================================================================
// OVERLAY - Community configuration
// =============================================================================

export interface Overlay {
    overlay_id: string;
    display_name: string;
    version: string;
    description?: string;

    community?: {
        tradition: string;
        denomination?: string;
        fiqh_madhab?: string;
        note?: string;
    };

    language: {
        primary: string;
        heritage?: string[];
        additional?: string[];
        rtl_languages?: string[];
    };

    mode_durations: {
        CASUALTY: ModeConfig;
        POST?: ModeConfig;
    };

    ritual_timeline?: RitualPhase[];
    roles?: Role[];
    donations?: DonationType[];
    providers?: Provider[];

    content_pack?: string;
    theme?: Theme;
    emotional_design?: EmotionalDesign;
}

export interface RitualPhase {
    phase: string;
    label: string;
    label_ar?: string;
    time_after_passing?: string;
    duration_hours?: number;
    duration_days?: number;
    required_roles?: string[];
    description?: string;
    guidance?: string;
    note?: string;
}

export interface Role {
    id: string;
    label: string;
    label_ar?: string;
    label_ur?: string;
    min_count?: number;
    max_count?: number;
    description?: string;
    sensitivity?: string;
    plane_access: Plane[];
}

export interface DonationType {
    id: string;
    label: string;
    label_ar?: string;
    default?: boolean;
    description?: string;
}

export interface Provider {
    id: string;
    label: string;
    label_ar?: string;
    description?: string;
}

export interface Theme {
    primary_color?: string;
    secondary_color?: string;
    font_family_heritage?: string;
    design_note?: string;
}

export interface EmotionalDesign {
    tone: string;
    avoid: string[];
    principle: string;
}

// =============================================================================
// CONSENT TIERS (AI Era)
// =============================================================================

export type ConsentTier = 0 | 1 | 2 | 3;

export interface ConsentConfig {
    tier: ConsentTier;
    description: string;
    requires: string;
}

export const CONSENT_TIERS: Record<ConsentTier, ConsentConfig> = {
    0: { tier: 0, description: 'None (human only)', requires: 'Default' },
    1: { tier: 1, description: 'Summarization (no storage)', requires: 'Owner consent' },
    2: { tier: 2, description: 'Bounded assistance (session)', requires: 'Owner + 1 trustee' },
    3: { tier: 3, description: 'Automation (supervised)', requires: '2-of-3 trustees' },
};
