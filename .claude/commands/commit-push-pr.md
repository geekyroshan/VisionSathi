# Commit, Push, and Create PR

Automated workflow for completing a feature or fix.

## Steps

1. Stage all relevant changes (exclude sensitive files)
2. Generate commit message from diff summary
3. Push to current branch with upstream tracking
4. Create PR with summary of changes

## Commit Message Format

```
<type>: <short description>

<bullet points of changes>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## PR Template

```markdown
## Summary
<1-3 bullet points summarizing the changes>

## Changes
<List of files changed and what was modified>

## Test Plan
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Accessibility tested with VoiceOver/TalkBack
- [ ] Offline mode tested

---
Generated with Claude Code
```
