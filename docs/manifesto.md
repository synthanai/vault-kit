# VAULT-KIT Manifesto

> **V**erified · **A**uditable · **U**nleakable · **L**imited · **T**raceable

*Built to reveal less while helping more.*

---

## The Promise

**"In the worst day, you will get help fast — without being exposed."**

When crisis strikes — especially death — families face three simultaneous battles:
1. **Grief** — the emotional weight of loss
2. **Logistics** — arrangements, notifications, coordination
3. **Exposure** — well-intentioned helpers sharing too much

Existing tools force a trade-off: coordinate effectively OR maintain privacy. CrisisVault refuses this trade-off.

## The Problem

### What We Observed

| Scenario | What Happens | Privacy Cost |
|----------|--------------|--------------|
| Family death | WhatsApp groups explode | PII forwarded, screenshotted |
| Volunteer coordination | "Add everyone who can help" | Strangers see address, medical info |
| Donation requests | Shared publicly "to maximize" | Financial status exposed |
| Well-meaning updates | "Keeping everyone informed" | Grief becomes spectacle |

### Why Existing Tools Fail

- **Digital Vaults** (Prisidio, Everplans): Store documents, no real-time coordination
- **Coordination Apps** (Meal Train, CaringBridge): Organize help, no privacy boundaries
- **Religious Apps** (Shiva.com): Single community, no architectural privacy
- **Hospice Platforms** (Patient Data Vault): Healthcare-focused, HIPAA overhead

**Gap**: No platform combines bounded disclosure + real-time coordination + multi-community support.

## The Solution

### Core Doctrine

**"If we can't guarantee privacy integrity, we don't ship the feature."**

This is not a policy. It is architecture.

### The Four Planes

Data is separated by sensitivity, not convenience:

| Plane | Contains | Who Accesses |
|-------|----------|--------------|
| **PII** | Identity documents, medical, addresses | Family only |
| **Vault** | Pre-arranged wishes, documents, contacts | Owner + Trustees |
| **Ops** | Task assignments, schedules, logistics | Volunteers (scoped) |
| **Broadcast** | Public updates, donation links | Community |

**Invariant**: A token minted for OPS cannot call PII endpoints. Ever.

### The Three Modes

Crisis has phases. Access changes with them:

| Mode | Family State | Access Posture |
|------|--------------|----------------|
| **PRE** | Preparing, planning | Owner full control, trustees view |
| **CASUALTY** | Crisis active | Expanded access, bounded disclosure |
| **POST** | Concluding, archiving | Revocation begins, retention timers |
| **CLOSED** | Case complete | Deletion enforcement, audit only |

**Invariant**: Mode transition revokes all non-family grants + sessions.

### Bounded Disclosure

Never share a "folder." Share a **specific answer** to a **specific question** for a **specific time**.

```
Grant:
  resource: burial_preferences
  accessor: funeral_coordinator
  reason: "Coordinate burial arrangements"
  expires: 24h
  conditions: [case_mode == CASUALTY]
```

### The Two-Key Rule

| Action | Family Requirement | Non-Family Requirement |
|--------|-------------------|------------------------|
| View PII | 1-of-n family | ❌ Never |
| Share to volunteer | 1-of-n family | N/A |
| External disclosure | 2-of-n family | 2-of-3 trustees |
| Broadcast publish | 1-of-n family | 2-of-3 trustees |

## Non-Negotiable Invariants

These are "must never happen" assertions:

| ID | Invariant |
|----|-----------|
| INV-01 | Broadcast plane API cannot read PII tables/fields |
| INV-02 | Token minted for OPS cannot call VAULT/PII endpoints |
| INV-03 | Volunteers cannot list/search vault resources |
| INV-04 | Non-family disclosure requires 2-of-3 approvals |
| INV-05 | Mode transition revokes all non-family grants + sessions |
| INV-06 | No "download all" — exports only via bounded packs |
| INV-07 | Case artifacts auto-expire; deletion emits audit events |
| INV-08 | Audit is append-only + tamper-evident |

## Generic Core, Community Overlays

CrisisVault is **community-agnostic by design**. The protocol is universal; the implementation is specific.

### What's Universal (OSS Core)

- Privacy Infrastructure (planes, modes, approvals)
- Coordination Protocol (tasks, meals, events, comms)
- Audit + deletion enforcement

### What's Overlay (Community-Specific)

- Ritual timelines (3/7/13 day mourning)
- Role taxonomies (Imam, Rabbi, Pandit)
- Content libraries (prayers, chants)
- UI themes + languages

## The Anti-Goals

What CrisisVault is **NOT**:

- ❌ **Not a social network** — no feeds, no likes, no engagement metrics
- ❌ **Not a data maximizer** — collect minimum, delete early
- ❌ **Not a convenience-first tool** — privacy over speed
- ❌ **Not a monetization platform** — no selling data, no ads

## Call to Action

### For Community Leaders

Your community needs this. The OSS is free. Invest in your community's overlay.

### For Developers

The privacy invariants are tested. The architecture is extensible. Build with us.

### For Families

You shouldn't have to choose between getting help and being exposed. CrisisVault is being built so you don't have to.

---

> *"Janazah Vault is not built to store more. It is built to reveal less — while helping more."*

— Victoria Manifesto, 2026
