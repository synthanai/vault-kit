/**
 * Vault-Kit MCP Apps: Privacy Audit Log Viewer
 * 
 * Interactive UI for viewing immutable privacy audit trails.
 * Displays access logs, consent records, and ZK-Dissent patterns.
 * 
 * @see https://modelcontextprotocol.github.io/ext-apps/api/
 */

/**
 * Generate the Audit Log Viewer HTML
 */
export function generateAuditLogUI(options = {}) {
    const {
        logs = [],
        vaultStatus = 'sealed'
    } = options;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vault-Kit Audit Log</title>
    <style>
        :root {
            --bg-primary: #1e1e1e;
            --bg-secondary: #252526;
            --text-primary: #ffffff;
            --text-muted: #858585;
            --vault-green: #10b981;
            --vault-amber: #f59e0b;
            --vault-red: #ef4444;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 16px;
        }
        
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .header-icon { font-size: 1.25rem; }
        
        .header-title {
            font-size: 1rem;
            font-weight: 600;
        }
        
        .vault-status {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .vault-status.sealed {
            background: rgba(16, 185, 129, 0.2);
            color: var(--vault-green);
        }
        
        .vault-status.warning {
            background: rgba(245, 158, 11, 0.2);
            color: var(--vault-amber);
        }
        
        .vault-status.breached {
            background: rgba(239, 68, 68, 0.2);
            color: var(--vault-red);
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 16px;
        }
        
        .stat-box {
            background: var(--bg-secondary);
            padding: 10px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
        }
        
        .stat-label {
            font-size: 0.65rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }
        
        .log-list {
            max-height: 200px;
            overflow-y: auto;
        }
        
        .log-entry {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            background: var(--bg-secondary);
            border-radius: 6px;
            margin-bottom: 6px;
            font-size: 0.8rem;
        }
        
        .log-icon {
            width: 24px;
            text-align: center;
        }
        
        .log-content { flex: 1; }
        
        .log-action { font-weight: 600; }
        
        .log-target {
            color: var(--text-muted);
            font-size: 0.75rem;
        }
        
        .log-time {
            font-size: 0.7rem;
            color: var(--text-muted);
            font-family: monospace;
        }
        
        .log-access { border-left: 3px solid var(--vault-green); }
        .log-deny { border-left: 3px solid var(--vault-red); }
        .log-consent { border-left: 3px solid var(--vault-amber); }
        
        .empty-state {
            text-align: center;
            padding: 30px;
            color: var(--text-muted);
        }
        
        .footer {
            margin-top: 12px;
            display: flex;
            justify-content: center;
            gap: 16px;
        }
        
        .footer-btn {
            padding: 6px 12px;
            background: var(--bg-secondary);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            color: var(--text-primary);
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .footer-btn:hover {
            background: rgba(139, 92, 246, 0.2);
            border-color: rgba(139, 92, 246, 0.5);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <span class="header-icon">🔐</span>
            <span class="header-title">Vault-Kit Audit</span>
        </div>
        <div class="vault-status ${vaultStatus}" id="vault-status">
            <span class="status-dot"></span>
            <span>${vaultStatus.charAt(0).toUpperCase() + vaultStatus.slice(1)}</span>
        </div>
    </div>
    
    <div class="stats-row">
        <div class="stat-box">
            <div class="stat-value" id="access-count">0</div>
            <div class="stat-label">Accesses</div>
        </div>
        <div class="stat-box">
            <div class="stat-value" id="deny-count">0</div>
            <div class="stat-label">Denials</div>
        </div>
        <div class="stat-box">
            <div class="stat-value" id="consent-count">0</div>
            <div class="stat-label">Consents</div>
        </div>
    </div>
    
    <div class="log-list" id="log-list">
        ${logs.length > 0 ? logs.map(log => `
            <div class="log-entry log-${log.type}">
                <span class="log-icon">${log.type === 'access' ? '✓' : log.type === 'deny' ? '✗' : '◉'}</span>
                <div class="log-content">
                    <div class="log-action">${log.action}</div>
                    <div class="log-target">${log.target}</div>
                </div>
                <span class="log-time">${log.time}</span>
            </div>
        `).join('') : `
            <div class="empty-state">
                <div>🔒</div>
                <div>No audit logs yet</div>
            </div>
        `}
    </div>
    
    <div class="footer">
        <button class="footer-btn" onclick="sendMessage('Show full audit trail')">Full Trail</button>
        <button class="footer-btn" onclick="sendMessage('Export audit log')">Export</button>
    </div>
    
    <script>
        function sendMessage(text) {
            window.parent.postMessage({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'ui/message',
                params: { content: [{ type: 'text', text }] }
            }, '*');
        }
        
        window.addEventListener('message', (event) => {
            const { data } = event;
            if (data.method === 'ui/notifications/tool-input') {
                const args = data.params?.arguments || {};
                if (args.logs) updateLogs(args.logs);
                if (args.stats) updateStats(args.stats);
            }
        });
        
        function updateLogs(logs) {
            const list = document.getElementById('log-list');
            list.innerHTML = logs.map(log => \`
                <div class="log-entry log-\${log.type}">
                    <span class="log-icon">\${log.type === 'access' ? '✓' : log.type === 'deny' ? '✗' : '◉'}</span>
                    <div class="log-content">
                        <div class="log-action">\${log.action}</div>
                        <div class="log-target">\${log.target}</div>
                    </div>
                    <span class="log-time">\${log.time}</span>
                </div>
            \`).join('');
        }
        
        function updateStats(stats) {
            document.getElementById('access-count').textContent = stats.accesses || 0;
            document.getElementById('deny-count').textContent = stats.denials || 0;
            document.getElementById('consent-count').textContent = stats.consents || 0;
        }
    </script>
</body>
</html>`;
}

/**
 * Register Vault-Kit MCP Apps resources
 */
export function registerVaultAppsResources(server) {
    server.resource(
        "audit-log",
        "ui://vault-kit/audit-log",
        {
            description: "Privacy audit log viewer with access trails",
            mimeType: "text/html;profile=mcp-app"
        },
        async () => ({
            contents: [{
                mimeType: "text/html;profile=mcp-app",
                text: generateAuditLogUI()
            }]
        })
    );
}

export default { generateAuditLogUI, registerVaultAppsResources };
