#!/usr/bin/env python3
"""Varredura estática gratuita: segredos, padrões perigosos, arquivos sensíveis."""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = Path(__file__).resolve().parent / "reports"

SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", ".vite", "reports",
    "public", "agent-transcripts", "security", "template",
}
SKIP_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2", ".map"}

SECRET_PATTERNS = [
    (r"(?i)(api[_-]?key|secret[_-]?key|password|token)\s*=\s*['\"][^'\"]{8,}['\"]", "hardcoded_secret"),
    (r"sk_live_[a-zA-Z0-9]+", "stripe_live"),
    (r"re_[a-zA-Z0-9]{20,}", "resend_key"),
    (r"-----BEGIN (RSA |EC )?PRIVATE KEY-----", "private_key"),
]

DANGEROUS_PATTERNS = [
    (r"eval\s*\(", "eval_usage"),
    (r"dangerouslySetInnerHTML", "xss_sink"),
    (r"innerHTML\s*=", "inner_html"),
    (r"child_process\.exec\s*\(", "command_exec"),
]

SENSITIVE_FILES = [
    ".env",
    ".env.local",
    "credentials.json",
    "id_rsa",
]


def should_scan(path: Path) -> bool:
    if path.suffix.lower() in SKIP_EXT:
        return False
    parts = path.parts
    return not any(p in SKIP_DIRS for p in parts)


def scan_file(path: Path, findings: list) -> None:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return
    rel = str(path.relative_to(ROOT))
    for pattern, kind in SECRET_PATTERNS + DANGEROUS_PATTERNS:
        for m in re.finditer(pattern, text):
            line = text[: m.start()].count("\n") + 1
            findings.append({
                "kind": kind,
                "file": rel,
                "line": line,
                "snippet": m.group(0)[:80],
                "severity": "High" if kind in ("hardcoded_secret", "private_key", "resend_key") else "Medium",
            })


def main() -> int:
    findings: list = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or not should_scan(path):
            continue
        if path.name in SENSITIVE_FILES or path.name.endswith(".env"):
            try:
                import subprocess
                tracked = subprocess.run(
                    ["git", "ls-files", "--error-unmatch", str(path)],
                    cwd=ROOT,
                    capture_output=True,
                ).returncode == 0
            except Exception:
                tracked = False
            if tracked:
                findings.append({
                    "kind": "sensitive_file",
                    "file": str(path.relative_to(ROOT)),
                    "severity": "High",
                    "detail": "Arquivo .env versionado no git",
                })
            continue
        if path.suffix in {".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".ps1", ".py"}:
            scan_file(path, findings)

    # source maps em build
    for sm in (ROOT / "apps" / "app").rglob("*.map"):
        if "node_modules" not in sm.parts:
            findings.append({
                "kind": "source_map",
                "file": str(sm.relative_to(ROOT)),
                "severity": "Medium",
                "detail": "Source map pode vazar código em produção",
            })

    ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORT_DIR / f"static-{ts}.json"
    report = {
        "scanned_at": datetime.now(timezone.utc).isoformat(),
        "finding_count": len(findings),
        "findings": findings,
    }
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Static scan: {len(findings)} achados -> {out}")
    high = sum(1 for f in findings if f.get("severity") == "High")
    return 1 if high else 0


if __name__ == "__main__":
    sys.exit(main())
