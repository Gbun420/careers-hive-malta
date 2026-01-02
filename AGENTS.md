# AGENTS.md — Operating Contract

## Mission
Alert-first Malta job platform. Deliver backlog tasks in order. No scope creep.

## Hard rules
- Plan first (files + acceptance criteria + risks) before editing.
- One branch per task; small commits.
- App must not crash if env vars missing: /setup gating.
- Never expose service role to browser. No NEXT_PUBLIC_.
- Role "admin" must NOT be self-selectable in production; behind feature flag or allowlist.
- After each task: lint + typecheck + update SMOKE.md + run /review.

## DoD
- Builds and runs locally.
- Lint/typecheck pass.
- Smoke steps added.
- Security gates enforced.
