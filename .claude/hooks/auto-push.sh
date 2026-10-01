#!/usr/bin/env bash
# Stop hook: when Claude finishes a reply, commit any changes and push them to GitHub.
# Never blocks Claude; failures are only reported on stderr.

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch=$(git symbolic-ref --short HEAD 2>/dev/null) || exit 0

# Commit whatever changed during the reply
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  changed=$(git diff --cached --name-only | head -5 | paste -sd ', ' -)
  git commit -q -m "Auto-save: $changed

Co-Authored-By: Claude <noreply@anthropic.com>" || exit 0
fi

# Push if the branch has commits GitHub doesn't have yet
if [ -z "$(git rev-parse --abbrev-ref '@{u}' 2>/dev/null)" ] || [ -n "$(git log '@{u}..' --oneline 2>/dev/null)" ]; then
  for delay in 0 2 4 8; do
    sleep "$delay"
    git push -q -u origin "$branch" 2>/dev/null && exit 0
  done
  echo "auto-push: could not push $branch to GitHub" >&2
fi
exit 0
