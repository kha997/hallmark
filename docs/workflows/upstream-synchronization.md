# Upstream Synchronization

## Remotes

```text
origin   https://github.com/kha997/hallmark.git
upstream https://github.com/Nutlope/hallmark.git
```

Verify before synchronizing:

```bash
git remote -v
git status --short --branch
```

## Fast-forward synchronization

Use a fast-forward update only when the fork's `main` has not diverged:

```bash
git fetch upstream
git checkout main
git merge --ff-only upstream/main
git push origin main
```

`--ff-only` is a safety gate. If it refuses, do not force-push or rewrite
custom history.

## Diverged synchronization

When upstream and the fork both contain new commits:

```bash
git fetch upstream
git checkout main
git checkout -b upstream-sync/YYYY-MM-DD
git merge upstream/main
```

Resolve conflicts on the synchronization branch, run the full validation
suite, push the branch, and open a PR into `main`.

Expected conflict hotspots are upstream-owned compatibility surfaces:

```text
README.md
ROADMAP.md
package.json
skills/hallmark/SKILL.md
skills/hallmark/references/
site/
vercel.json
```

Prefer keeping platform additions in new additive paths. Changes to upstream
surfaces should be narrow, documented, and protected by compatibility tests.

## Pre-merge verification

```bash
npm run validate
npm test
git diff --check
```

Review changes to protected surfaces explicitly:

```bash
git diff main...HEAD -- skills/hallmark/SKILL.md
git diff main...HEAD -- skills/hallmark/references
git diff main...HEAD -- site
```

## Prohibited synchronization techniques

- Do not force-push `main`.
- Do not use `git reset --hard` to replace fork history.
- Do not delete fork customizations to make an upstream merge easier.
- Do not mix upstream synchronization with unrelated platform development.
