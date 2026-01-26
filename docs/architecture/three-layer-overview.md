# Three-Layer Architecture

CrisisVault uses a three-layer architecture to separate concerns and enable community-specific deployments.

## Overview

```
┌─────────────────────────────────────────────────────┐
│  LAYER 3: COMMUNITY OVERLAYS                         │
│  Declarative JSON configurations per community       │
│  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐          │
│  │Muslim││Jewish││Hindu ││Christ││Secular│          │
│  └──────┘└──────┘└──────┘└──────┘└──────┘          │
├─────────────────────────────────────────────────────┤
│  LAYER 2: COORDINATION PROTOCOL                      │
│  Universal capabilities, shared across communities   │
│  Tasks│Meals│Events│Booking│Comms│Donations│Memorials│
├─────────────────────────────────────────────────────┤
│  LAYER 1: PRIVACY INFRASTRUCTURE                     │
│  Immutable core — overlays cannot weaken            │
│  Planes│Modes│Approvals│Audit│Disclosure│Deletion   │
└─────────────────────────────────────────────────────┘
```

## Layer 1: Privacy Infrastructure

**Status**: Immutable | **License**: Apache 2.0

The foundational layer that enforces privacy invariants. **Community overlays cannot modify or weaken these constraints.**

### Components

| Component | Purpose | Invariant Protection |
|-----------|---------|---------------------|
| **Plane Separation** | Data isolation by sensitivity | Hard API boundaries |
| **Mode Engine** | Crisis phase management | Access auto-revocation |
| **Approval Engine** | Multi-party consent | Transaction-level enforcement |
| **Bounded Disclosure** | Specific, time-limited sharing | Grant expiry enforcement |
| **Audit System** | Immutable action log | Append-only, hash-chained |
| **Deletion Enforcement** | Cryptographic erasure | Key shredding, retention timers |

### Plane Separation

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  PII Plane  │  │ Vault Plane │  │  Ops Plane  │  │ Broadcast   │
│             │  │             │  │             │  │   Plane     │
│ Identity    │  │ Documents   │  │ Tasks       │  │ Public      │
│ Medical     │  │ Wishes      │  │ Schedules   │  │ updates     │
│ Addresses   │  │ Contacts    │  │ Volunteers  │  │ Donation    │
│             │  │             │  │             │  │ links       │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
   Family Only     Owner/Trustees   Scoped Access    Community
```

### Mode Engine

```
┌──────────────────────────────────────────────────────────────┐
│                         LIFECYCLE                             │
│                                                               │
│   ┌─────┐    ┌──────────┐    ┌──────┐    ┌────────┐          │
│   │ PRE │───▶│ CASUALTY │───▶│ POST │───▶│ CLOSED │          │
│   └─────┘    └──────────┘    └──────┘    └────────┘          │
│   Planning    Crisis Active   Winding    Archived            │
│                               Down                            │
│                                                               │
│   Duration: Community-configurable (3/7/13 days)              │
└──────────────────────────────────────────────────────────────┘
```

## Layer 2: Coordination Protocol

**Status**: Universal | **License**: Apache 2.0

Shared capabilities that work across all communities. Configuration comes from Layer 3 overlays.

### Capabilities

| Capability | Description | Overlay Config |
|------------|-------------|----------------|
| **Task Calendar** | Volunteer scheduling, role assignment | Role taxonomy |
| **Meal Coordination** | Scheduling, dietary preferences | Mourning period |
| **Event Planning** | Gatherings, ceremonies | Ritual timeline |
| **Professional Booking** | Service provider coordination | Provider types |
| **Communication Hub** | Updates, announcements | UI theme/language |
| **Donation Tracking** | Contributions, charity types | Donation categories |
| **Memorial Engine** | Anniversaries, reminders | Memorial traditions |

### API Structure

```
/api/v1/
├── pii/          # PII Plane — family tokens only
├── vault/        # Vault Plane — owner/trustee tokens
├── ops/          # Ops Plane — volunteer tokens
├── broadcast/    # Broadcast Plane — public/sanitized
├── case/         # Case lifecycle management
├── grant/        # Access grant management
└── audit/        # Audit log queries
```

## Layer 3: Community Overlays

**Status**: Per-community | **License**: Mixed (basic open, custom closed)

Declarative configurations that customize the protocol for specific communities.

### Overlay Schema

```json
{
  "overlay_id": "muslim-sunni",
  "display_name": "Janazah Vault",
  "language": {
    "primary": "en",
    "heritage": "ar",
    "rtl": true
  },
  "mode_durations": {
    "CASUALTY": { "default_days": 3, "extended_days": 7 }
  },
  "ritual_timeline": [...],
  "roles": [...],
  "donations": [...],
  "content_pack": "islamic-sunni-v1"
}
```

### Available Components

| Component | Path | Description |
|-----------|------|-------------|
| Configuration | `overlay.json` | Main overlay definition |
| Ritual Timeline | `rituals.json` | Phases and timings |
| Role Taxonomy | `roles.json` | Volunteer role definitions |
| Content Library | `content/` | Prayers, chants, readings |
| UI Theme | `theme/` | Colors, fonts, RTL support |
| Translations | `i18n/` | Language strings |
| Workflows | `workflows/` | Pre-built task sequences |

## Invariant Protection

Layer 3 overlays **CANNOT**:

- Modify plane boundaries
- Weaken approval requirements
- Disable audit logging
- Override deletion enforcement
- Access cross-plane data

Layer 3 overlays **CAN**:

- Add custom role types
- Define ritual timelines
- Customize UI themes
- Add content libraries
- Configure mode durations (within limits)
