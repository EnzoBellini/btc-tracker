#!/usr/bin/env python3
"""Scan OWASP ZAP: spider + passive (+ active opcional) via API local."""
import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from zapv2 import ZAPv2

REPORT_DIR = Path(__file__).resolve().parent / "reports"


def wait_zap(zap: ZAPv2, timeout: int = 120) -> None:
    for i in range(timeout):
        try:
            zap.core.version
            print(f"ZAP conectado ({i + 1}s)")
            return
        except Exception:
            time.sleep(1)
    raise RuntimeError("ZAP não respondeu na API")


def run_spider(zap: ZAPv2, target: str, mins: int) -> None:
    scan_id = zap.spider.scan(target, maxchildren=100)
    deadline = time.time() + mins * 60
    while int(zap.spider.status(scan_id)) < 100:
        if time.time() > deadline:
            print("Spider: timeout")
            return
        print(f"Spider: {zap.spider.status(scan_id)}%")
        time.sleep(2)


def wait_pscan(zap: ZAPv2, max_wait: int = 120) -> None:
    for _ in range(max_wait // 2):
        if int(zap.pscan.records_to_scan) == 0:
            return
        time.sleep(2)


def run_active(zap: ZAPv2, target: str, mins: int) -> None:
    print("Active scan (localhost apenas)...")
    scan_id = zap.ascan.scan(target, recurse=True, inscopeonly=True)
    deadline = time.time() + mins * 60
    while int(zap.ascan.status(scan_id)) < 100:
        if time.time() > deadline:
            print("Active scan: timeout")
            zap.ascan.stop(scan_id)
            return
        print(f"Active: {zap.ascan.status(scan_id)}%")
        time.sleep(5)
    wait_pscan(zap, 180)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("target", nargs="?", default="http://127.0.0.1:5000")
    parser.add_argument("port", nargs="?", type=int, default=8090)
    parser.add_argument("spider_mins", nargs="?", type=int, default=3)
    parser.add_argument("--active", action="store_true", help="Rodar active scan (mais lento)")
    parser.add_argument("--active-mins", type=int, default=5)
    args = parser.parse_args()

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    proxies = {
        "http": f"http://127.0.0.1:{args.port}",
        "https": f"http://127.0.0.1:{args.port}",
    }
    zap = ZAPv2(proxies=proxies)

    wait_zap(zap)
    print(f"ZAP {zap.core.version} — {args.target}")

    zap.urlopen(args.target)
    run_spider(zap, args.target, args.spider_mins)
    wait_pscan(zap)

    if args.active:
        run_active(zap, args.target, args.active_mins)
        wait_pscan(zap, 180)

    alerts = zap.core.alerts(baseurl=args.target)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    tag = "full" if args.active else "baseline"
    out = REPORT_DIR / f"zap-{tag}-{ts}.json"

    summary = {
        "target": args.target,
        "zap_version": zap.core.version,
        "scanned_at": datetime.now(timezone.utc).isoformat(),
        "active_scan": args.active,
        "alert_count": len(alerts),
        "by_risk": {},
        "by_name": {},
        "alerts": alerts,
    }
    for a in alerts:
        risk = a.get("risk", "Unknown")
        name = a.get("name", "?")
        summary["by_risk"][risk] = summary["by_risk"].get(risk, 0) + 1
        summary["by_name"][name] = summary["by_name"].get(name, 0) + 1

    out.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Relatório: {out}")
    print("Por risco:", summary["by_risk"])
    print("Únicos:", len(summary["by_name"]))

    high = summary["by_risk"].get("High", 0) + summary["by_risk"].get("Critical", 0)
    medium = summary["by_risk"].get("Medium", 0)
    if high:
        return 1
    if medium:
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
