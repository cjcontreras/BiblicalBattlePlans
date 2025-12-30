# PR Validation & Version Preview Guide

## Overview

This repository uses an automated PR validation system that ensures all pull requests follow conventional commit standards and provides immediate feedback on version impacts.

## What Happens When You Open a PR

### 1. Automatic Validation Runs

Within seconds of opening or editing a PR, the `pr-validation.yml` workflow runs and:

- ✅ Validates your PR title format
- 📊 Calculates the version bump
- 💬 Posts a comment with details
- 🏷️ Adds a version label
- ❌ Blocks merge if invalid

### 2. Success Scenario

**Your PR Title:**
```
feat: Add dark mode toggle to settings
```

**Bot Comment:**
```
🟡 Version Bump Preview

PR Title: `feat: Add dark mode toggle to settings`

✅ Valid conventional commit format detected!

Version Change
───────────────
1.5.3 → 1.6.0

Bump Type: MINOR

───────────────────────────────────────────────────

When this PR is merged, the version bump workflow will automatically:
1. Create a new branch with the version change
2. Update package.json to version 1.6.0
3. Create a PR for the version bump
4. Auto-merge (if configured) or wait for manual approval
```

**Status Check:** ✅ PASSED  
**Label Added:** `version: minor`  
**Can Merge:** Yes (after code review)

---

### 3. Failure Scenario

**Your PR Title:**
```
Update stuff
```

**Bot Comment:**
```
❌ Invalid PR Title Format

Current PR Title: `Update stuff`

⚠️ This PR title does not follow the conventional commit format.

Required Format
───────────────
<type>: <description>

Valid Types
───────────

Type          | Version Bump | Use Case
─────────────|──────────────|─────────────────────────────
BREAKING:     | MAJOR (X.0.0)| Breaking changes
feat:         | MINOR (x.Y.0)| New features
fix:          | PATCH (x.y.Z)| Bug fixes
chore:        | PATCH (x.y.Z)| Maintenance
docs:         | PATCH (x.y.Z)| Documentation
... and more

Examples
────────
✅ feat: Add dark mode toggle to settings
✅ fix: Resolve streak calculation bug
✅ chore: Update dependencies
✅ BREAKING: Remove deprecated API endpoints

❌ Update stuff
❌ Fixed bug
❌ WIP

Action Required
───────────────
Please update your PR title by clicking "Edit" above.
```

**Status Check:** ❌ FAILED  
**Can Merge:** No - validation must pass first

---

## How to Fix an Invalid PR Title

### Option 1: Edit Directly on GitHub (Easiest)

1. Go to your PR page
2. Click the **"Edit"** button next to the PR title (top of page)
3. Update to a valid format: `<type>: <description>`
4. Click **"Save"**
5. Validation re-runs automatically

### Option 2: Using GitHub CLI

```bash
gh pr edit <PR_NUMBER> --title "feat: Add new feature"
```

### Option 3: Close and Reopen with New Title

```bash
# Update your branch name if needed
git branch -m old-name new-name

# Push and create new PR with correct title
git push origin new-name
```

---

## Version Bump Types Reference

### 🔴 MAJOR (X.0.0) - Breaking Changes

**When to use:**
- Removing features or APIs
- Changing existing behavior in incompatible ways
- Database schema changes that require migration
- Changing function signatures

**PR Title Formats:**
```
BREAKING: Remove deprecated authentication endpoints
major: Redesign database schema
feat: New auth system (BREAKING CHANGE in description)
```

**Example:** `1.5.3` → `2.0.0`

---

### 🟡 MINOR (x.Y.0) - New Features

**When to use:**
- Adding new features
- Adding new API endpoints
- Adding new components or pages
- Enhancing existing features (backwards-compatible)

**PR Title Formats:**
```
feat: Add dark mode toggle
feature: Implement user profile statistics
feat: Add export to PDF functionality
```

**Example:** `1.5.3` → `1.6.0`

---

### 🟢 PATCH (x.y.Z) - Fixes & Maintenance

**When to use:**
- Bug fixes
- Documentation updates
- Code refactoring (no behavior change)
- Dependency updates
- Performance improvements
- Test additions
- Style/formatting changes

**PR Title Formats:**
```
fix: Resolve streak calculation bug
chore: Update dependencies
docs: Add installation guide
refactor: Simplify auth logic
perf: Optimize database queries
test: Add unit tests
style: Format with Prettier
```

**Example:** `1.5.3` → `1.5.4`

---

## Version Labels

The validation workflow automatically adds labels to your PR:

| Label | Meaning | Color |
|-------|---------|-------|
| `version: major` | Breaking change - MAJOR bump | 🔴 Red |
| `version: minor` | New feature - MINOR bump | 🟡 Yellow |
| `version: patch` | Fix/maintenance - PATCH bump | 🟢 Green |

These labels:
- ✅ Provide visual indication of impact
- ✅ Help with filtering and organization
- ✅ Update automatically if you change the PR title

---

## Advanced: Multiple Commits in One PR

**Question:** My PR has multiple commits with different types. Which one counts?

**Answer:** The **PR title** determines the version bump, not individual commits.

**Example:**
```bash
# Your PR contains these commits:
git commit -m "refactor: Extract auth logic"
git commit -m "feat: Add password reset"
git commit -m "test: Add tests for password reset"

# PR title should reflect the most significant change:
PR Title: "feat: Add password reset functionality"

# Result: MINOR version bump
```

**Best Practice:** Choose the type that represents the most significant user-facing change.

---

## Skipping Version Bumps

### When to Skip

Very rarely, you might want to skip a version bump:
- Documentation-only changes (though `docs:` gives a patch bump)
- CI/CD configuration that doesn't affect the app
- Internal tooling changes

### How to Skip

Add `[skip-version]` to your **merge commit message** (not PR title):

```bash
# When merging via command line:
git merge --no-ff feature-branch -m "feat: Add feature [skip-version]"

# Or in GitHub's merge box, add [skip-version] to the commit message
```

**Note:** The PR validation will still run and require a valid title. The skip only affects the version bump workflow after merge.

---

## Workflow Integration

### What Happens After Merge

1. **PR is merged** to `main` with valid conventional commit title
2. **Version bump workflow triggers** (within seconds)
3. **Workflow analyzes** the merge commit message
4. **New version calculated** based on PR title type
5. **Version bump branch created** (`version-bump-X.Y.Z`)
6. **package.json updated** with new version
7. **Version bump PR created** automatically
8. **PR auto-merges** (if `GH_PAT` configured) or waits for manual merge

### Monitoring

You can monitor the process:
- **Actions tab** - See workflow runs in real-time
- **Pull Requests** - Version bump PRs appear automatically
- **Releases** - (Future) Automatic release creation

---

## Troubleshooting

### Validation Keeps Failing

**Check:**
1. Is your PR title in the format `<type>: <description>`?
2. Is the type one of the valid types? (feat, fix, chore, docs, etc.)
3. Is there a colon `:` after the type?
4. Is there a space after the colon?

**Valid:**
```
feat: Add feature
fix: Resolve bug
chore: Update deps
```

**Invalid:**
```
feat:Add feature        (missing space)
feat - Add feature      (wrong separator)
Add feature             (missing type)
feature: Add feature    (use 'feat' not 'feature')
```

### Bot Comment Not Updating

**Try:**
1. Wait 30 seconds and refresh
2. Make a small commit to trigger re-validation
3. Close and reopen the PR
4. Check the Actions tab for workflow status

### Wrong Version Bump Type

**Solution:**
Simply edit your PR title to the correct type. The bot will:
- Re-validate immediately
- Update the comment
- Change the label
- Update the status check

---

## Benefits of This System

### For Developers
- ✅ **Immediate feedback** - Know the impact before merge
- ✅ **Clear guidance** - Helpful error messages
- ✅ **No surprises** - Version changes are predictable
- ✅ **Learning tool** - Teaches conventional commits

### For the Project
- ✅ **Consistent versioning** - No manual version decisions
- ✅ **Semantic versioning** - Follows semver automatically
- ✅ **Clear changelog** - PR titles become release notes
- ✅ **Quality control** - Enforces standards

### For Users
- ✅ **Predictable releases** - Version numbers have meaning
- ✅ **Clear communication** - Know what changed in each version
- ✅ **Confidence** - MAJOR versions signal breaking changes

---

## Related Documentation

- [Conventional Commits Guide](CONVENTIONAL_COMMITS.md) - Detailed commit format guide
- [Branch Protection Rules](BRANCH_PROTECTION.md) - PR workflow and protection setup
- [Issue #23 Implementation](ISSUE_23_IMPLEMENTATION.md) - Technical implementation details

## External Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    PR TITLE QUICK REFERENCE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Format:  <type>: <description>                             │
│                                                              │
│  Types:                                                      │
│  ┌──────────────┬──────────────┬────────────────────────┐  │
│  │ Type         │ Version      │ Use For                │  │
│  ├──────────────┼──────────────┼────────────────────────┤  │
│  │ BREAKING:    │ MAJOR (X.0.0)│ Breaking changes       │  │
│  │ feat:        │ MINOR (x.Y.0)│ New features           │  │
│  │ fix:         │ PATCH (x.y.Z)│ Bug fixes              │  │
│  │ chore:       │ PATCH (x.y.Z)│ Maintenance            │  │
│  │ docs:        │ PATCH (x.y.Z)│ Documentation          │  │
│  │ style:       │ PATCH (x.y.Z)│ Formatting             │  │
│  │ refactor:    │ PATCH (x.y.Z)│ Code restructuring     │  │
│  │ perf:        │ PATCH (x.y.Z)│ Performance            │  │
│  │ test:        │ PATCH (x.y.Z)│ Tests                  │  │
│  └──────────────┴──────────────┴────────────────────────┘  │
│                                                              │
│  Examples:                                                   │
│  ✅ feat: Add dark mode toggle                              │
│  ✅ fix: Resolve login timeout issue                        │
│  ✅ chore: Update React to v19                              │
│  ✅ BREAKING: Remove deprecated API                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

