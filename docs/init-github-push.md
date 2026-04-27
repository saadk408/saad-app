# Initialize GitHub remote and push `saad-app`

## Context

Git is already initialized in this repo:

- Branch: `main`
- One existing commit: `40c052c Initial commit from Create Next App`
- No remote configured
- `gh` CLI is installed but not authenticated
- Working tree had pending changes: `AGENTS.md` modified, `.claude/` and `docs/` untracked

So the actual work is: ignore `.claude/`, commit the rest, authenticate with GitHub, create a private `saad-app` repo, and push. No `git init` needed.

Decisions:
- Repo name: `saad-app`, **private**
- Pending changes: commit `AGENTS.md` + `docs/`, **gitignore** `.claude/`
- Auth: `gh auth login` via browser (interactive — user runs it themselves)

## Steps

### 1. Add `.claude/` to `.gitignore`
Append to `.gitignore`:

```
# claude code local settings
/.claude/
```

`.claude/settings.local.json` is per-machine; ignoring the whole dir keeps it (and any future local-only files) out of git. To share `settings.json` later, switch the rule to ignore only `/.claude/settings.local.json`.

### 2. Stage and commit pending changes
```bash
git add .gitignore AGENTS.md docs/
git status   # sanity-check: .claude/ should NOT appear
git commit -m "Add Code Intelligence guidance, docs, and ignore .claude/"
```

Staged set: `.gitignore`, `AGENTS.md`, `docs/sentry-test-lab.md`, `docs/init-github-push.md`.

### 3. Authenticate with GitHub
`gh auth login` is interactive — run from the prompt with the `!` prefix:

```
! gh auth login
```

Choose: GitHub.com → HTTPS → authenticate via browser → paste the one-time code. Verify with `gh auth status`.

### 4. Create the private repo and push
One command does create + remote + push:

```bash
gh repo create saad-app --private --source=. --remote=origin --push
```

Creates `github.com/<user>/saad-app` (private), adds it as `origin`, pushes `main`, and sets upstream.

### 5. Verify
```bash
git remote -v                 # origin should point at github.com/<user>/saad-app
git log --oneline origin/main # should show both commits
gh repo view --web            # opens the new repo in the browser
```

## Notes

- **Auth step must be user-driven** — `gh auth login` is interactive.
- **`bun.lock` is already tracked** by the initial commit.
- **No `git init`, no `git branch -m`** — already on `main`.
