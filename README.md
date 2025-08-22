# Renovate configuration

This repository contains the centralized Renovate configuration for all repositories within the SIMATIC AX GitHub organization. It provides automated dependency management through scheduled runs and manual triggers.

## Overview

Renovate is configured to:
- Automatically scan all repositories in the `simatic-ax` organization
- Create pull requests for dependency updates based on defined rules
- Support custom package managers and registries specific to SIMATIC AX

## Configuration Structure

### Core Configuration (`config.yml`)

The main configuration file defines the following key properties:

#### Basic Settings

```yaml
platform: "github"                    # Target platform
gitAuthor: "simatic-ax-bot <...>"     # Author for commits and PRs
onboarding: true                      # Enable onboarding for new repositories
autodiscoverFilter: "simatic-ax/*"    # Repository discovery filter
separateMajorMinor: false             # Group major and minor updates together
```

#### Package Managers

```yaml
enabledManagers:
  - regex                             # Enable regex-based custom manager
```

#### Registry Configuration

```yaml
packageRules:
  - matchPackagePrefixes:
      - "@ax/"
    registryUrls: 
      - "https://registry.simatic-ax.siemens.io/"
  - matchPackagePrefixes:
      - "@simatic-ax"
    registryUrls: 
      - "https://npm.pkg.github.com/"
```

#### Update Branching Strategy

```yaml
# Major updates go to main branch only
- matchUpdateTypes:
    - major
  baseBranches:
    - main
  groupName: "all major dependencies"

# Minor/patch updates go to both release/* and main branches
- matchUpdateTypes:
    - minor
    - patch
  baseBranches:
    - release/*
    - main
  groupName: "all non-major dependencies"
```

#### Custom Managers

```yaml
customManagers:
  - customType: regex
    fileMatch:
      - "apax.yml"
    matchStrings:
      - "['\"](?<depName>@(ax|simatic-ax|[a-z0-9\\-]+)/[a-z0-9\\-]+)['\"]\\s*:\\s*(?<currentValue>[\\^~]\\d+\\.\\d+\\.\\d+(?:-[\\w\\d\\-.]+)?(?:\\+[\\w\\d\\-.]+)?)"
    datasourceTemplate: npm
```

## Pull Request Creation Examples

### Scenario 1: Major Update

**Repository state:**
- Current dependency: `@ax/system-commons: "1.5.2"`
- Available version: `2.0.0`

**Renovate behavior:**
- Creates PR against `main` branch
- PR title: "Update all major dependencies"
- Groups all major updates in single PR
- Branch name: `renovate/all-major-dependencies`

### Scenario 2: Minor/Patch Update

**Repository state:**
- Current dependency: `@simatic-ax/apax-build-helper: "1.2.0"`
- Available version: `1.3.1`

**Renovate behavior:**
- Creates PRs against both `main` and any `release/*` branches
- PR title: "Update all non-major dependencies"
- Groups all minor/patch updates together
- Respects SemVer compatibility per branch

### Scenario 3: New Repository Onboarding

**Repository state:**
- No `renovate.json` configuration file
- Repository matches `simatic-ax/*` pattern

**Renovate behavior:**
- Creates onboarding PR with title "Configure Renovate"
- Adds basic `renovate.json` configuration
- PR must be merged to enable ongoing dependency updates

## Customization Points

### 1. Repository-Level Configuration

Create a `renovate.json` file in your repository root to override or extend the global configuration:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "separateMajorMinor": true,
  "dependencyDashboard": true,
  "packageRules": [
    {
      "matchPackagePatterns": ["^@my-org/"],
      "groupName": "My Organization packages"
    }
  ]
}
```

### 2. Additional Package Managers

Extend the `enabledManagers` array to support additional package managers:

```yaml
enabledManagers:
  - regex
  - dockerfile
  - github-actions
```

### 3. Custom Registry Rules

Add new package rules for different registries:

```yaml
packageRules:
  - matchPackagePrefixes:
      - "@your-org/"
    registryUrls: 
      - "https://your-registry.com/"
```

### 4. Branch Strategy Customization

Modify the branching strategy for different update types:

```yaml
packageRules:
  - matchUpdateTypes:
      - major
    baseBranches:
      - development
    assignees: ["@team-lead"]
```

### 5. Custom File Pattern Matching

Extend regex managers to support additional file formats:

```yaml
customManagers:
  - customType: regex
    fileMatch:
      - "package.json"
      - "requirements.txt"
    matchStrings:
      - "your-custom-pattern-here"
```

## Workflows

This repository includes two main workflows for Renovate management:

### 1. Renovate Bot Run (`renovate-bot-run.yml`)

**Purpose:** Production Renovate execution across all SIMATIC AX repositories

**Triggers:**
- **Scheduled:** Every Sunday at 15:00 UTC

**Behavior:**
- Scans all repositories matching `autodiscoverFilter: "simatic-ax/*"`
- Creates dependency update PRs according to the configuration
- Handles onboarding for repositories without Renovate configuration

### 2. Configuration Validation (`validate-renovate-config.yml`)

**Purpose:** Validates Renovate configuration and tests against specific repositories

**Triggers:**
- **Pull Requests:** When configuration files are changed
- **Push to main:** When changes are merged to the main branch  
- **Manual:** With repository and branch selection for testing

**Jobs:**
- `validate-config`: Validates `config.yml` syntax and structure using `github-action-renovate-config-validator`
- `test-config`: Performs dry-run test against specified repository (manual trigger only)

**Test Features:**
- Dry-run mode (no actual changes)
- Configurable target repository and branch
- Requires existing Renovate configuration in target repository

## Usage

### Testing Configuration Changes

1. **Automatic Validation:** Configuration changes are automatically validated when you create a pull request
2. **Manual Testing:** Use the "Validate Renovate Configuration" workflow to test against a specific repository:
   - Go to Actions → "Validate Renovate Configuration" → "Run workflow"
   - Enter target repository (e.g., `simatic-ax/lacyccom`)
   - Optionally specify a branch (defaults to `main`)

### Production Updates

- **Automatic:** Renovate runs every Sunday at 15:00 UTC across all SIMATIC AX repositories
- **Manual:** Trigger via other workflows using `workflow_call`

## Workflow Triggers

### Automatic Execution
- **Schedule:** Every Sunday at 15:00 UTC  
- **Scope:** All repositories matching `autodiscoverFilter`
- **Trigger:** GitHub Actions cron schedule

### Manual Execution
- **Configuration Testing:** `workflow_dispatch` with repository and branch parameters
- **Production Runs:** `workflow_call` from other workflows
- **Validation:** Automatic on pull requests and pushes to main branch
- **Use case:** On-demand updates for specific repositories

## Repository States and Behavior

| Repository State | Renovate Behavior |
|------------------|-------------------|
| Has `renovate.json` | Regular dependency scanning and PR creation |
| No configuration | Creates onboarding PR |
| Onboarding PR closed/rejected | Repository ignored until PR is merged |
| Contains supported files (`apax.yml`) | Scans for dependencies using custom managers |

## Advanced Configuration Options

### Grouping Strategies
- **Default:** Groups by update type (major vs. non-major)
- **Custom:** Define package-specific groups
- **Monorepo:** Handle multiple packages in single repository

### Security Updates
- Automatic creation of security-focused PRs
- Priority handling for vulnerability fixes
- Integration with security scanning tools

### Automerge Rules
Configure automatic merging for specific update types:

```json
{
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "matchPackagePatterns": ["^@simatic-ax/"],
      "automerge": true
    }
  ]
}
```

For comprehensive configuration options, refer to the [official Renovate documentation](https://docs.renovatebot.com/configuration-options/).
