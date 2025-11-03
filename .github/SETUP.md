# GitHub Actions Setup Guide

Quick guide to set up CI/CD for BusTrack SV Backend.

## 📋 Prerequisites

- GitHub repository created
- Code pushed to repository
- Admin access to repository settings

## 🚀 Quick Setup

### 1. Enable GitHub Actions

GitHub Actions should be enabled by default. If not:

1. Go to **Settings** → **Actions** → **General**
2. Under "Actions permissions", select:
   - ✓ **Allow all actions and reusable workflows**
3. Click **Save**

### 2. Add Codecov Token (Optional)

For coverage reporting with Codecov:

**Step 1: Get Codecov Token**
1. Visit [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Add your repository
4. Copy the upload token

**Step 2: Add Secret to GitHub**
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `CODECOV_TOKEN`
4. Value: Paste your Codecov token
5. Click **Add secret**

**Note**: CI will work without Codecov token. Coverage will be stored as GitHub artifact instead.

### 3. Verify Workflow File

Ensure `.github/workflows/ci.yml` exists in your repository:

```bash
# Check if file exists
ls -la .github/workflows/ci.yml

# Or on Windows
dir .github\workflows\ci.yml
```

### 4. Trigger First Run

**Option 1: Push to main/develop**
```bash
git add .
git commit -m "Add CI workflow"
git push origin main
```

**Option 2: Create Pull Request**
```bash
git checkout -b feature/test-ci
git push origin feature/test-ci
# Create PR on GitHub
```

### 5. Check Workflow Status

1. Go to repository on GitHub
2. Click **Actions** tab
3. See running/completed workflows
4. Click on workflow run for details

## ✅ Verify Setup

### Check Workflow Runs

**Success indicators:**
- ✓ Green checkmark on workflow run
- ✓ All jobs completed successfully
- ✓ Badge shows "passing" status

**Example successful run:**
```
✓ Lint      (45s)
✓ Test      (2m 15s)
✓ Build     (1m 30s)
```

### View Coverage Report

**Option 1: Codecov** (if token configured)
- Visit: https://app.codecov.io/gh/YOUR_USERNAME/REPO_NAME
- View coverage trends and reports

**Option 2: GitHub Artifact**
- Go to workflow run
- Scroll to "Artifacts" section
- Download `coverage-report`
- Extract and open `index.html`

### Add Badge to README

The README already includes:
```markdown
[![CI](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/ci.yml)
```

Update `USERNAME` and `REPO` with your details.

## 🔧 Configuration Options

### Customize Branch Protection

Require CI to pass before merging:

1. Go to **Settings** → **Branches**
2. Click **Add rule** or edit existing rule
3. Branch name pattern: `main`
4. Enable:
   - ✓ **Require status checks to pass before merging**
   - ✓ **Require branches to be up to date before merging**
5. Select status checks:
   - ✓ **Lint**
   - ✓ **Test**
6. Click **Create** or **Save changes**

### Auto-Cancel Old Runs

Save workflow minutes by canceling outdated runs:

1. Go to **Settings** → **Actions** → **General**
2. Under "Fork pull request workflows from outside collaborators":
   - ✓ **Cancel workflow runs on new commits**
3. Click **Save**

### Adjust Workflow Triggers

Edit `.github/workflows/ci.yml`:

```yaml
# Run on more branches
on:
  push:
    branches:
      - main
      - develop
      - staging  # Add more branches
  pull_request:
    branches:
      - main
      - develop

# Run on specific paths only
on:
  push:
    paths:
      - 'backend/**'
      - '.github/workflows/**'
```

## 🐛 Troubleshooting

### Workflow Not Running

**Problem**: No workflow runs appear

**Solutions:**
1. Check workflow file location: `.github/workflows/ci.yml`
2. Verify YAML syntax: Use [YAML Linter](https://www.yamllint.com/)
3. Check branch name matches trigger configuration
4. Ensure Actions are enabled in Settings

### Lint Job Failing

**Problem**: ESLint errors in CI

**Solution:**
```bash
# Run locally first
npm run lint

# Auto-fix issues
npm run lint:fix

# Commit and push
git add .
git commit -m "Fix linting issues"
git push
```

### Test Job Failing

**Problem**: Tests pass locally but fail in CI

**Solutions:**
1. **Missing dependencies**: Ensure all deps in `package.json`
   ```bash
   npm install --save-dev <missing-package>
   ```

2. **Environment differences**: Check Node version matches
   ```bash
   node --version  # Should be 18.x
   ```

3. **Firestore Emulator issues**: Emulator auto-starts in CI
   - Check emulator logs in workflow run
   - Increase timeout if needed

4. **Flaky tests**: Add retry logic or fix race conditions

### Coverage Upload Failing

**Problem**: Codecov upload errors

**Solutions:**
1. Verify `CODECOV_TOKEN` secret is set correctly
2. Check token hasn't expired
3. CI continues even if upload fails (non-blocking)

### Build Job Not Running

**Problem**: Build job skipped

**Expected**: Build job only runs on push to `main` branch

**To run build on PR**: Edit workflow file:
```yaml
build:
  if: always()  # Remove branch condition
```

## 📊 Monitoring

### View Workflow History

**Actions Tab → All workflows**
- See all runs for all branches
- Filter by status (success, failure, cancelled)
- Filter by branch
- Filter by trigger event

### Workflow Insights

**Actions Tab → Workflows → CI → View workflow**
- Success rate over time
- Average run duration
- Most common failures

### Email Notifications

GitHub sends emails on workflow failures by default.

**Disable notifications:**
1. Go to **Settings** (your profile)
2. **Notifications** → **Actions**
3. Uncheck notification types

## 🔐 Security Best Practices

### 1. Protect Secrets

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly

### 2. Review Workflow Changes

- Review PRs that modify `.github/workflows/`
- Untrusted workflows could expose secrets

### 3. Limit Workflow Permissions

Current workflow uses minimal permissions:
- Read repository code
- Write artifacts

Avoid `write-all` permissions.

### 4. Pin Action Versions

Use specific versions instead of `@latest`:
```yaml
- uses: actions/checkout@v4      # Good ✓
- uses: actions/checkout@latest  # Bad ✗
```

## 📈 Optimization Tips

### 1. Use npm ci Instead of npm install

Already configured ✓
```yaml
- run: npm ci  # Faster, more reliable
```

### 2. Cache Dependencies

Already configured ✓
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

Saves ~2-4 minutes per run!

### 3. Run Jobs in Parallel

Independent jobs can run in parallel:
```yaml
jobs:
  lint:
    # No dependencies
  
  test:
    needs: lint  # Runs after lint
```

### 4. Conditional Job Execution

Only run expensive jobs when needed:
```yaml
build:
  if: github.ref == 'refs/heads/main'  # Only on main
```

## 🎯 Next Steps

### Add More Workflows

1. **Deploy Workflow**: Auto-deploy on merge to main
2. **Release Workflow**: Create GitHub releases
3. **Security Scanning**: CodeQL analysis
4. **Dependency Updates**: Dependabot PRs

### Improve Test Coverage

1. Set higher coverage thresholds
2. Add more unit tests
3. Add API integration tests with Supertest

### Performance Monitoring

1. Add performance benchmarks
2. Track build times
3. Monitor workflow efficiency

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Codecov Integration](https://docs.codecov.com/docs/github-actions)

## 💬 Support

If you encounter issues:
1. Check [workflow README](./workflows/README.md)
2. Review workflow run logs
3. Search GitHub Actions community forums
4. Check repository Issues tab
