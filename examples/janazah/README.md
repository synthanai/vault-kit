# Janazah Vault — Example Implementation

> *Privacy-first coordination for Muslim families during times of loss*

This directory contains a complete reference implementation of VAULT-KIT for Muslim (Sunni) communities.

## Contents

```
janazah/
├── overlay.json          # Community configuration
├── content/
│   ├── duas.md          # Prayers and supplications
│   └── checklist.md     # Family guidance for first 24 hours
├── templates/
│   └── broadcast.md     # Announcement templates
└── i18n/                # Translations (coming soon)
    ├── ar.json          # Arabic
    ├── ur.json          # Urdu  
    └── ms.json          # Malay
```

## Using This Example

### For Community Leaders

1. Review the `overlay.json` to understand the configuration
2. Adjust rituals, roles, and terminology to match your community
3. Add your local service providers
4. Translate content to your community's languages

### For Developers

1. Use this as a reference when building new community overlays
2. Note the structure: overlay → content → templates → i18n
3. Schema validation: `npm run validate examples/janazah/overlay.json`

## Scholarly Considerations

This overlay follows **general Sunni** practices. Specific madhab (Hanafi, Shafi'i, Maliki, Hanbali) variations exist for:

- Ghusl sequence and requirements
- Takfeen (number and type of cloths)
- Salat al-Janazah structure
- Permissibility of certain gatherings

When adapting for your community, consult local scholars.

## Cultural Diversity

The Muslim ummah spans many cultures. This overlay provides:

- **Arabic** labels as the heritage language
- Support for **Urdu, Malay, Indonesian, Turkish, Bengali**
- Acknowledgment that practices vary regionally

Not all Muslims are Arab. Good implementations honor this diversity.

## Emotional Design Principles

Every element in this overlay was designed with grieving families in mind:

1. **Warm language** — "time after passing" not "hours from death"
2. **Guidance, not just process** — Context and meaning, not just steps
3. **Spiritual grounding** — Du'as and Quranic references woven throughout
4. **Permission to grieve** — Acknowledgment that grief is natural and sacred

## Feedback

If you find inaccuracies, insensitivities, or gaps, please raise an issue or submit a PR. We especially welcome:

- Corrections from Islamic scholars
- Translations to additional languages
- Regional variations and practices
- Accessibility improvements

---

*May this serve the ummah and bring ease to families in their time of need.*
