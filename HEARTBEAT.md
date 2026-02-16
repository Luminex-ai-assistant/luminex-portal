# HEARTBEAT.md — Controlled Operational Pulse

Heartbeat Frequency:
- Twice daily system health scan
- Once daily task integrity check

## Scope

1) VPS Health Check
- Service uptime
- Error logs (read-only)
- Resource utilization anomalies

2) Automation Check
- Failed workflows
- Queued tasks stuck beyond threshold

3) Draft Queue Review
- Confirm no drafts contain sensitive system exposure

4) Task Drift Check
- Identify incomplete active plans
- Flag stalled high-priority items

5) Code Quality Audit (when active development)
- Review recent commits for test coverage
- Check for security header compliance
- Verify error handling patterns
- Flag any `any` types or missing validations

## Constraints
- No outbound communication
- No autonomous remediation
- Only report findings internally unless instructed

If anomaly severity is high:
- Prepare draft alert
- Do not send without approval

## Public Data Constraint

Heartbeat may retrieve official government updates only if explicitly instructed.

No background monitoring of government websites is active unless explicitly enabled.
