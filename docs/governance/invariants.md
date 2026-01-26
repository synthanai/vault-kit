# Non-Negotiable Invariants

These are "must never happen" assertions — gates before shipping any feature.

## The Invariant Contract

**Policy**: If any invariant can be violated, we do not ship the feature.

These are not configurable. Community overlays cannot weaken them.

## Invariant Table

| ID | Invariant | Test Strategy |
|----|-----------|---------------|
| **INV-01** | Broadcast plane API cannot read PII tables/fields. Ever. | Integration test: attempt forbidden read, expect 403 |
| **INV-02** | Token minted for OPS cannot call VAULT/PII endpoints | Middleware test: scope validation |
| **INV-03** | Volunteers cannot list/search vault resources | API test: reject browse/list operations |
| **INV-04** | Non-family disclosure requires 2-of-3 approvals | Workflow test: reject grant with 1 approval |
| **INV-05** | Mode transition revokes all non-family grants + sessions | State machine test: verify revocation |
| **INV-06** | No "download all" — exports only via bounded packs | API test: reject bulk export |
| **INV-07** | Case artifacts auto-expire; deletion emits audit events | Retention test: verify expiry + events |
| **INV-08** | Audit is append-only + tamper-evident | DB test: reject update/delete on audit |

## Detailed Specifications

### INV-01: Plane Isolation

**Statement**: Broadcast plane API cannot read PII tables/fields.

**Implementation**:
- Separate database schemas per plane
- Separate encryption keys per plane
- API route isolation (`/broadcast/*` has no PII imports)
- Static analysis to detect cross-plane imports

**Test**:
```typescript
test('broadcast API cannot access PII', async () => {
  const broadcastToken = await mintToken({ planes: ['broadcast'] });
  const response = await api.get('/pii/deceased/identity', {
    headers: { Authorization: broadcastToken }
  });
  expect(response.status).toBe(403);
});
```

### INV-02: Token Scope Enforcement

**Statement**: Token minted for OPS cannot call VAULT/PII endpoints.

**Implementation**:
- JWT claims include explicit `planes` array
- Middleware validates plane access before route handler
- Step-up auth required to expand scope

**Test**:
```typescript
test('OPS token rejected at VAULT endpoint', async () => {
  const opsToken = await mintToken({ planes: ['ops'] });
  const response = await api.get('/vault/documents', {
    headers: { Authorization: opsToken }
  });
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('INSUFFICIENT_SCOPE');
});
```

### INV-03: Volunteer Browse Restriction

**Statement**: Volunteers cannot list/search vault resources.

**Implementation**:
- No index/list endpoints for vault resources
- Access only via explicit grant with resource ID
- Search disabled for non-owner roles

**Test**:
```typescript
test('volunteer cannot list vault resources', async () => {
  const volunteerToken = await mintToken({ role: 'volunteer', planes: ['ops'] });
  const response = await api.get('/vault/resources', {
    headers: { Authorization: volunteerToken }
  });
  expect(response.status).toBe(403);
});
```

### INV-04: Two-of-Three Approval

**Statement**: Non-family disclosure requires 2-of-3 approvals.

**Implementation**:
- AccessRequest workflow requires approval count check
- Transaction-level enforcement before grant creation
- Cannot bypass via direct API call

**Test**:
```typescript
test('non-family disclosure requires 2-of-3', async () => {
  const request = await createAccessRequest({
    accessor: 'volunteer@example.com',
    resource: 'burial_preferences'
  });
  
  // Add only 1 approval
  await addApproval(request.id, 'trustee-1');
  
  // Attempt to issue grant
  const response = await issueGrant(request.id);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('INSUFFICIENT_APPROVALS');
  
  // Add second approval
  await addApproval(request.id, 'trustee-2');
  const response2 = await issueGrant(request.id);
  expect(response2.status).toBe(200);
});
```

### INV-05: Mode Transition Revocation

**Statement**: Mode transition revokes all non-family grants + sessions.

**Implementation**:
- State machine transition side-effects
- Automatic grant expiry on mode change
- Session invalidation for non-family tokens

**Test**:
```typescript
test('mode transition revokes non-family grants', async () => {
  // Setup: create grant in CASUALTY mode
  const grant = await createGrant({ accessor: 'volunteer', mode: 'CASUALTY' });
  expect(grant.status).toBe('active');
  
  // Transition to POST mode
  await transitionMode('POST');
  
  // Verify grant is revoked
  const updatedGrant = await getGrant(grant.id);
  expect(updatedGrant.status).toBe('revoked');
  expect(updatedGrant.revoked_reason).toBe('MODE_TRANSITION');
});
```

### INV-06: No Bulk Export

**Statement**: No "download all" — exports only via bounded packs.

**Implementation**:
- No `/export/all` endpoint exists
- Pack builder enforces item limits
- Exports include watermarks and expiry

**Test**:
```typescript
test('bulk export endpoint does not exist', async () => {
  const response = await api.get('/vault/export/all');
  expect(response.status).toBe(404);
});

test('pack export respects item limit', async () => {
  const pack = await createPack({
    items: Array(100).fill({ type: 'document' })
  });
  expect(pack.items.length).toBeLessThanOrEqual(MAX_PACK_ITEMS);
});
```

### INV-07: Auto-Expire and Audit Deletion

**Statement**: Case artifacts auto-expire; deletion emits audit events.

**Implementation**:
- Retention policies per resource type
- Background job for expiry enforcement
- AuditEvent emitted on any deletion

**Test**:
```typescript
test('expired artifacts are deleted with audit', async () => {
  const artifact = await createArtifact({ expires_at: Date.now() - 1000 });
  
  await runRetentionJob();
  
  const deleted = await getArtifact(artifact.id);
  expect(deleted).toBeNull();
  
  const auditEvents = await getAuditEvents({ resource_id: artifact.id });
  expect(auditEvents).toContainEqual(
    expect.objectContaining({ action: 'DELETED', reason: 'RETENTION_EXPIRED' })
  );
});
```

### INV-08: Append-Only Audit

**Statement**: Audit is append-only + tamper-evident.

**Implementation**:
- Database constraints: no UPDATE/DELETE on audit table
- Hash chain: each event includes hash of previous
- External verification possible

**Test**:
```typescript
test('audit records cannot be modified', async () => {
  const event = await createAuditEvent({ action: 'GRANT_ISSUED' });
  
  // Attempt direct SQL update (should fail)
  await expect(
    db.query('UPDATE audit_events SET action = $1 WHERE id = $2', ['MODIFIED', event.id])
  ).rejects.toThrow('AUDIT_IMMUTABLE');
});

test('audit chain is verifiable', async () => {
  const events = await getAuditEventsInOrder();
  
  for (let i = 1; i < events.length; i++) {
    const expectedHash = hash(events[i - 1]);
    expect(events[i].prev_hash).toBe(expectedHash);
  }
});
```

## Enforcement

### CI/CD Gate

All invariants are tested on every PR. Merge is blocked if any invariant test fails.

```yaml
# .github/workflows/invariants.yml
name: Invariant Tests
on: [pull_request]
jobs:
  test-invariants:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:invariants
      - name: Block merge on failure
        if: failure()
        run: exit 1
```

### Production Monitoring

Invariant violations in production trigger immediate alerts:
- PagerDuty for INV-01, INV-02, INV-04
- DataDog dashboard for all invariants
- Quarterly audit review

---

## AI-Era Invariants

> *"Inference is the new exfiltration."*

The human-era invariants (INV-01 to INV-08) remain in force. The AI-era extends them for autonomous agents, LLMs, and automated systems.

### The AI Threat Model

| Threat | Example | Mitigation |
|--------|---------|------------|
| LLM Inference | AI infers illness from meal schedules | Aggregation limits |
| Agent Impersonation | AI extracts data on behalf of user | Token-per-task |
| Deepfake Auth | Voice clone passes verification | Liveness + MFA |
| Shadow AI | Volunteer pastes PII into ChatGPT | Watermarking |
| Consent Laundering | Agent persists data after grant expires | No persistent sessions |

### AI-Era Invariant Table

| ID | Invariant | Test Strategy |
|----|-----------|---------------|
| **INV-AI-01** | AI agents cannot access PII plane directly | Gateway test: reject PII calls from agent tokens |
| **INV-AI-02** | Agent tokens expire after single task (no persistent sessions) | Token test: reject reuse |
| **INV-AI-03** | All AI actions log: principal, agent model, intent | Audit test: verify all fields |
| **INV-AI-04** | Aggregation queries >N items require escalated approval | Query test: reject large aggregates |
| **INV-AI-05** | AI-generated content is watermarked | Content test: verify watermark presence |
| **INV-AI-06** | Biometric auth requires liveness check + MFA | Auth test: reject replay attacks |
| **INV-AI-07** | Default AI processing tier is 0 (none) | Config test: verify default |

### Extended VAULT Properties (AI-Era)

| Letter | Property | Human Era | AI Era Extension |
|:------:|----------|-----------|------------------|
| **V** | Verified | Step-up auth | + Agent attestation, principal binding, liveness |
| **A** | Auditable | Action log | + Intent log, model version, causal chain |
| **U** | Unleakable | Plane separation | + Inference barrier, aggregation limits |
| **L** | Limited | Bounded disclosure | + Purpose binding, token-per-task, Q&A boundary |
| **T** | Traceable | Hash chain | + Principal→Agent→Action trace |

### Agent Gateway Architecture

```
┌────────────────────────────────────────────────────┐
│  HUMAN PRINCIPALS                                   │
│  Owner │ Trustee │ Volunteer                       │
│     │       │         │                             │
│     ▼       ▼         ▼                             │
│  ┌────────────────────────────────────────┐        │
│  │  AGENT GATEWAY                         │        │
│  │  • Principal binding (who delegated)   │        │
│  │  • Token-per-task (no persistence)     │        │
│  │  • Intent logging (why acting)         │        │
│  │  • Rate limiting (aggregation cap)     │        │
│  └────────────────────────────────────────┘        │
│                     │                               │
│                     ▼                               │
│  ┌────────────────────────────────────────┐        │
│  │  Q&A BOUNDARY                          │        │
│  │  AI gets: specific answers             │        │
│  │  AI never gets: raw documents          │        │
│  └────────────────────────────────────────┘        │
├────────────────────────────────────────────────────┤
│  VAULT CORE (Human-era invariants unchanged)       │
└────────────────────────────────────────────────────┘
```

### Consent Tiers

| Tier | AI Access | Requires |
|:----:|-----------|----------|
| **0** | None (human only) | Default — no override needed |
| **1** | Summarization (no storage) | Owner explicit consent |
| **2** | Bounded assistance (session-only) | Owner + 1 trustee |
| **3** | Automation (principal-supervised) | 2-of-3 trustees |

### INV-AI-01: No Direct PII Access for Agents

**Statement**: AI agents cannot access PII plane directly; only via human-in-the-loop.

**Implementation**:
- Agent tokens have `actor_type: 'agent'` claim
- PII plane middleware rejects all agent tokens
- Human must request on behalf, then relay

**Test**:
```typescript
test('agent token rejected at PII endpoint', async () => {
  const agentToken = await mintAgentToken({
    principal: 'owner@example.com',
    model: 'gpt-4',
    intent: 'summarize burial preferences'
  });
  
  const response = await api.get('/pii/contact_details', {
    headers: { Authorization: agentToken }
  });
  
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('AGENT_PII_FORBIDDEN');
});
```

### INV-AI-02: Token-Per-Task

**Statement**: Agent tokens expire after single task; no persistent agent sessions.

**Implementation**:
- Agent tokens have `max_uses: 1`
- Token is invalidated after first use
- No refresh tokens for agents

**Test**:
```typescript
test('agent token cannot be reused', async () => {
  const agentToken = await mintAgentToken({ ... });
  
  // First use succeeds
  const response1 = await api.get('/ops/tasks', {
    headers: { Authorization: agentToken }
  });
  expect(response1.status).toBe(200);
  
  // Second use fails
  const response2 = await api.get('/ops/tasks', {
    headers: { Authorization: agentToken }
  });
  expect(response2.status).toBe(401);
  expect(response2.body.error).toBe('TOKEN_EXHAUSTED');
});
```

### INV-AI-04: Aggregation Limits

**Statement**: Aggregation queries >N items require escalated approval.

**Implementation**:
- Query parser detects aggregate operations
- If result set > N (default: 10), require 2-of-3 approval
- Rate limiting on sequential single-item queries

**Test**:
```typescript
test('large aggregation requires approval', async () => {
  const response = await api.get('/ops/tasks?limit=100', {
    headers: { Authorization: agentToken }
  });
  
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('AGGREGATION_LIMIT');
  expect(response.body.requires).toBe('2-of-3 APPROVAL');
});
```

### Implementation Phases

| Phase | Features | Target |
|:-----:|----------|--------|
| **1** | Agent role, token-per-task, basic rate limits | MVP |
| **2** | Q&A Boundary, inference barrier, Audit AI | v1.1 |
| **3** | Federated AI, differential privacy, crypto proofs | v2.0 |
