# VAULT-KIT

> **Verified · Auditable · Unleakable · Limited · Traceable**  
> *Built to reveal less while helping more.*

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

---

## What is VAULT-KIT?

**VAULT-KIT** is the **Privacy Protocol** for crisis coordination.
It bridges the gap between privacy and utility:

- 🛡️ **Unleakable** — Plane separation
- 🔍 **Auditable** — Hash-chained logs
- ⚡ **Coordinated** — Role-based access
- ❤️ **Human** — Community overlays

---

## The VAULT Properties

Every interaction is governed by five non-negotiable properties:

| Letter | Property | Meaning |
|:------:|----------|---------|
| **V** | Verified | Identity confirmed, step-up authentication |
| **A** | Auditable | Append-only, hash-chained action log |
| **U** | Unleakable | Plane separation, no cross-plane access |
| **L** | Limited | Bounded disclosure, no bulk export |
| **T** | Traceable | Origin visible, revocation tracked |

---

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

### Agentic Integration (MCP)
Vault-Kit exposes a **Privacy Sentinel** MCP Server:
- **Tools**: `check_access(vault_id)`, `log_access(vault_id, success)`
- **Resources**: `vault://audit/latest`
- **Config**: Add `src/mcp/server.ts` to your Agent Client.
### Zero-Knowledge Dissent (DMS Integration)
Vault-Kit powers the **ZK-Dissent** pattern for the [Decision Moment Standard (DMS)](../decision-moment-standard/README.md).

> **The Problem**: You need to record a dissent (to satisfy MERIT), but the content is too sensitive for the main ledger.
> **The Solution**: Store the hash in DMS. Store the content in Vault-Kit.

1.  **DMS Record**: Contains `dissent_vault_ref: "vault://<id>/<hash>"`
2.  **Vault Record**: Contains the full encrypted text.
3.  **Verification**: Users can verify the hash matches without seeing the content (unless authorized).

See [DMS Core Spec §4.3](../decision-moment-standard/spec/DMS_CORE_SPEC_v0.2.md) for details.

```bash
# Clone the repository
git clone https://github.com/synthanai/vault-kit.git

# Explore the Janazah example
cat examples/janazah/overlay.json
```

---

## The Open Protocol

**VAULT-Kit is the open protocol. ARANGAM provides managed infrastructure.**

| What You Get | VAULT-Kit (OSS) | ARANGAM Platform |
|--------------|-----------------|------------------|
| 3-Layer Architecture | ✅ Full protocol | ✅ |
| Community Overlays | ✅ DIY implementation | ✅ |
| Privacy Invariants | ✅ | ✅ |
| **Hosted VAULT Infrastructure** | ❌ | ✅ Managed hosting |
| **Multi-Community Dashboard** | ❌ | ✅ |
| **Compliance + Audit Trails** | ❌ | ✅ Enterprise |

> *The protocol is free. The infrastructure is premium.*

See [ATTRIBUTION.md](ATTRIBUTION.md) for attribution guidelines.

---

## License

Apache 2.0 — see [LICENSE](LICENSE).

---

## The SYNTHAI Ecosystem

| Component | Role |
| :--- | :--- |
| **[Decision Moment Graph](https://github.com/synthanai/decision-moment-graph)** | The **Standard** for reversible, auditable decisions. |
| **[VAULT-KIT](https://github.com/synthanai/vault-kit)** | The **Protocol** for privacy-first coordination. |
| **[agentic-kit](https://github.com/synthanai/agentic-kit)** | The **Infrastructure** for reliable agent systems. |

> *Built by [SYNTHAI](https://synthai.tech) — Decision Intelligence for the AI Era.*
