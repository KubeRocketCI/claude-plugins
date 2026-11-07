#!/usr/bin/env python3
"""Check or rewrite a Helm Chart.lock without network access.

Helm stores digest = sha256(json([Chart.yaml dependencies, Chart.lock dependencies])).
Chart.yaml dependencies enter the hash with repository aliases (@name) resolved to URLs.
Chart content does not enter the hash, so the lock is reproducible before a chart is published.

Usage:
  python3 chart-lock-digest.py check <chart-dir> [--repo NAME=URL ...]
  python3 chart-lock-digest.py write <chart-dir> [--repo NAME=URL ...]

check  exits 0 when the committed digest matches Chart.yaml + Chart.lock, 1 otherwise.
write  sets every lock entry to the Chart.yaml version, recomputes digest, sets generated.
Default alias: epamedp=https://epam.github.io/edp-helm-charts/stable.
Supported dependency keys: name, version, repository, condition, alias. Versions must be exact.
"""
import argparse
import datetime
import hashlib
import json
import pathlib
import re
import sys

DEFAULT_REPOS = {"epamedp": "https://epam.github.io/edp-helm-charts/stable"}
REQ_KEYS = ("name", "version", "repository", "condition", "alias")
LOCK_KEYS = ("name", "version", "repository")


def unquote(v):
    v = v.split(" #", 1)[0].strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
        return v[1:-1]
    return v


def parse_deps(text, allowed):
    """Return the top-level `dependencies:` list as dicts (flat scalar keys only)."""
    deps, cur, inside = [], None, False
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if re.match(r"^\S", line) and not line.startswith("- "):
            if inside and not line.startswith("dependencies:"):
                break
            inside = line.startswith("dependencies:")
            continue
        if not inside:
            continue
        m = re.match(r"^(\s*)(- )?([A-Za-z-]+):\s*(.*)$", line)
        if not m:
            sys.exit(f"unsupported dependencies line: {raw!r}")
        if m.group(2):
            cur = {}
            deps.append(cur)
        if cur is None:
            sys.exit(f"dependency key outside a list item: {raw!r}")
        key, val = m.group(3), unquote(m.group(4))
        if key not in allowed:
            sys.exit(f"unsupported dependency key {key!r}; compute this lock with helm")
        cur[key] = val
    return deps


def resolve(repo, repos):
    if repo.startswith("@"):
        name = repo[1:]
        if name not in repos:
            sys.exit(f"unknown repository alias {repo}; pass --repo {name}=URL")
        return repos[name]
    return repo


def ordered(dep, keys):
    return {k: dep[k] for k in keys if dep.get(k)}


def digest(req, lock):
    data = json.dumps([req, lock], separators=(",", ":"), ensure_ascii=False)
    return "sha256:" + hashlib.sha256(data.encode()).hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=("check", "write"))
    ap.add_argument("chart_dir", type=pathlib.Path)
    ap.add_argument("--repo", action="append", default=[], metavar="NAME=URL")
    a = ap.parse_args()

    repos = dict(DEFAULT_REPOS)
    for r in a.repo:
        name, _, url = r.partition("=")
        repos[name.lstrip("@")] = url
    chart_yaml = a.chart_dir / "Chart.yaml"
    chart_lock = a.chart_dir / "Chart.lock"
    lock_text = chart_lock.read_text()

    req = parse_deps(chart_yaml.read_text(), REQ_KEYS)
    for d in req:
        if not re.fullmatch(r"v?\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?", d.get("version", "")):
            sys.exit(f"{d.get('name')}: version {d.get('version')!r} is not an exact pin; compute this lock with helm")
        d["repository"] = resolve(d["repository"], repos)
    req_json = [ordered(d, REQ_KEYS) for d in req]

    if a.mode == "check":
        lock = parse_deps(lock_text, LOCK_KEYS)
        lock_json = [ordered(d, LOCK_KEYS) for d in lock]
        m = re.search(r"^digest:\s*(\S+)", lock_text, re.M)
        want = digest(req_json, lock_json)
        have = m.group(1) if m else None
        stale = [d["name"] for d, l in zip(req, lock) if (d["name"], d["version"]) != (l.get("name"), l.get("version"))]
        print(f"computed {want}\ncommitted {have}")
        if stale or len(req) != len(lock):
            print(f"lock entries differ from Chart.yaml: {stale or 'entry count'}")
        sys.exit(0 if want == have and not stale and len(req) == len(lock) else 1)

    lock_json = [{"name": d["name"], "version": d["version"], "repository": d["repository"]} for d in req]
    new = digest(req_json, lock_json)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    body = ["dependencies:"]
    for d in lock_json:
        body += [f"- name: {d['name']}", f"  repository: {d['repository']}", f"  version: {d['version']}"]
    body += [f"digest: {new}", f'generated: "{stamp}"']
    chart_lock.write_text("\n".join(body) + "\n")
    print(f"wrote {chart_lock} digest {new}")


if __name__ == "__main__":
    main()
