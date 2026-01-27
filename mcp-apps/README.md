# Vault-Kit MCP Apps

Interactive UI for privacy audit log viewing.

## UI Resources

| URI | Description |
|-----|-------------|
| `ui://vault-kit/audit-log` | Access trails, denials, and consent records |

## Usage

```javascript
import { registerVaultAppsResources } from './mcp-apps/audit-log.js';
registerVaultAppsResources(server);
```

## Preview

```bash
npx serve mcp-apps/
```
