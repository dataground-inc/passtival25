# PASSTIVAL Repository Instructions

These instructions are mandatory for Codex and other automated agents working in
this repository.

## Canonical worktree

- Before reading, editing, testing, committing, running a development server, or
  pushing, run `git worktree list --porcelain` and `git status --short --branch`.
- Perform current product work only in the worktree whose branch entry is
  `refs/heads/main`, or in a new feature branch created from the current
  `origin/main`.
- At the time this file was written, the canonical `main` worktree is
  `.worktrees/top5-fetch-time-main`. Treat the branch detected by Git as the
  source of truth if the path changes.
- The repository root is currently the preservation branch
  `backup/legacy-main-20260728`. Do not implement, commit, run localhost, or push
  product changes from that branch.
- Do not resume work from `feat/passtival-rebuild` or another old worktree
  without first proving that it is based on the current `origin/main`.

## Starting work

1. Fetch `origin/main` when network access is available.
2. Confirm the intended worktree and branch.
3. For `main`, require
   `git rev-list --left-right --count origin/main...HEAD` to report `0 0` before
   starting new work.
4. For a feature branch, require
   `git merge-base --is-ancestor origin/main HEAD` to succeed. If it does not,
   create a fresh branch/worktree from `origin/main`; do not continue on the
   stale branch.
5. Preserve unrelated dirty or untracked files. Never reset, stash, move, or
   delete them merely to change branches.

## Integrating and pushing

- Do not reuse long-lived feature branches after their changes have been
  integrated.
- Before cherry-picking, verify that the same change is not already present in
  `main`. A different commit SHA can still contain the same patch.
- Before pushing, fetch the remote again and run
  `git rev-list --left-right --count origin/main...HEAD`.
- A direct push to `main` is allowed only when the left count is `0`, so the
  update is a normal fast-forward. Never force-push.
- If the left count is not `0`, stop and reconcile from the latest
  `origin/main` in a clean worktree. Do not solve divergence by pushing from the
  legacy root checkout.
- Stage only files that belong to the requested change, then run the relevant
  tests and build before committing or pushing.

## Local development

- Start the development server from the same worktree that contains the code
  being verified.
- If port 5173 is already in use, inspect the served Vite module or process
  working directory. Restart it when it points to an old worktree.
- For the current canonical checkout, a served Vite module should resolve under
  `.worktrees/top5-fetch-time-main`, unless Git reports a newer canonical
  `main` worktree.

## Conflict prevention principle

The remote `origin/main` history is the integration baseline. A worktree name,
an already-running localhost process, or a branch called `feat/*` is not proof
that its code is current. Verify ancestry and divergence with Git before making
changes.
