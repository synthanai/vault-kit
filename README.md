# CrisisVault Protocol

> **Privacy-first crisis coordination for communities**

A 3-layer open-source protocol for coordinating family crises (death, illness, emergencies) while protecting privacy. Generic core with community-specific overlay deployments.

## The Problem

When crisis strikes (especially death), families face:
- **Information chaos** — scattered documents, unknown contacts, unclear wishes
- **Coordination overload** — volunteers need direction; family is overwhelmed
- **Privacy violations** — PII shared too widely, screenshots forwarded, boundaries crossed
- **Shadow channels** — when tools are too rigid, people bypass to WhatsApp

Existing tools are either:
- **Vaults** (Prisidio, FamVault) — store documents, no real-time coordination
- **Coordination** (CaringBridge, Meal Train) — organize help, no privacy boundaries
- **Religious-specific** (Shiva.com, Last Journey) — one community only

**CrisisVault bridges the gap**: coordinate help while revealing less.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  COMMUNITY OVERLAYS (Declarative JSON)               │
│  Janazah│Shiva│Antyesti│Parish│Secular...           │
├─────────────────────────────────────────────────────┤
│  COORDINATION PROTOCOL (Universal)                   │
│  Tasks • Meals • Events • Booking • Comms • Donations│
├─────────────────────────────────────────────────────┤
│  PRIVACY INFRASTRUCTURE (Immutable Core)             │
│  Bounded Disclosure • Modes • Planes • Approvals     │
└─────────────────────────────────────────────────────┘
```

### Layer 1: Privacy Infrastructure (Core)
**Immutable constraints that overlays cannot weaken**

| Component | Description |
|-----------|-------------|
| **Bounded Disclosure** | Specific answer, specific time, specific reason |
| **Mode Engine** | PRE → CASUALTY → POST → CLOSED |
| **Plane Separation** | PII / Vault / Ops / Broadcast |
| **Approval Engine** | 1-of-n family, 2-of-n non-family |
| **Audit System** | Append-only, tamper-evident |
| **Deletion Enforcement** | Cryptographic key shredding |

### Layer 2: Coordination Protocol
**Universal capabilities shared across communities**

- Task/Volunteer Calendar
- Meal Coordination
- Event Planning
- Professional Booking
- Communication Hub
- Donation Tracking
- Memorial Engine

### Layer 3: Community Overlays
**Declarative JSON configurations per community**

- Ritual timelines (mourning periods)
- Role taxonomies (volunteer types)
- Content libraries (prayers, chants)
- UI themes + languages
- Workflow templates

## Quick Start (Coming Soon)

```bash
# Clone the protocol
git clone https://github.com/synthai/crisivault-protocol

# Deploy with a community overlay
crisivault deploy --overlay=muslim-sunni
```

## Community Deployments

| Deployment | Community | Status |
|------------|-----------|--------|
| Janazah Vault | Muslim | 🔸 Reference |
| Shiva Vault | Jewish | 📝 Planned |
| Antyesti Vault | Hindu | 📝 Planned |
| Parish Vault | Christian | 📝 Planned |
| Secular Vault | Non-religious | 📝 Planned |

## Documentation

- [Architecture Overview](docs/architecture/three-layer-overview.md)
- [Privacy Infrastructure](docs/architecture/privacy-infrastructure.md)
- [Coordination Protocol](docs/architecture/coordination-protocol.md)
- [Overlay Specification](docs/architecture/overlay-specification.md)
- [Non-Negotiable Invariants](docs/governance/invariants.md)

## Contributing

CrisisVault is open source. Communities can:
1. **Use the OSS core** directly
2. **Create custom overlays** for their traditions
3. **Invest in hosted deployments** with their branding

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

Apache 2.0 — Open source, attribution required.

---

> *"In the worst day, you will get help fast — without being exposed."*

Built by [SYNTHAI](https://github.com/synthai) • Part of the SYNTHAI ecosystem
