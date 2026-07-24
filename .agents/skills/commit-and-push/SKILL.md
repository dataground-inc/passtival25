---
name: commit-and-push
description: Use when a team member asks to commit and push the current repository changes. Verifies the intended diff and tests, stages only approved files, commits with a focused message, and safely pushes without force-pushing or overwriting remote work.
---

# Commit and Push

Commit only the requested change and push it safely.

## Workflow

1. Inspect `git status --short`, `git branch --show-current`, and `git diff --check`.
2. Identify untracked or unrelated files. Do not stage them without explicit approval.
3. Run the project’s focused tests. Run the full suite and build before committing when the change affects production code.
4. Stage explicit paths with `git add -- <paths>`; never use `git add -A` unless the user explicitly requests every change.
5. Commit with a concise conventional message that describes the change.
6. Fetch the target remote branch and verify the local commit can fast-forward it.
7. Push normally. Never use `--force` or `--force-with-lease` unless the user explicitly asks.

## Non-fast-forward Pushes

If a normal push is rejected:

- Fetch the remote branch and compare `HEAD...origin/<branch>`.
- Do not rebase, merge, reset, or force-push until the user approves the integration approach.
- If the local branch is based on an obsolete architecture, create a fresh branch from `origin/<branch>`, port only the requested change, verify it, then push or merge that branch.

## Completion Report

Report the commit SHA, pushed branch, verification commands/results, and any intentionally excluded files.
