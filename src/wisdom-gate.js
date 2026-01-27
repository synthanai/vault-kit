/**
 * Vault-Kit Wisdom Gate
 * 
 * Integration point for Kural-Kit wisdom queries.
 * Provides access control and audit trail for wisdom retrieval.
 * 
 * @module vault-kit/wisdom-gate
 */

/**
 * Wisdom access levels aligned with VAULT properties
 */
export const WISDOM_ACCESS_LEVELS = {
    PUBLIC: 'public',       // Available without authentication
    PROTECTED: 'protected', // Requires session token
    PRIVATE: 'private',     // Requires explicit consent
    SACRED: 'sacred'        // Never leaves local environment
};

/**
 * Wisdom access policy
 * Maps kural categories to access levels
 */
const WISDOM_POLICY = {
    // Thirukkural chapters have different sensitivity
    'aram': 'public',      // Virtue - freely shareable
    'porul': 'protected',  // Wealth - context matters
    'inbam': 'protected',  // Love - some sensitivity

    // Special wisdom categories
    'personal-reflection': 'private',
    'organizational-strategy': 'protected',
    'spiritual-guidance': 'sacred'
};

/**
 * In-memory consent registry
 * In production, this would be backed by Vault-Kit's consent store
 */
const consentRegistry = new Map();

/**
 * Request consent for wisdom access
 * 
 * @param {string} requesterId - Who is requesting
 * @param {string} purpose - Why access is needed
 * @param {Array<number>} kuralNumbers - Which kurals
 * @returns {Object} Consent request response
 */
export function requestWisdomConsent(requesterId, purpose, kuralNumbers = []) {
    const requestId = `consent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const request = {
        id: requestId,
        requesterId,
        purpose,
        kuralNumbers,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };

    consentRegistry.set(requestId, request);

    return {
        requestId,
        status: 'pending',
        message: 'Consent request created. User must approve before wisdom can be accessed.',
        expiresAt: request.expiresAt
    };
}

/**
 * Grant consent for a pending request
 * 
 * @param {string} requestId - The consent request ID
 * @param {Object} options - Grant options
 * @returns {Object} Consent token for access
 */
export function grantWisdomConsent(requestId, options = {}) {
    const request = consentRegistry.get(requestId);

    if (!request) {
        return { success: false, error: 'Consent request not found' };
    }

    if (request.status !== 'pending') {
        return { success: false, error: `Request already ${request.status}` };
    }

    // Generate consent token
    const consentToken = `vkwc_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

    request.status = 'granted';
    request.grantedAt = new Date().toISOString();
    request.consentToken = consentToken;
    request.scope = options.scope || 'read';

    consentRegistry.set(requestId, request);

    return {
        success: true,
        consentToken,
        scope: request.scope,
        expiresAt: request.expiresAt
    };
}

/**
 * Verify a consent token
 * 
 * @param {string} consentToken - Token to verify
 * @returns {Object} Verification result
 */
export function verifyConsentToken(consentToken) {
    for (const [id, request] of consentRegistry) {
        if (request.consentToken === consentToken) {
            // Check expiry
            if (new Date() > new Date(request.expiresAt)) {
                return { valid: false, reason: 'Token expired' };
            }

            return {
                valid: true,
                requesterId: request.requesterId,
                purpose: request.purpose,
                kuralNumbers: request.kuralNumbers,
                scope: request.scope
            };
        }
    }

    return { valid: false, reason: 'Token not found' };
}

/**
 * Revoke consent
 * 
 * @param {string} requestId - The consent request to revoke
 * @returns {Object} Revocation result
 */
export function revokeWisdomConsent(requestId) {
    const request = consentRegistry.get(requestId);

    if (!request) {
        return { success: false, error: 'Consent request not found' };
    }

    request.status = 'revoked';
    request.revokedAt = new Date().toISOString();
    request.consentToken = null; // Invalidate token

    consentRegistry.set(requestId, request);

    return { success: true, message: 'Consent revoked' };
}

/**
 * Get all consent requests for audit
 * 
 * @param {Object} options - Filter options
 * @returns {Array} Consent requests
 */
export function getConsentAuditTrail(options = {}) {
    const { requesterId, status, since } = options;

    let requests = Array.from(consentRegistry.values());

    if (requesterId) {
        requests = requests.filter(r => r.requesterId === requesterId);
    }

    if (status) {
        requests = requests.filter(r => r.status === status);
    }

    if (since) {
        requests = requests.filter(r => new Date(r.createdAt) > new Date(since));
    }

    return requests;
}

export default {
    WISDOM_ACCESS_LEVELS,
    requestWisdomConsent,
    grantWisdomConsent,
    verifyConsentToken,
    revokeWisdomConsent,
    getConsentAuditTrail
};
