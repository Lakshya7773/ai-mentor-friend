# PROACTIVITY ARCHITECTURE

## Status: IMPLEMENTED + TESTED (evaluation only)

Hybrid proactivity. Event types: commitment_due, goal_checkin, user_reminder, inactivity_checkin, weekly_reflection.

Events are evaluated deterministically when app opens or conversation begins. No notifications sent yet. No cloud infrastructure. No scheduler daemon. Local-first. Duplicate prevention via seen-set.