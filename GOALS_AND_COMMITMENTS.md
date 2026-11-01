# GOALS AND COMMITMENTS

## Status: IMPLEMENTED + TESTED

## Goals
A goal is a long-term objective with milestones, progress, target date, and status.

Statuses: active, completed, abandoned, archived.
Valid transitions: active→{completed,abandoned,archived}; completed→archived; abandoned→archived.

## Commitments
A commitment is an explicit user intention ("I will call my father this Sunday"). Distinct from goals.

Statuses: pending, done, missed, cancelled. History preserved (record never auto-deleted).

## Rules
- AI must never silently create/modify/delete goals or commitments.
- State changes must be explicit and auditable.
- Commitments can link to a goal via goalId.