/**
 * ZK-Dissent Pattern Extensions
 * 
 * Extends the Zero-Knowledge Dissent pattern with:
 * - Threshold-based revelation
 * - Time-locked dissent
 * - Multi-party anonymous voting
 * 
 * @module vault-kit/zk-dissent-ext
 */

/**
 * Dissent revelation thresholds
 */
const REVELATION_THRESHOLDS = {
    UNANIMOUS: 1.0,     // All must agree to reveal
    SUPERMAJORITY: 0.67, // 2/3 must agree
    MAJORITY: 0.5,       // Simple majority
    MINORITY: 0.33,      // 1/3 can force reveal
    SINGLE: 0.0          // Any single party can reveal
};

/**
 * In-memory dissent registry
 */
const dissentRegistry = new Map();

/**
 * Create a time-locked dissent commitment
 * 
 * @param {Object} params - Dissent parameters
 * @returns {Object} Commitment object
 */
function createTimeLocked Dissent(params) {
    const {
        dissenterId,
        issueId,
        positionHash,
        revealAfter, // ISO timestamp
        threshold = REVELATION_THRESHOLDS.MAJORITY
    } = params;

    const commitment = {
        id: `zkd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        dissenterId: dissenterId.substring(0, 8) + '...', // Pseudonymize
        issueId,
        positionHash, // Never store actual position
        createdAt: new Date().toISOString(),
        revealAfter,
        threshold,
        status: 'locked',
        votes: []
    };

    dissentRegistry.set(commitment.id, commitment);
    return { id: commitment.id, status: 'created' };
}

/**
 * Vote to reveal a dissent
 * 
 * @param {string} commitmentId - The commitment to vote on
 * @param {string} voterId - Who is voting
 * @param {boolean} revealVote - Vote to reveal or not
 * @returns {Object} Vote result
 */
function voteToReveal(commitmentId, voterId, revealVote) {
    const commitment = dissentRegistry.get(commitmentId);

    if (!commitment) {
        return { success: false, error: 'Commitment not found' };
    }

    if (commitment.status !== 'locked') {
        return { success: false, error: `Commitment already ${commitment.status}` };
    }

    // Check time lock
    if (new Date() < new Date(commitment.revealAfter)) {
        return {
            success: false,
            error: 'Time lock not expired',
            revealAfter: commitment.revealAfter
        };
    }

    // Record vote
    const existingVote = commitment.votes.find(v => v.voterId === voterId);
    if (existingVote) {
        existingVote.vote = revealVote;
    } else {
        commitment.votes.push({
            voterId,
            vote: revealVote,
            timestamp: new Date().toISOString()
        });
    }

    // Check threshold
    const revealVotes = commitment.votes.filter(v => v.vote === true).length;
    const totalVotes = commitment.votes.length;
    const revealRatio = totalVotes > 0 ? revealVotes / totalVotes : 0;

    if (revealRatio >= commitment.threshold) {
        commitment.status = 'revealed';
        return {
            success: true,
            action: 'revealed',
            message: 'Threshold met - dissent position can now be viewed'
        };
    }

    dissentRegistry.set(commitmentId, commitment);

    return {
        success: true,
        action: 'voted',
        currentRatio: revealRatio,
        threshold: commitment.threshold,
        votesNeeded: Math.ceil(commitment.threshold * totalVotes) - revealVotes
    };
}

/**
 * Multi-party anonymous voting on an issue
 * 
 * @param {string} issueId - Issue being voted on
 * @param {Array<string>} options - Available options
 * @returns {Object} Ballot setup
 */
function createAnonymousBallot(issueId, options) {
    const ballotId = `ballot_${Date.now()}`;

    const ballot = {
        id: ballotId,
        issueId,
        options,
        votes: [], // Store only hashed votes
        status: 'open',
        createdAt: new Date().toISOString()
    };

    dissentRegistry.set(ballotId, ballot);

    return {
        ballotId,
        issueId,
        options,
        status: 'created'
    };
}

/**
 * Cast an anonymous vote (hashed)
 * 
 * @param {string} ballotId - Ballot to vote on
 * @param {string} voterHash - Hashed voter identity
 * @param {number} optionIndex - Selected option
 * @returns {Object} Vote result
 */
function castAnonymousVote(ballotId, voterHash, optionIndex) {
    const ballot = dissentRegistry.get(ballotId);

    if (!ballot || ballot.status !== 'open') {
        return { success: false, error: 'Ballot not available' };
    }

    // Check for duplicate vote
    if (ballot.votes.some(v => v.voterHash === voterHash)) {
        return { success: false, error: 'Already voted' };
    }

    ballot.votes.push({
        voterHash,
        optionIndex,
        timestamp: new Date().toISOString()
    });

    dissentRegistry.set(ballotId, ballot);

    return {
        success: true,
        votesCast: ballot.votes.length
    };
}

/**
 * Close ballot and tally results
 */
function closeBallot(ballotId) {
    const ballot = dissentRegistry.get(ballotId);

    if (!ballot) {
        return { success: false, error: 'Ballot not found' };
    }

    ballot.status = 'closed';
    ballot.closedAt = new Date().toISOString();

    // Tally votes
    const tally = ballot.options.map((opt, idx) => ({
        option: opt,
        votes: ballot.votes.filter(v => v.optionIndex === idx).length
    }));

    ballot.results = tally;
    dissentRegistry.set(ballotId, ballot);

    return {
        success: true,
        issueId: ballot.issueId,
        totalVotes: ballot.votes.length,
        results: tally
    };
}

/**
 * Get dissent audit trail (anonymized)
 */
function getDissentAuditTrail(options = {}) {
    const { issueId, since } = options;

    let entries = Array.from(dissentRegistry.values());

    if (issueId) {
        entries = entries.filter(e => e.issueId === issueId);
    }

    if (since) {
        entries = entries.filter(e => new Date(e.createdAt) > new Date(since));
    }

    // Anonymize sensitive fields
    return entries.map(e => ({
        id: e.id,
        issueId: e.issueId,
        status: e.status,
        createdAt: e.createdAt,
        voteCount: e.votes?.length || 0
    }));
}

module.exports = {
    REVELATION_THRESHOLDS,
    createTimeLockedDissent: createTimeLocked Dissent,
    voteToReveal,
    createAnonymousBallot,
    castAnonymousVote,
    closeBallot,
    getDissentAuditTrail
};
