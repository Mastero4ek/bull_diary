# GitHub Actions & Security Workflows

This directory contains GitHub Actions workflows for CI/CD and security automation.

## 🔒 Security Workflows

### 1. **Security Audit** (`security-audit.yml`)

- **Triggers**: Push to main/develop, PRs, weekly schedule (Sundays 9:00 UTC)
- **Purpose**: Comprehensive security scanning of dependencies
- **Features**:
  - Runs `npm audit` on both server and client
  - Generates detailed vulnerability reports
  - Comments on PRs with security findings
  - Uploads audit reports as artifacts

### 2. **Auto Fix Vulnerabilities** (`auto-fix-vulnerabilities.yml`)

- **Triggers**: Weekly schedule (Wednesdays 6:00 UTC), manual dispatch
- **Purpose**: Automatically fix security vulnerabilities
- **Features**:
  - Attempts to auto-fix vulnerabilities with `npm audit fix`
  - Creates PRs for successful fixes
  - Groups security updates together
  - Includes detailed changelog

### 3. **CI/CD Pipeline** (`ci-cd.yml`)

- **Triggers**: Push to main/develop, PRs
- **Purpose**: Complete CI/CD pipeline with security integration
- **Features**:
  - Security audit as first step
  - Linting and formatting checks
  - Build verification
  - Security summary generation

## 📋 Dependabot Configuration

### Automatic Updates

- **Frequency**: Weekly (Mondays 9:00 UTC)
- **Scope**: npm dependencies for both server and client
- **Security**: Prioritizes security updates
- **Grouping**: Groups minor updates and security fixes

### Protected Dependencies

- **Server**: express, mongoose, passport (major updates ignored)
- **Client**: react, react-dom, vite (major updates ignored)

## 🛠️ Manual Security Commands

### Local Security Checks

```bash
# Run comprehensive security check
./scripts/security-check.sh

# Server security audit
cd server && npm run security:audit

# Client security audit
cd client && npm run security:audit

# High-level security check
npm run security:check
```

### Security Fixes

```bash
# Auto-fix vulnerabilities
npm run security:fix

# Force fix (may break things)
npm run security:fix:force
```

## 📊 Security Reports

### Generated Reports

- **Audit Reports**: JSON format with detailed vulnerability info
- **Security Summary**: GitHub step summary with vulnerability counts
- **Local Reports**: Text-based reports with timestamps

### Report Locations

- **GitHub Actions**: Artifacts section of workflow runs
- **Local**: `security-report-YYYYMMDD-HHMMSS.txt`

## 🔧 Configuration

### Environment Variables

- `NODE_ENV`: Environment (dev/prod)
- `GITHUB_TOKEN`: For PR creation and commenting
- `NPM_AUDIT_LEVEL`: Audit level (moderate/high/critical)

### Workflow Settings

- **Concurrency**: Limited to prevent conflicts
- **Timeout**: 30 minutes per job
- **Retention**: 30 days for artifacts

## 🚨 Security Alerts

### Automatic Notifications

- **PR Comments**: Security findings posted on PRs
- **Workflow Failures**: Failed security checks block merges
- **Weekly Reports**: Scheduled security summaries

### Manual Triggers

- **Workflow Dispatch**: Manual security fix runs
- **Security Check**: Local script execution

## 📈 Security Metrics

### Tracked Metrics

- **Vulnerability Count**: By severity level
- **Fix Response Time**: Time to resolve issues
- **Update Frequency**: Dependency update rate
- **Scan Coverage**: Percentage of dependencies scanned

### Reporting

- **Weekly Summaries**: GitHub Actions summary
- **Trend Analysis**: Vulnerability trends over time
- **Incident Reports**: Security incident documentation

## 🔍 Troubleshooting

### Common Issues

1. **Workflow Failures**: Check npm audit output for specific vulnerabilities
2. **PR Creation Fails**: Verify GITHUB_TOKEN permissions
3. **Dependabot Conflicts**: Review dependency update policies

### Debug Commands

```bash
# Check workflow logs
gh run list --workflow=security-audit.yml

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

## 📚 Resources

### Documentation

- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)

### Best Practices

- Always review security PRs before merging
- Monitor vulnerability trends
- Keep dependencies updated regularly
- Use security scanning in CI/CD
