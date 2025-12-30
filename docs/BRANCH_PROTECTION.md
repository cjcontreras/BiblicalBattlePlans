# Branch Protection Rules Configuration

This document outlines the branch protection rules and code ownership structure for the BiblicalBattlePlans repository.

## Overview

Branch protection rules ensure code quality and stability by:
- Preventing direct pushes to protected branches
- Requiring code review before merging
- Enforcing automated checks and tests
- Maintaining a clear audit trail of changes

## CODEOWNERS

We use a `CODEOWNERS` file to automatically assign reviewers based on the files changed in a PR.

**Location:** `.github/CODEOWNERS`

**Current Structure:**
- **Default Owner:** @cjcontreras (owns all files unless specified otherwise)
- **Database Migrations:** @cjcontreras (critical changes requiring careful review)
- **GitHub Actions:** @cjcontreras (CI/CD workflow changes)
- **Configuration Files:** @cjcontreras (build and deployment configs)
- **Dependencies:** @cjcontreras (package.json and lock files)
- **Documentation:** @cjcontreras (all markdown and docs)

## Branch Protection Configuration

### Target Branch: `main`

Follow these steps to configure branch protection rules on GitHub:

### Step 1: Access Branch Protection Settings

1. Navigate to the repository on GitHub
2. Click **Settings** → **Branches**
3. Under "Branch protection rules", click **Add rule** or edit the existing rule for `main`

### Step 2: Configure Protection Rules

#### Basic Settings
- **Branch name pattern:** `main`

#### Pull Request Requirements
✅ **Require a pull request before merging**
  - ✅ **Require approvals:** Set to **1** (minimum)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ✅ **Require review from Code Owners**

#### Status Checks (Optional - configure as needed)
- ⬜ **Require status checks to pass before merging**
  - If you have CI/CD tests, add them here
  - Example: `build`, `test`, `lint`

#### Additional Settings
✅ **Require conversation resolution before merging**
✅ **Require linear history** (optional - enforces rebase or squash merging)
✅ **Do not allow bypassing the above settings**
  - This ensures even administrators must follow the rules
  - **Important:** You may want to leave this unchecked initially for flexibility

#### Force Push and Deletion Protection
✅ **Do not allow force pushes**
✅ **Allow deletions** - Leave **UNCHECKED** (prevent branch deletion)

### Step 3: Save Changes

Click **Create** or **Save changes** at the bottom of the page.

## Working with Branch Protection

### For Developers

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-feature
   # or: fix/bug-name, chore/task-name, etc.
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # Use conventional commit format - see CONVENTIONAL_COMMITS.md
   ```

3. **Push to GitHub:**
   ```bash
   git push origin feature/my-feature
   ```

4. **Create a Pull Request:**
   - Go to GitHub and create a PR from your branch to `main`
   - **Important:** Use a conventional commit format for the PR title
     - `feat:` for new features → MINOR version bump
     - `fix:` for bug fixes → PATCH version bump
     - `BREAKING:` for breaking changes → MAJOR version bump
   - **Automatic validation:** A bot will comment showing the version bump preview
   - If your PR title is invalid, the check will fail with helpful guidance
   - Code owners will automatically be requested for review
   - Address any review comments

5. **Merge after approval:**
   - Once approved, the PR can be merged
   - The branch will be automatically deleted (if configured)
   - Version bump workflow will trigger based on your PR title

**See [Conventional Commits Guide](CONVENTIONAL_COMMITS.md) for detailed commit message guidelines.**

### For Automated Version Bumps

The `version-bump.yml` workflow has been updated to work with branch protection:

1. **Automatic PR Creation:** Instead of pushing directly to `main`, the workflow creates a PR
2. **Auto-merge (with PAT):** If a Personal Access Token (PAT) is configured, the PR can be auto-merged
3. **Manual Review Option:** Without a PAT, the version bump PR requires manual review and merge

#### Setting up Auto-merge for Version Bumps

To enable automatic merging of version bump PRs:

1. **Create a Personal Access Token (PAT):**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Click "Generate new token"
   - Set the following:
     - **Name:** BiblicalBattlePlans Version Bump
     - **Expiration:** 90 days (or as needed)
     - **Repository access:** Only select repositories → BiblicalBattlePlans
     - **Permissions:**
       - Contents: Read and write
       - Pull requests: Read and write
       - Workflows: Read and write

2. **Add PAT to Repository Secrets:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - **Name:** `GH_PAT`
   - **Value:** Paste your PAT
   - Click "Add secret"

3. **Configure Auto-merge Settings:**
   - The workflow will automatically enable auto-merge for version bump PRs
   - PRs will merge once all required checks pass and approvals are received

#### Alternative: Manual Version Bump Approval

If you prefer manual control:
- Don't set up the `GH_PAT` secret
- Version bump PRs will be created automatically
- Review and merge them manually when ready

## Bypassing Protection (Emergency Use Only)

If you need to bypass branch protection in an emergency:

1. Go to Settings → Branches → Edit the `main` rule
2. Temporarily uncheck "Do not allow bypassing the above settings"
3. Make your emergency change
4. **Immediately re-enable the protection**

**Note:** This should only be used in critical situations (e.g., production outage, security vulnerability).

## Testing Branch Protection

After setting up, test the configuration:

1. Try to push directly to `main`:
   ```bash
   git checkout main
   git commit --allow-empty -m "test: direct push"
   git push origin main
   ```
   **Expected:** Push should be rejected

2. Create a PR and verify:
   - Code owners are automatically requested for review
   - PR cannot be merged without approval
   - All required status checks must pass

## Troubleshooting

### "Required status checks are failing"
- Check the Actions tab for failed workflows
- Fix the issues in your branch and push again

### "Review required from code owners"
- Ensure the code owner has reviewed and approved the PR
- Check that the CODEOWNERS file is correctly configured

### "Cannot push to protected branch"
- This is expected! Create a PR instead of pushing directly

### Version bump workflow fails
- Check that the `GH_PAT` secret is set (if using auto-merge)
- Verify the token has the correct permissions
- Check the Actions tab for detailed error logs

## Related Files

- `.github/CODEOWNERS` - Code ownership definitions
- `.github/workflows/version-bump.yml` - Automated version bumping workflow

## References

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)

