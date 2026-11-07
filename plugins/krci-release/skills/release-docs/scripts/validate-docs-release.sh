#!/usr/bin/env bash
# Validate a krci-docs release before committing.
#
# Runs the five checks that actually catch release mistakes, in cheapest-first order:
#   1. snapshot sync   - docs/ must be byte-identical to versioned_docs/version-<X.Y>/
#   2. stale pins      - install guides must not still reference the previous version
#   3. spell-check     - cspell over docs/ and blog/
#   4. typecheck       - tsc over src/; CI runs it, so a green build alone is not enough
#   5. build           - onBrokenLinks:'throw'; the only trustworthy proof that links resolve
#
# Checks 3-5 mirror CI (npm ci -> build -> spell-check -> typecheck).
#
# Usage:
#   validate-docs-release.sh <docs-repo> <new-version> [previous-version]
#
#     docs-repo          path to the krci-docs checkout
#     new-version        e.g. 3.15   (the version just cut)
#     previous-version   e.g. 3.14   (optional; enables the stale-pin check)
#
# Exit codes: 0 all passed, 1 usage error, 2 a check failed.

set -uo pipefail

usage() { sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'; }

[ $# -ge 2 ] || { usage; exit 1; }
REPO=$1; NEW=$2; PREV=${3:-}
[ -d "$REPO/docs" ] || { echo "not a krci-docs checkout: $REPO" >&2; exit 1; }

cd "$REPO" || exit 1
fail=0
step() { printf '\n=== %s ===\n' "$1"; }

step "1. snapshot sync: docs/ vs versioned_docs/version-$NEW/"
if [ ! -d "versioned_docs/version-$NEW" ]; then
  echo "  SKIP - snapshot not cut yet (run: npm run docusaurus docs:version $NEW)"
else
  drift=$(diff -rq docs "versioned_docs/version-$NEW" 2>&1)
  if [ -n "$drift" ]; then
    echo "  FAIL - snapshot differs from docs/; copy the changed files into the snapshot:"
    echo "$drift" | sed 's/^/    /'
    fail=1
  else
    echo "  OK - trees identical"
  fi
fi

step "2. stale version pins in install guides"
if [ -z "$PREV" ]; then
  echo "  SKIP - no previous version given"
else
  # Upgrade guides legitimately reference old versions; everything else should not.
  stale=$(grep -rnE "${PREV//./\\.}\.[0-9]+" docs/ 2>/dev/null \
          | grep -vE 'upgrade-krci-|upgrade-edp-' || true)
  if [ -n "$stale" ]; then
    echo "  FAIL - references to $PREV outside the upgrade guides:"
    echo "$stale" | sed 's/^/    /'
    fail=1
  else
    echo "  OK - no stale $PREV pins"
  fi
fi

step "3. spell-check"
if npm run spell-check >/tmp/krci-spell.log 2>&1; then
  echo "  OK - $(grep -oE 'Files checked: [0-9]+' /tmp/krci-spell.log | tail -1)"
else
  echo "  FAIL - see /tmp/krci-spell.log"; tail -15 /tmp/krci-spell.log | sed 's/^/    /'; fail=1
fi

step "4. typecheck"
if npm run typecheck >/tmp/krci-typecheck.log 2>&1; then
  echo "  OK"
else
  echo "  FAIL - see /tmp/krci-typecheck.log"; tail -15 /tmp/krci-typecheck.log | sed 's/^/    /'; fail=1
fi

step "5. build (throws on broken links)"
if npm run build >/tmp/krci-build.log 2>&1; then
  echo "  OK - static files generated"
else
  echo "  FAIL - see /tmp/krci-build.log"
  grep -iE 'broken|error' /tmp/krci-build.log | head -15 | sed 's/^/    /'
  fail=1
fi

printf '\n'
if [ $fail -eq 0 ]; then
  echo "ALL CHECKS PASSED - safe to commit"
else
  echo "CHECKS FAILED - fix the above before committing"
  exit 2
fi
