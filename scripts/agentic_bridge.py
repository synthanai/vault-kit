#!/usr/bin/env python3
"""
Vault-Kit Agentic Bridge (Privacy Kernel)
=========================================

Bridges Vault-Kit (Node.js) to Agentic-Kit (Python) for privacy enforcement.
Unlike SPAR-Kit (Safety), Vault-Kit focuses on:
- Privacy Circuit Breaking (stopping mass leaks)
- Immutable Audit Logging to Memory

Usage:
    python agentic_bridge.py < payload.json
"""

import sys
import json
import os
from typing import Dict, Any

# Dynamic path resolution for agentic-kit
current_dir = os.path.dirname(os.path.abspath(__file__))
# vault-kit/scripts -> vault-kit -> repos
repos_dir = os.path.dirname(os.path.dirname(current_dir))
agentic_kit_path = os.path.join(repos_dir, "agentic-kit")
if agentic_kit_path not in sys.path:
    sys.path.append(agentic_kit_path)

try:
    from agentic_kit.circuit_breaker import CircuitBreaker, BreakerState
    from agentic_kit.memory import SemanticMemoryStore
except ImportError as e:
    # Fail safe: if we can't load protections, we must crash
    print(json.dumps({
        "error": f"CRITICAL: Failed to import agentic-kit privacy kernel: {e}",
        "path": sys.path
    }))
    sys.exit(1)


class PrivacyKernel:
    def __init__(self):
        # Strict circuit breaker for privacy access
        # Fails faster than safe-mode (3 strikes)
        self.breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=60)
        
        # Privacy Audit Log (separate memory store)
        home = os.path.expanduser("~")
        persist_path = os.path.join(home, ".vault", "memory", "privacy_audit.json")
        self.audit_log = SemanticMemoryStore(persist_path=persist_path)

    def process(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        action = payload.get("action")
        data = payload.get("data", {})

        if action == "check_access":
            return self.check_access(data)
        elif action == "log_access":
            return self.log_access(data)
        elif action == "status":
            return self.get_status()
        else:
            return {"error": f"Unknown action: {action}"}

    def check_access(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check if access is allowed by circuit breaker."""
        if not self.breaker.allow_request():
            return {
                "allowed": False,
                "reason": "Privacy Circuit Breaker OPEN (Too many failures)",
                "state": self.breaker.state.value
            }
        
        return {
            "allowed": True, 
            "state": self.breaker.state.value
        }

    def log_access(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Log an access attempt (success or failure)."""
        success = data.get("success", False)
        vault_id = data.get("vault_id", "unknown")
        
        # Update breaker state
        if success:
            self.breaker.record_success()
        else:
            self.breaker.record_failure()

        # Audit log
        try:
            entry_id = self.audit_log.add({
                "type": "VAULT_ACCESS",
                "vault_id": vault_id,
                "success": success,
                "context": data.get("context", {})
            })
            return {"logged": True, "id": entry_id, "state": self.breaker.state.value}
        except Exception as e:
            return {"logged": False, "error": str(e)}

    def get_status(self) -> Dict[str, Any]:
        return {
            "breaker": {
                "state": self.breaker.state.value,
                "failures": self.breaker._failure_count
            }
        }

def main():
    try:
        input_str = sys.stdin.read()
        if not input_str.strip():
            return
            
        payload = json.loads(input_str)
        kernel = PrivacyKernel()
        result = kernel.process(payload)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": f"Kernel Panic: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
