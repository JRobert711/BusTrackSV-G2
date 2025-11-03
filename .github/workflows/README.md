# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## 📋 Workflows

### CI Workflow (`ci.yml`)

Continuous Integration workflow that runs on every push to `main`/`develop` and on pull requests.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### 1. Lint Job
- **Purpose**: Check code quality with ESLint
- **Runs on**: Ubuntu latest
- **Node version**: 18
- **Steps**:
  - Checkout code
  - Setup Node.js with npm cache
  - Install dependencies (`npm ci`)
  - Run ESLint (`npm run lint`)

**Fails if**: ESLint finds errors

#### 2. Test Job
- **Purpose**: Run all tests with coverage
- **Runs on**: Ubuntu latest
- **Node version**: 18
- **Depends on**: Lint job must pass
- **Steps**:
  - Checkout code
  - Setup Node.js with npm cache
  - Install dependencies (`npm ci`)
  - Create test environment file
  - Run unit tests (`npm run test:unit`)
  - Install Firebase Tools
  - Run integration tests with Firestore Emulator
  - Run all tests with coverage (`npm run test:coverage`)
  - Upload coverage to Codecov
  - Upload coverage report as artifact

**Fails if**: Any tests fail or coverage doesn't meet thresholds

#### 3. Build Job (Optional)
- **Purpose**: Verify build process
- **Runs on**: Ubuntu latest
- **Node version**: 18
- **Depends on**: Test job must pass
- **Condition**: Only runs on push to `main` branch
- **Steps**:
  - Checkout code
  - Setup Node.js with npm cache
  - Install dependencies (`npm ci`)
  - Verify installation
  - Display build summary

**Fails if**: Dependencies fail to install

## 🚀 Features

### npm Caching
All jobs use npm caching to speed up dependency installation:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
    cache-dependency-path: backend/package-lock.json
```

**Benefits:**
- Faster CI runs (cache hit: ~10-30 seconds vs fresh install: ~2-5 minutes)
- Reduced npm registry load
- More reliable builds

### Coverage Reporting
Test job uploads coverage to multiple destinations:

1. **Codecov** (requires `CODECOV_TOKEN` secret):
   - View coverage trends over time
   - PR comments with coverage diff
   - Branch/commit coverage analytics

2. **GitHub Artifacts**:
   - Download full HTML coverage report
   - Retained for 30 days
   - Accessible from workflow run summary

### Job Dependencies
Jobs run in sequence with dependencies:
```
Lint → Test → Build
```

- Test only runs if Lint passes
- Build only runs if Test passes
- Failures stop the pipeline early

### Conditional Execution
Build job only runs on main branch pushes:
```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

This prevents unnecessary builds on:
- Pull requests
- Feature branches
- Other branches

## 🔧 Configuration

### Required Secrets

Add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description | Required |
|--------|-------------|----------|
| `CODECOV_TOKEN` | Codecov upload token | Optional* |

*Optional: Workflow will continue without Codecov token, coverage will only be stored as artifact.

### Getting Codecov Token

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Copy the upload token
4. Add as `CODECOV_TOKEN` secret in GitHub

### Workflow Permissions

The workflow requires these permissions (default for public repos):
- `contents: read` - Read repository code
- `actions: write` - Upload artifacts

For private repos, ensure these are enabled in:
**Settings → Actions → General → Workflow permissions**

## 📊 Viewing Results

### Workflow Status

1. **Repository Badge**: Add to README.md:
   ```markdown
   ![CI](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)
   ```

2. **Actions Tab**: View all workflow runs
   - Navigate to **Actions** tab in repository
   - Click on workflow run to see details
   - Expand jobs to see step-by-step logs

3. **Pull Requests**: See status checks
   - CI status shown on PR page
   - Must pass before merge (if protected)

### Coverage Reports

**View Coverage:**

1. **Codecov**: Visit https://app.codecov.io/gh/USERNAME/REPO
2. **GitHub Artifacts**: 
   - Go to workflow run
   - Scroll to "Artifacts" section
   - Download `coverage-report.zip`
   - Extract and open `index.html`

### Test Results

**Viewing test output:**
- Click on "Test" job in workflow run
- Expand "Run all tests with coverage" step
- See detailed test results with coverage summary

## 🐛 Troubleshooting

### Lint Job Failing

**Error**: ESLint found errors
```
✗ npm run lint failed
```

**Solution**:
1. Run `npm run lint` locally
2. Fix errors or run `npm run lint:fix`
3. Commit and push changes

### Test Job Failing

**Error**: Tests failed
```
FAIL tests/unit/models/User.test.js
```

**Solution**:
1. Run `npm test` locally
2. Fix failing tests
3. Ensure all dependencies are in `package.json`
4. Commit and push changes

### Emulator Issues

**Error**: Firebase emulator timeout
```
Error: Could not reach Firestore backend
```

**Solution**:
1. Emulator automatically starts in CI
2. Check emulator logs in "Run integration tests" step
3. Tests should wait for emulator startup (10s timeout)

### Cache Issues

**Error**: npm cache corruption
```
npm ci failed
```

**Solution**:
1. Clear cache manually:
   - Go to Actions → Caches
   - Delete npm cache
   - Re-run workflow

2. Or, update workflow to force cache refresh:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: '' # Disable cache temporarily
   ```

### Codecov Upload Failing

**Error**: Codecov upload failed
```
Error uploading to Codecov
```

**Solution**:
1. Verify `CODECOV_TOKEN` is set correctly
2. Check Codecov service status
3. Workflow continues even if Codecov fails (`fail_ci_if_error: false`)

## 📈 Optimization Tips

### Faster CI Runs

1. **Use npm ci instead of npm install**:
   - Already configured ✓
   - Uses `package-lock.json` for deterministic installs

2. **Cache npm dependencies**:
   - Already configured ✓
   - Saves ~2-4 minutes per run

3. **Run jobs in parallel** (if independent):
   - Lint and Test could run in parallel
   - Current setup runs sequentially for clarity

4. **Skip unnecessary jobs**:
   - Build job only runs on main pushes ✓

### Reducing Costs

For private repos (charged minutes):

1. **Use matrix builds carefully**:
   - Only test necessary Node versions
   - Current: Single version (18) ✓

2. **Optimize test run time**:
   - Use `--runInBand` for Jest ✓
   - Skip integration tests in quick PRs (optional)

3. **Cancel redundant runs**:
   - Enable auto-cancel in Settings
   - Cancels older runs when new push

## 🔐 Security Best Practices

1. **Use `npm ci` instead of `npm install`**:
   - More secure (respects lock file)
   - Already configured ✓

2. **Pin action versions**:
   - Use `@v4` instead of `@latest`
   - Already configured ✓

3. **Limit workflow permissions**:
   - Use minimal required permissions
   - Avoid `write-all` permissions

4. **Protect secrets**:
   - Never log secrets
   - Use GitHub secrets for sensitive data
   - `CODECOV_TOKEN` properly secured ✓

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js Action](https://github.com/actions/setup-node)
- [Codecov Action](https://github.com/codecov/codecov-action)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Jest CI Configuration](https://jestjs.io/docs/continuous-integration)

## 🎯 Next Steps

Consider adding these workflows:

1. **Deploy Workflow**: Auto-deploy to staging/production
2. **Release Workflow**: Create releases with changelog
3. **Dependency Updates**: Automated dependency PRs with Dependabot
4. **Security Scanning**: CodeQL for security vulnerabilities
5. **Performance Testing**: Load testing on API endpoints
