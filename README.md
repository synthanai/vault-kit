# VAULT-KIT

> **V**erified · **A**uditable · **U**nleakable · **L**imited · **T**raceable

*Built to reveal less while helping more.*

---

A privacy-first coordination protocol for communities. Store less, disclose bounded, help more.

## The VAULT Properties

| Letter | Property | Meaning |
|:------:|----------|---------|
| **V** | Verified | Identity confirmed, step-up auth |
| **A** | Auditable | Append-only, hash-chained log |
| **U** | Unleakable | Plane separation, no cross-plane access |
| **L** | Limited | Bounded disclosure, no bulk export |
| **T** | Traceable | Origin visible, revocation tracked |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  COMMUNITY OVERLAYS (Declarative JSON)               │
│  Janazah│Shiva│Antyesti│Parish│Secular...           │
├─────────────────────────────────────────────────────┤
│  COORDINATION PROTOCOL (Universal)                   │
│  Tasks • Meals • Events • Booking • Comms • Donations│
├─────────────────────────────────────────────────────┤
│  VAULT CORE (Immutable Privacy Infrastructure)       │
│  Planes • Modes • Approvals • Audit • Disclosure     │
└─────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Initialize with community overlay
vault-kit init --overlay=janazah

# Deploy
vault-kit deploy

# Create bounded grant
vault-kit grant create --resource=burial_prefs --expires=24h
```

## Community Deployments

| Deployment | Community | Status |
|------------|-----------|--------|
| Janazah Vault | Muslim | 🔸 Reference |
| Shiva Vault | Jewish | 📝 Planned |
| Antyesti Vault | Hindu | 📝 Planned |
| Parish Vault | Christian | 📝 Planned |

## Documentation

- [Manifesto](docs/manifesto.md) — Philosophy + doctrine
- [Three-Layer Architecture](docs/architecture/three-layer-overview.md)
- [Invariants](docs/governance/invariants.md) — Non-negotiable properties
- [Overlay Schema](specs/schemas/overlay.schema.json)

## Contributing

VAULT-KIT is open source. Communities can create custom overlays for their traditions.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache 2.0

---

> *"VAULT-KIT is not built to store more. It is built to reveal less — while helping more."*

Part of the [SYNTHAI](https://github.com/synthai) ecosystem
