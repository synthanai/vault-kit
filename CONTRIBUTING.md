# Contributing to CrisisVault Protocol

Thank you for your interest in contributing to CrisisVault Protocol!

## Contribution Types

### 1. Core Protocol Contributions
Improvements to the universal protocol layers (Privacy Infrastructure, Coordination Protocol).

**Requirements**:
- Must not weaken any invariant (see [invariants.md](docs/governance/invariants.md))
- All invariant tests must pass
- Documentation updates required

### 2. Community Overlay Contributions
New or improved community-specific overlays.

**Process**:
1. Fork the repository
2. Create overlay in `overlays/{community-denomination}/`
3. Validate against `specs/schemas/overlay.schema.json`
4. Submit PR with community context

**Minimum Requirements**:
- `overlay.json` — main configuration
- `README.md` — community context and usage
- All fields validated against schema

### 3. Documentation

Help improve docs, fix typos, add examples.

## Development Setup

```bash
# Clone repository
git clone https://github.com/synthai/crisivault-protocol
cd crisivault-protocol

# Install dependencies
npm install

# Run tests
npm test

# Validate overlay schema
npm run validate-overlay overlays/muslim-sunni/overlay.json
```

## Overlay Development

### Creating a New Overlay

```bash
# Create overlay directory
mkdir -p overlays/{your-community}

# Copy template
cp overlays/_template/overlay.json overlays/{your-community}/

# Edit configuration
# ...

# Validate
npm run validate-overlay overlays/{your-community}/overlay.json
```

### Overlay Checklist

- [ ] `overlay_id` follows `{religion}-{denomination}` pattern
- [ ] `display_name` is community-appropriate
- [ ] `ritual_timeline` covers key phases
- [ ] `roles` define community-specific volunteer types
- [ ] `donations` include relevant charity categories
- [ ] Heritage language labels provided
- [ ] Content pack referenced (or custom content provided)

## Code of Conduct

- Respect all faith traditions and communities
- Maintain privacy-first mindset in all contributions
- No weakening of invariants under any circumstance
- Cultural sensitivity in naming and descriptions

## License

Apache 2.0 — All contributions will be under this license.
