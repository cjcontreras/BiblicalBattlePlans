# Conventional Commits Guide

This project uses **Conventional Commits** to automatically determine version bumps and maintain a clear commit history.

## What are Conventional Commits?

Conventional Commits is a specification for adding human and machine-readable meaning to commit messages. It provides an easy set of rules for creating an explicit commit history.

## Format

```
<type>: <description>

[optional body]

[optional footer(s)]
```

## Commit Types and Version Bumping

### 🔴 MAJOR Version Bump (X.0.0) - Breaking Changes

Use when you make **incompatible API changes** or **breaking changes** to existing functionality.

**Keywords:**
- `BREAKING CHANGE:` in commit message or footer
- `BREAKING:` prefix
- `major:` prefix

**Examples:**
```bash
# In PR title or commit message:
BREAKING: Remove deprecated authentication endpoints
major: Redesign database schema
feat: Add new auth system (BREAKING CHANGE)

# In commit body/footer:
feat: Update user profile API

BREAKING CHANGE: The user profile endpoint now requires authentication
```

**Result:** `1.5.3` → `2.0.0`

---

### 🟡 MINOR Version Bump (x.Y.0) - New Features

Use when you **add new features** or functionality in a backwards-compatible manner.

**Types:**
- `feat:` - A new feature
- `feature:` - A new feature (alternative)

**Examples:**
```bash
feat: Add dark mode toggle to settings
feat: Implement user profile statistics
feature: Add export to PDF functionality
feat(auth): Add Google OAuth integration
```

**Result:** `1.5.3` → `1.6.0`

---

### 🟢 PATCH Version Bump (x.y.Z) - Fixes & Maintenance

Use for **bug fixes**, **documentation**, and **maintenance** that don't add new features.

**Types:**
- `fix:` - A bug fix
- `bugfix:` - A bug fix (alternative)
- `patch:` - A small patch or fix
- `chore:` - Maintenance tasks (dependencies, build, etc.)
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, missing semi-colons, etc.)
- `refactor:` - Code refactoring without changing functionality
- `perf:` - Performance improvements
- `test:` - Adding or updating tests

**Examples:**
```bash
fix: Correct login button alignment
bugfix: Resolve streak calculation error
chore: Update dependencies to latest versions
docs: Add installation instructions to README
style: Format code according to ESLint rules
refactor: Simplify user authentication logic
perf: Optimize database queries for dashboard
test: Add unit tests for reading plan component
```

**Result:** `1.5.3` → `1.5.4`

---

## Scopes (Optional)

You can add a **scope** to provide additional context:

```bash
feat(auth): Add password reset functionality
fix(dashboard): Correct streak display bug
docs(api): Update endpoint documentation
chore(deps): Bump react from 18.2.0 to 19.0.0
```

**Common scopes for this project:**
- `auth` - Authentication related
- `dashboard` - Dashboard page
- `plans` - Reading plans
- `profile` - User profile
- `api` - API/backend changes
- `ui` - UI components
- `deps` - Dependencies

---

## PR Title Guidelines

Since all changes go through PRs, your **PR title** should follow conventional commit format:

### ✅ Good PR Titles

```
feat: Add streak shield functionality
fix: Resolve incorrect chapter count in M'Cheyne plan
chore: Update Supabase client to v2.39.0
docs: Add branch protection setup guide
BREAKING: Remove legacy authentication system
```

### ❌ Bad PR Titles

```
Update stuff
Fixed bug
WIP
Changes
Merge branch 'feature' into main
```

---

## How It Works with Version Bumping

### Step-by-Step Process

1. **You create a PR** with a conventional commit title
   ```
   feat: Add dark mode toggle
   ```

2. **PR validation runs automatically** (within seconds)
   - ✅ Validates the title format
   - 💬 Posts a comment with version preview
   - 🏷️ Adds a version label
   - ❌ Blocks merge if invalid

3. **You see immediate feedback** in the PR comments:
   ```
   🟡 Version Bump Preview
   
   PR Title: `feat: Add dark mode toggle`
   ✅ Valid conventional commit format detected!
   
   Version Change: 1.5.3 → 1.6.0
   Bump Type: MINOR
   ```

4. **PR gets reviewed and merged** to `main`

5. **Version bump workflow triggers** and analyzes the merge commit message

6. **Version is bumped** according to the commit type:
   - `BREAKING` or `major:` → MAJOR bump
   - `feat:` or `feature:` → MINOR bump
   - `fix:`, `chore:`, `docs:`, etc. → PATCH bump

7. **Workflow creates a version bump PR** automatically

8. **Version bump PR is merged** (manually or auto-merged if configured)

---

## Examples by Scenario

### Scenario 1: Adding a New Feature

```bash
# Create branch
git checkout -b feat/dark-mode

# Make changes and commit
git commit -m "feat: Add dark mode toggle to settings"

# Push and create PR with title:
"feat: Add dark mode toggle to settings"

# Result after merge: 1.5.3 → 1.6.0
```

### Scenario 2: Fixing a Bug

```bash
# Create branch
git checkout -b fix/streak-calculation

# Make changes and commit
git commit -m "fix: Correct streak calculation for timezone edge cases"

# Push and create PR with title:
"fix: Correct streak calculation for timezone edge cases"

# Result after merge: 1.6.0 → 1.6.1
```

### Scenario 3: Breaking Change

```bash
# Create branch
git checkout -b breaking/new-auth

# Make changes and commit
git commit -m "feat: Implement new authentication system

BREAKING CHANGE: Old auth tokens are no longer valid.
Users will need to re-authenticate."

# Push and create PR with title:
"BREAKING: Implement new authentication system"

# Result after merge: 1.6.1 → 2.0.0
```

### Scenario 4: Multiple Commits in One PR

If your PR has multiple commits, the **PR title** determines the version bump:

```bash
# PR contains these commits:
git commit -m "refactor: Extract auth logic to separate file"
git commit -m "feat: Add password reset functionality"
git commit -m "test: Add tests for password reset"

# PR title should reflect the most significant change:
"feat: Add password reset functionality"

# Result after merge: 1.6.1 → 1.7.0
```

---

## Quick Reference

| Type | Description | Version Bump | Example |
|------|-------------|--------------|---------|
| `BREAKING:` or `major:` | Breaking changes | MAJOR (X.0.0) | `BREAKING: Remove old API` |
| `feat:` | New feature | MINOR (x.Y.0) | `feat: Add dark mode` |
| `fix:` | Bug fix | PATCH (x.y.Z) | `fix: Resolve login issue` |
| `chore:` | Maintenance | PATCH (x.y.Z) | `chore: Update dependencies` |
| `docs:` | Documentation | PATCH (x.y.Z) | `docs: Update README` |
| `style:` | Code formatting | PATCH (x.y.Z) | `style: Format with Prettier` |
| `refactor:` | Code refactoring | PATCH (x.y.Z) | `refactor: Simplify auth logic` |
| `perf:` | Performance | PATCH (x.y.Z) | `perf: Optimize queries` |
| `test:` | Tests | PATCH (x.y.Z) | `test: Add unit tests` |

---

## Automated PR Validation

### ✅ PR Title Validation (Enabled)

We have a GitHub Action that automatically validates PR titles and provides feedback:

**File:** `.github/workflows/pr-validation.yml`

**What it does:**
1. ✅ **Validates** your PR title against conventional commit format
2. 📊 **Shows version preview** - tells you exactly what version bump will occur
3. 💬 **Posts a comment** with the current → new version
4. 🏷️ **Adds labels** (`version: major`, `version: minor`, or `version: patch`)
5. ❌ **Blocks merge** if the title is invalid

**Example Success Comment:**
```
🟡 Version Bump Preview

PR Title: `feat: Add dark mode toggle`

✅ Valid conventional commit format detected!

Version Change: 1.5.3 → 1.6.0
Bump Type: MINOR
```

**Example Failure Comment:**
```
❌ Invalid PR Title Format

Current PR Title: `Update stuff`

⚠️ This PR title does not follow the conventional commit format.

Please update your PR title to match: <type>: <description>
```

### Benefits

- 🚫 **No invalid PRs** - Validation runs before merge
- 📈 **Clear expectations** - See version impact immediately
- 🔄 **Auto-updates** - Comment updates when you edit the PR title
- 📚 **Helpful guidance** - Links to documentation in every comment

---

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)

---

## Troubleshooting PR Validation

### "PR title does not follow conventional commit format"

**Problem:** Your PR title was rejected by the validation workflow.

**Solution:** Edit your PR title to match the format: `<type>: <description>`

**How to edit:**
1. Go to your PR on GitHub
2. Click the "Edit" button next to the PR title
3. Update to a valid format (e.g., `feat: Add new feature`)
4. Save - the validation will re-run automatically

### "Which type should I use?"

**Decision tree:**
1. **Does it break existing functionality?** → `BREAKING:` or `major:`
2. **Does it add new functionality?** → `feat:`
3. **Does it fix a bug?** → `fix:`
4. **Is it maintenance/docs/style?** → `chore:`, `docs:`, `style:`, etc.

When in doubt, ask yourself: "If I were a user, would I want this in a new version (minor) or just a patch?"

### "The bot comment is outdated"

**Problem:** You edited your PR title but the bot comment still shows old information.

**Solution:** The workflow should re-run automatically. If it doesn't:
1. Make a small commit to the PR (triggers re-validation)
2. Or close and reopen the PR
3. Or wait a minute and refresh the page

### "I want to skip version bumping"

**Problem:** You have a PR that shouldn't trigger a version bump.

**Solution:** Version bumps happen for all merges to `main`. If you truly need to skip:
1. Add `[skip-version]` to the merge commit message
2. Or merge with a commit message starting with `chore: bump version`

**Note:** This should be rare. Most changes warrant a version bump.

## Questions?

If you're still unsure:
- Check the [Quick Reference](#quick-reference) table above
- Look at [Examples by Scenario](#examples-by-scenario)
- Review existing PRs in the repository
- Ask in the PR comments - reviewers can help!

