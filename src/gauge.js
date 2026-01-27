/**
 * GAUGE Phase Integration
 * 
 * Metacognitive feedback loop for Vault-Kit.
 * Enables re-audit triggers and ecosystem-wide learning.
 * 
 * @module vault-kit/gauge
 */

/**
 * GAUGE event types relevant to Vault operations
 */
export const VAULT_GAUGE_EVENTS = {
    ACCESS_AUDIT: 'vault.access.audit',
    CONSENT_REVIEW: 'vault.consent.review',
    PRIVACY_DRIFT: 'vault.privacy.drift',
    COMPLIANCE_CHECK: 'vault.compliance.check'
};

/**
 * Emit GAUGE event from Vault-Kit
 * Called after significant privacy operations
 * 
 * @param {Object} eventBus - The ecosystem event bus
 * @param {Object} payload - Event payload
 */
export function emitVaultGaugeEvent(eventBus, payload) {
    if (!eventBus?.emit) {
        console.warn('[VAULT-GAUGE] No event bus available');
        return;
    }

    const event = {
        id: `vault_gauge_${Date.now()}`,
        source: 'vault-kit',
        phase: 'GAUGE',
        type: payload.type || VAULT_GAUGE_EVENTS.ACCESS_AUDIT,
        insight: {
            accessCount: payload.accessCount || 0,
            consentsPending: payload.consentsPending || 0,
            privacyScore: payload.privacyScore || 1.0,
            auditTrailSize: payload.auditTrailSize || 0
        },
        timestamp: new Date().toISOString()
    };

    eventBus.emit('GAUGE_EVENT', event);
    return event;
}

/**
 * Handle incoming GAUGE events
 * Triggers privacy re-audits when needed
 * 
 * @param {Object} event - Incoming GAUGE event
 * @returns {Object} Response action
 */
export function handleGaugeEvent(event) {
    // Check if event requires privacy re-audit
    if (event.source === 'resonance-kit' && event.phase === 'GAUGE') {
        const safetyScore = event.insight?.safetyScore || 1.0;

        if (safetyScore < 0.6) {
            return {
                action: 'privacy_lockdown',
                reason: `Safety score ${(safetyScore * 100).toFixed(0)}% below threshold`,
                recommendation: 'Restrict data access until compliance review'
            };
        }
    }

    // Check for wisdom query patterns
    if (event.source === 'kural-kit') {
        return {
            action: 'audit_wisdom_access',
            reason: 'Cross-kit wisdom query detected',
            recommendation: 'Log to consent audit trail'
        };
    }

    return { action: 'none', reason: 'No vault action required' };
}

/**
 * Register Vault-Kit as GAUGE subscriber
 * 
 * @param {Object} eventBus - The ecosystem event bus
 */
export function registerVaultGaugeSubscriber(eventBus) {
    if (!eventBus?.on) {
        console.warn('[VAULT-GAUGE] Cannot register - no event bus');
        return;
    }

    eventBus.on('GAUGE_EVENT', (event) => {
        const response = handleGaugeEvent(event);
        if (response.action !== 'none') {
            console.log(`[VAULT-GAUGE] Action: ${response.action} - ${response.reason}`);
        }
    });

    console.log('[VAULT-GAUGE] Registered as ecosystem subscriber');
}

export default {
    VAULT_GAUGE_EVENTS,
    emitVaultGaugeEvent,
    handleGaugeEvent,
    registerVaultGaugeSubscriber
};
