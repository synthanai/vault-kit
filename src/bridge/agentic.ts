import { spawn } from 'child_process';
import path from 'path';

/**
 * Interface for Agentic Bridge response
 */
export interface AgenticResponse {
    allowed?: boolean;
    logged?: boolean;
    state?: string;
    reason?: string;
    error?: string;
    id?: string;
}

/**
 * Bridge to Agentic-Kit (Python) for privacy enforcement.
 * Enforces Circuit Breakers and Immutable Audit Logging.
 */
export class AgenticBridge {
    private scriptPath: string;

    constructor() {
        // Resolve path to python script
        // vault-kit/dist/src/bridge/ -> vault-kit/scripts/agentic_bridge.py
        // Assuming run from project root for now, but making robust
        this.scriptPath = path.resolve(__dirname, '../../../scripts/agentic_bridge.py');
    }

    /**
     * Check if access is allowed by the privacy circuit breaker.
     */
    async checkAccess(vaultId: string): Promise<boolean> {
        const response = await this.runPython({
            action: 'check_access',
            data: { vault_id: vaultId }
        });

        if (response.error) {
            console.error(`[PrivacyKernel] Error: ${response.error}`);
            return false; // Fail safe closed
        }

        return response.allowed === true;
    }

    /**
     * Log an access attempt (success or failure) to the immutable audit log.
     */
    async recordAccess(vaultId: string, success: boolean, context: any = {}): Promise<void> {
        const response = await this.runPython({
            action: 'log_access',
            data: {
                vault_id: vaultId,
                success,
                context
            }
        });

        if (response.error) {
            console.error(`[PrivacyKernel] logging failed: ${response.error}`);
        }
    }

    /**
     * Internal execution of Python bridge
     */
    private runPython(payload: any): Promise<AgenticResponse> {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python3', [this.scriptPath]);

            let outputData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    // If script missing or crashes
                    resolve({ error: `Process exited with code ${code}: ${errorData}` });
                    return;
                }

                try {
                    const result = JSON.parse(outputData);
                    resolve(result);
                } catch (e) {
                    resolve({ error: `Invalid JSON from bridge: ${outputData}` });
                }
            });

            // Send payload
            pythonProcess.stdin.write(JSON.stringify(payload));
            pythonProcess.stdin.end();
        });
    }
}
