# Zero-Knowledge Dissent (ZK-Dissent) Pattern

> **Privacy-preserving disagreement for the Decision Moment Standard.**

---

## The Problem

In the [Decision Moment Standard (DMS)](../../decision-moment-standard/README.md), the **MERIT** principle of **Inspectability** requires that all dissent be recorded. However, sensitive dissent content (e.g., whistleblowing, HR concerns, legal risk) cannot always be stored in the main decision ledger.

**The Tension:**
- **MERIT demands visibility**: The *fact* of dissent must be provable.
- **Privacy demands protection**: The *content* of dissent may be sensitive.

---

## The Solution: ZK-Dissent

**Zero-Knowledge Dissent** resolves this tension by splitting the dissent into two parts:

| Location | What is Stored | Who Can Access |
|----------|----------------|----------------|
| **DMS/DMG Ledger** | Hash of dissent + `dissent_vault_ref` URI | Anyone auditing the decision |
| **Vault-Kit** | Full encrypted dissent content | Only authorized parties |

### The Guarantee
- **Auditors** can verify that dissent *exists* and was *recorded at commit time* (hash match).
- **Unauthorized parties** cannot read the *content* of the dissent.
- **Authorized parties** (e.g., HR, Legal, future investigators) can decrypt the content via Vault-Kit access controls.

---

## Protocol Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. DISSENTER submits sensitive dissent                         │
│     └─> Content: "I believe X is a compliance violation."       │
├─────────────────────────────────────────────────────────────────┤
│  2. VAULT-KIT encrypts and stores the content                   │
│     └─> Returns: vault_id = "vault://abc123/sha256:deadbeef..."  │
├─────────────────────────────────────────────────────────────────┤
│  3. DMG MOMENT records the DISSENT_ADDED event                  │
│     └─> DISSENT object includes:                                 │
│           dissent_vault_ref: "vault://abc123/sha256:deadbeef..." │
│           claim: "[REDACTED - See Vault]"                       │
├─────────────────────────────────────────────────────────────────┤
│  4. AUDITOR verifies hash matches                               │
│     └─> SHA256(vault_content) == "deadbeef..." ✅                │
├─────────────────────────────────────────────────────────────────┤
│  5. AUTHORIZED PARTY requests access via Vault-Kit              │
│     └─> Vault-Kit checks role, logs access, returns content     │
└─────────────────────────────────────────────────────────────────┘
```

---

## DMS Integration

### DISSENT Object Schema (with ZK-Dissent)

```json
{
  "dissent_id": "d-001",
  "author": "anonymous",
  "claim": "[REDACTED - See Vault]",
  "dissent_vault_ref": "vault://abc123/sha256:a1b2c3d4e5f6...",
  "evidence": [],
  "conditions_to_change_mind": "If compliance review clears X.",
  "resolution": null
}
```

### MOMENT Event

```json
{
  "event_id": "evt-007",
  "seq": 7,
  "ts": "2026-01-27T00:30:00Z",
  "type": "DISSENT_ADDED",
  "actor": "anonymous",
  "payload": {
    "dissent_id": "d-001",
    "vault_ref": "vault://abc123/sha256:a1b2c3d4e5f6...",
    "content_hash": "sha256:a1b2c3d4e5f6..."
  },
  "prev_hash": "...",
  "hash": "..."
}
```

---

## Vault-Kit API

### Store ZK-Dissent

```typescript
import { VaultClient } from '@synthai/vault-kit';

const vault = new VaultClient({ endpoint: 'https://vault.example.com' });

const result = await vault.store({
  type: 'zk-dissent',
  content: {
    claim: "I believe X is a compliance violation.",
    evidence: ["Document A", "Email thread B"],
    author_pseudonym: "whistleblower-001"
  },
  access_policy: {
    roles: ['legal', 'hr', 'board'],
    expiry: '2027-01-27T00:00:00Z'
  }
});

// Returns: { vault_id: "abc123", content_hash: "sha256:a1b2c3d4e5f6..." }
```

### Retrieve ZK-Dissent

```typescript
const content = await vault.retrieve({
  vault_id: "abc123",
  content_hash: "sha256:a1b2c3d4e5f6...",
  requester_role: "legal"
});

// Vault-Kit verifies role, logs access, returns decrypted content.
```

---

## Security Properties

| Property | How Vault-Kit Ensures It |
|----------|--------------------------|
| **Confidentiality** | AES-256-GCM encryption at rest |
| **Integrity** | SHA-256 hash stored in DMG; mismatch = tampering |
| **Non-repudiation** | MOMENT event hash-chained; cannot be deleted |
| **Access Control** | Role-based policy; audit log for every access |
| **Auditability** | All access logged to immutable audit trail |

---

## References

- [DMS Core Spec §4.3 - Zero-Knowledge Dissent](../../decision-moment-standard/spec/DMS_CORE_SPEC_v0.2.md)
- [Vault-Kit Architecture](./ARCHITECTURE.md)
- [MERIT Validator Spec](../../decision-moment-standard/spec/MERIT_VALIDATOR_SPEC.md)

---

*Vault-Kit: Privacy-preserving infrastructure for the Decision Moment Standard.*
