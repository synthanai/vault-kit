# VAULT-KIT

> **V**erified · **A**uditable · **U**nleakable · **L**imited · **T**raceable

*Built to reveal less while helping more.*

---

Privacy-first coordination for communities during times of crisis. VAULT-KIT provides the engine; communities provide the soul.

## Why VAULT-KIT?

When crisis strikes — especially death — families face:
- **Information chaos**: scattered documents, unknown contacts
- **Coordination overload**: volunteers need direction; family is overwhelmed  
- **Privacy violations**: PII shared too widely, screenshots forwarded
- **Shadow channels**: when tools fail privacy, people bypass to WhatsApp

**VAULT-KIT bridges the gap**: coordinate help while revealing less.

## The VAULT Properties

Every interaction is governed by five non-negotiable properties:

| Letter | Property | Meaning |
|:------:|----------|---------|
| **V** | Verified | Identity confirmed, step-up authentication |
| **A** | Auditable | Append-only, hash-chained action log |
| **U** | Unleakable | Plane separation, no cross-plane access |
| **L** | Limited | Bounded disclosure, no bulk export |
| **T** | Traceable | Origin visible, revocation tracked |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  COMMUNITY EXAMPLES                                  │
│  Janazah (Muslim) │ Shiva (Jewish) │ More...        │
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
# Clone the repository
git clone https://github.com/synthanai/vault-kit.git

# Explore the Janazah example
cat examples/janazah/overlay.json
```

## Community Examples

VAULT-KIT includes reference implementations for different communities:

| Example | Community | Status |
|---------|-----------|--------|
| [Janazah](examples/janazah/) | Muslim | ✅ Reference |
| Shiva | Jewish | 📝 Planned |
| Antyesti | Hindu | 📝 Planned |
| Parish | Christian | 📝 Planned |

Each example contains:
- `overlay.json` — Community configuration
- `content/` — Prayers, checklists, guidance
- `templates/` — Announcement templates
- `i18n/` — Translations

## Documentation

- [Manifesto](docs/manifesto.md) — Philosophy and doctrine
- [Three-Layer Architecture](docs/architecture/three-layer-overview.md)
- [Invariants](docs/governance/invariants.md) — Non-negotiable properties (human + AI era)
- [Overlay Schema](specs/schemas/overlay.schema.json) — JSON schema for examples

## Contributing

VAULT-KIT handles the most sensitive moments in human life. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

We especially welcome:
- Corrections from religious scholars
- Translations to additional languages
- New community implementations
- Accessibility improvements

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Apache 2.0

---

> *"VAULT-KIT is not built to store more. It is built to reveal less — while helping more."*

Part of the [SYNTHAI](https://github.com/synthanai) ecosystem
