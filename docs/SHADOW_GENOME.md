# Shadow Genome

## Purpose

The Shadow Genome documents **failure modes** - approaches that were rejected, patterns that failed, and lessons learned. This creates institutional memory to prevent repeated mistakes.

---

## Failure Categories

| Code | Category | Description |
|------|----------|-------------|
| `COMPLEXITY_VIOLATION` | Section 4 Razor breach | Function/file too long, nesting too deep |
| `SECURITY_STUB` | Incomplete security | TODO/placeholder in auth/security code |
| `GHOST_PATH` | Disconnected UI | UI element without backend handler |
| `HALLUCINATION` | Invalid dependency | Library that doesn't exist or wasn't verified |
| `ORPHAN` | Dead code | File not connected to build path |
| `SPEC_DRIFT` | Blueprint mismatch | Implementation doesn't match specification |
| `CHAIN_BREAK` | Merkle violation | Hash chain integrity compromised |

---

## Failure Log

<!--
Each failure is documented with:
- Date and iteration
- What was attempted
- Why it failed
- Pattern to avoid
- Resolution (if any)
-->

---

### Failure #1: Genesis blueprint certified Razor compliance over a non-compliant as-built contract

**Date**: 2026-07-15T12:15:00-04:00
**Iteration**: 1 (first tribunal)
**Verdict ID**: V1 + V2, AUDIT_REPORT 7344623d
**Category**: COMPLEXITY_VIOLATION (V1), SPEC_DRIFT (V2)

#### What Was Attempted

Bootstrap-over-existing genesis sealed the as-built monorepo tree as "The Contract" while checking `[x]` on all Section 4 Razor pre-check boxes, carrying a prose caveat that pre-existing violations would route through `/qor-refactor` later. The dependency table listed only the headline stack (TypeScript, React, Vite).

#### Why It Failed

- V1 (razor-overage): four sealed files exceed the 250-line limit — `apps/tablet/src/App.tsx` (454), `packages/content-schema/src/index.ts` (386), `apps/tablet/src/ParentAccessGate.tsx` (295), `apps/tablet/src/ParentTestTools.tsx` (262); the `ParentAccessGate` component function spans ≈223 lines against the 40-line limit. A checked box plus a caveat is approval-with-warnings, which the tribunal forbids.
- V2 (dependency-unjustified): `zod`, `vite-plugin-pwa`, `vitest`, `fake-indexeddb` are installed and load-bearing but absent from the approved dependency table, leaving the "new dependencies require justification" clause without an enforceable baseline.

#### Pattern to Avoid

**Anti-Pattern**: When bootstrapping over an existing codebase, certifying governance checkboxes aspirationally ("will be true after later remediation") instead of factually.

**Correct Pattern**: Pre-check boxes state measured reality; known violations are enumerated with their remediation route named. Dependency tables are generated from installed manifests, not from memory of the headline stack.

#### Resolution

| Status | Action Taken |
|--------|--------------|
| FIXED | V1: `/qor-refactor` decomposed all four files (commit e4f5dab; 0 files > 250 lines after sweep). V2: dependency table amended to match installed manifests. Re-audit PASS (ledger Entry #4, report hash 60ceca4f), 2026-07-15. |

#### Related Entries
- Ledger Entry: #2 (GATE TRIBUNAL, VETO)
- Audit Report: `.agent/staging/AUDIT_REPORT.md` (hash 7344623d)

---

## Pattern Library (Extracted Lessons)

<!--
Aggregate lessons from failures into reusable patterns.
-->

### Section 4 Razor Violations

| Anti-Pattern | Correct Pattern | Examples |
|--------------|-----------------|----------|
| 50+ line functions | Split at 40 lines | See Failure #X |
| 4+ nesting levels | Early returns | See Failure #Y |
| Nested ternaries | Named functions | See Failure #Z |

### Security Patterns

| Anti-Pattern | Correct Pattern | Examples |
|--------------|-----------------|----------|
| TODO-style auth stub comments | Full implementation | See Failure #X |
| Hardcoded tokens | Environment vars | See Failure #Y |

### Architecture Patterns

| Anti-Pattern | Correct Pattern | Examples |
|--------------|-----------------|----------|
| God objects | Single responsibility | See Failure #X |
| Orphan files | Import tracing | See Failure #Y |

---

## Failure Statistics

| Category | Count | Last Occurrence |
|----------|-------|-----------------|
| COMPLEXITY_VIOLATION | 1 | 2026-07-15 |
| SECURITY_STUB | 0 | — |
| GHOST_PATH | 0 | — |
| HALLUCINATION | 0 | — |
| ORPHAN | 0 | — |
| SPEC_DRIFT | 1 | 2026-07-15 |
| CHAIN_BREAK | 0 | — |

**Total Failures Recorded**: 1
**Failures Resolved**: 1
**Patterns Extracted**: 1

---

## Usage Notes

1. **Add entries when**:
   - /ql-audit returns VETO
   - Implementation fails Section 4 checks
   - Dead code is discovered
   - Any rejected approach

2. **Review entries when**:
   - Starting similar work
   - Seeing repeated violations
   - Onboarding new team members

3. **Extract patterns when**:
   - Same failure type occurs 3+ times
   - A clear anti-pattern emerges

---

*Shadow Genome maintained by The QoreLogic Judge*
*"Learn from failure to prevent its repetition."*
