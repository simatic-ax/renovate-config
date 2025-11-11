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
onboarding: false                     # Disable onboarding (use requireConfig instead)
requireConfig: true                   # Require renovate.json in repositories
autodiscoverFilter: "simatic-ax/*"    # Repository discovery filter
separateMajorMinor: false             # Group major and minor updates together
baseBranches: ["main", "release/*"]   # Default branches to scan (can be overridden)
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
  groupName: "major dependencies"

# Minor/patch updates go to both release/* and main branches
- matchUpdateTypes:
    - minor
    - patch
  baseBranches:
    - release/*
    - main
  groupName: "non-major dependencies"
```

#### Custom Managers

```yaml
customManagers:
  - customType: regex
    fileMatch:
      - "apax.yml"
    matchStrings:
      - "['\"](?<depName>@(ax|simatic-ax)/[a-z0-9\\-]+)['\"]\\s*:\\s*(?<currentValue>\\^?\\d+\\.\\d+\\.\\d+)"
    datasourceTemplate: npm
```

## Pull Request Creation Examples

### Scenario 1: Major Update

**Repository state:**
- Current dependency: `@ax/system-commons: "1.5.2"`
- Available version: `2.0.0`

**Renovate behavior:**
- Creates PR against `main` branch
- PR title: "chore(deps): update major dependencies"
- Groups all major updates in single PR
- Branch name: `renovate/major-dependencies`

### Scenario 2: Minor/Patch Update

**Repository state:**
- Current dependency: `@simatic-ax/apax-build-helper: "1.2.0"`
- Available version: `1.3.1`

**Renovate behavior:**
- Creates PRs against both `main` and any `release/*` branches
- PR title: "chore(deps): update non-major dependencies"
- Groups all minor/patch updates together
- Respects SemVer compatibility per branch

### Scenario 3: Repository without Renovate Configuration

**Repository state:**
- No `renovate.json` configuration file
- Repository matches `simatic-ax/*` pattern
- `requireConfig: true` is set in global config

**Renovate behavior:**
- Repository is **skipped** (no onboarding PR created)
- Requires manual creation of `renovate.json` to enable Renovate
- Use the minimal configuration to get started:
  ```json
  {
    "$schema": "https://docs.renovatebot.com/renovate-schema.json"
  }
  ```

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
- **Manual:** workflow_dispatch with optional target repository and branch selection

**Inputs (Manual Trigger Only):**
- `target-repo` (required): Specific repository to scan (e.g., `simatic-ax/your-repo`)
- `target-branch` (optional): Specific branch to scan (defaults to `main, release/*` if empty)

**Behavior:**
- **Scheduled runs:** Scans all repositories matching `autodiscoverFilter: "simatic-ax/*"` using default branches from config
- **Manual runs (with target-repo):** 
  - Scans specified repository
  - Uses `target-branch` if provided, otherwise defaults to config branches (`main, release/*`)
- Creates dependency update PRs according to the configuration
- **Production mode:** Makes actual changes (creates real PRs)

### 2. Configuration Validation (`validate-renovate-config.yml`)

**Purpose:** Validates Renovate configuration syntax

**Triggers:**
- **Pull Requests:** When configuration files are changed
- **Push to main:** When changes are merged to the main branch

**Jobs:**
- `validate-config`: Validates `config.yml` syntax and structure using `github-action-renovate-config-validator`

**Features:**
- Automatic syntax validation
- Runs on configuration file changes only
- Fast feedback for configuration errors

## Usage

### Testing Configuration Changes

1. **Automatic Validation:** Configuration changes are automatically validated when you create a pull request
2. **Manual Testing:** Use `act` for local testing:
   ```bash
   # Test configuration locally
   act workflow_dispatch --secret-file .secrets --workflows .github/workflows/validate-renovate-config.yml
   
   # Test against specific repository
   act workflow_dispatch --secret-file .secrets \
     --input target-repo="simatic-ax/your-repo" \
     --input target-branch="main"
   ```

### Production Updates

- **Automatic:** Renovate runs every Sunday at 15:00 UTC across all SIMATIC AX repositories using default branches
- **Manual Targeting:** Use workflow_dispatch to:
  - Target a specific repository
  - Test on a custom branch (e.g., feature branch, test branch)
  - Leave `target-branch` empty to use default branches (`main, release/*`)

## Workflow Triggers

### Automatic Execution
- **Schedule:** Every Sunday at 15:00 UTC  
- **Scope:** All repositories matching `autodiscoverFilter`
- **Trigger:** GitHub Actions cron schedule

### Manual Execution
- **Targeted Repository Testing:** `workflow_dispatch` with `target-repo` (required) and optional `target-branch` parameters
- **Branch Selection:**
  - Leave `target-branch` empty: Uses default branches from config (`main, release/*`)
  - Specify `target-branch`: Overrides config to scan only specified branch (e.g., `feature/test-renovate`)
- **Validation:** Automatic on pull requests and pushes to main branch
- **Use case:** On-demand updates, testing on feature branches, or scanning specific release branches

## Repository States and Behavior

| Repository State | Renovate Behavior |
|------------------|-------------------|
| Has `renovate.json` | Regular dependency scanning and PR creation |
| No configuration + `requireConfig: true` | Repository is skipped (manual config required) |
| No configuration + `onboarding: true` | Creates onboarding PR (not used in this setup) |
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

## Local Development and Testing

### Prerequisites

Before you can run Renovate workflows locally, ensure you have the following:

1. **act** installed ([GitHub](https://github.com/nektos/act) - Tool for running GitHub Actions locally)
2. **Docker** installed and running (required by act)
3. **Access to required secrets:**
   - `APAX_TOKEN` - Authentication token for SIMATIC AX registry
   - `GITHUB_TOKEN` - GitHub personal access token with appropriate permissions

### Installing act

act can be easily installed via npm:

```bash
npm install -g @nektos/act
```

**Alternative installation methods:**
- **Windows (Chocolatey):** `choco install act-cli`
- **macOS (Homebrew):** `brew install act`
- **Linux (curl):** `curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash`

### Setting up Local Environment

#### 1. Clone the Repository

```bash
git clone https://github.com/simatic-ax/renovate-config.git
cd renovate-config
```

#### 2. Create Secrets File

Create a `.secrets` file in the repository root with your secrets:

```bash
# .secrets (DO NOT COMMIT THIS FILE!)
APAX_TOKEN=your_apax_token_here
GITHUB_TOKEN=your_github_token_here
```

⚠️ **Important:** Add `.secrets` to your `.gitignore` to prevent accidental commits of sensitive data.

#### 3. act Configuration

The repository includes a `.actrc` file that pre-configures act with the necessary settings:
- Platform mapping for ubuntu-24.04
- Container architecture settings
- Verbose output for debugging

No additional act configuration is needed!

### Running Renovate Locally with act

#### Basic Workflow Execution

To run the complete renovate workflow locally:

```bash
# Run the renovate workflow with secrets (.actrc provides default configuration)
# WARNING: This runs in PRODUCTION mode and will create real PRs!
act workflow_dispatch --secret-file .secrets

# For testing, add dry-run mode
act workflow_dispatch --secret-file .secrets --env RENOVATE_DRY_RUN=full
```

#### Testing Against Specific Repository

To test against a specific repository (using workflow inputs):

```bash
# Test against a specific repository with default branches (main, release/*)
act workflow_dispatch \
  --secret-file .secrets \
  --input target-repo="simatic-ax/your-target-repo"

# Test against a specific repository and custom branch (PRODUCTION mode - creates real PRs!)
act workflow_dispatch \
  --secret-file .secrets \
  --input target-repo="simatic-ax/your-target-repo" \
  --input target-branch="main"

# Test against a feature branch with dry-run for safety
act workflow_dispatch \
  --secret-file .secrets \
  --input target-repo="simatic-ax/your-target-repo" \
  --input target-branch="feature/test-renovate" \
  --env RENOVATE_DRY_RUN=full
```

#### PowerShell Helper Script

Create a `run-renovate-act.ps1` script for easier usage:

```powershell
# run-renovate-act.ps1
param(
    [Parameter(Mandatory=$false)]
    [string]$TargetRepo = "",
    
    [Parameter(Mandatory=$false)]
    [string]$TargetBranch = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$Workflow = "renovate-bot-run"
)

# Verify .secrets file exists
if (-not (Test-Path ".secrets")) {
    Write-Error ".secrets file not found. Please create it with APAX_TOKEN and GITHUB_TOKEN"
    exit 1
}

# Build act command (uses .actrc for configuration)
$actCommand = @("act", "workflow_dispatch", "--secret-file", ".secrets")

# Add workflow-specific arguments
if ($Workflow -eq "renovate-bot-run") {
    $actCommand += @("--workflows", ".github/workflows/renovate-bot-run.yml")
}

# Add repository and branch inputs if specified
if ($TargetRepo) {
    $actCommand += @("--input", "target-repo=$TargetRepo")
    if ($TargetBranch) {
        $actCommand += @("--input", "target-branch=$TargetBranch")
    }
}

# Add dry-run environment variable if requested
if ($DryRun) {
    Write-Host "Running in DRY-RUN mode (no actual changes will be made)" -ForegroundColor Yellow
    $actCommand += @("--env", "RENOVATE_DRY_RUN=full")
} else {
    Write-Host "Running in PRODUCTION mode (will make actual changes!)" -ForegroundColor Red
}

Write-Host "Executing: $($actCommand -join ' ')" -ForegroundColor Green
& $actCommand[0] $actCommand[1..($actCommand.Length-1)]
```

Usage:
```powershell
# Run against all repositories (autodiscover mode) - PRODUCTION
.\run-renovate-act.ps1

# Test against specific repository with default branches - PRODUCTION
.\run-renovate-act.ps1 -TargetRepo "simatic-ax/your-repo"

# Test against specific repository and branch - PRODUCTION
.\run-renovate-act.ps1 -TargetRepo "simatic-ax/your-repo" -TargetBranch "release/v1.0"

# Run in dry-run mode for testing
.\run-renovate-act.ps1 -TargetRepo "simatic-ax/your-repo" -DryRun

# Test on feature branch with dry-run
.\run-renovate-act.ps1 -TargetRepo "simatic-ax/your-repo" -TargetBranch "feature/test" -DryRun

# Run validation workflow
.\run-renovate-act.ps1 -Workflow "validate-renovate-config"
```

#### Bash Helper Script

Create a `run-renovate-act.sh` script:

```bash
#!/bin/bash
# run-renovate-act.sh

set -e

# Default values
TARGET_REPO=""
TARGET_BRANCH=""
DRY_RUN=false
WORKFLOW="renovate-bot-run"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --repo)
      TARGET_REPO="$2"
      shift 2
      ;;
    --branch)
      TARGET_BRANCH="$2"
      shift 2
      ;;
    --workflow)
      WORKFLOW="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      echo "Usage: $0 [--repo <repository>] [--branch <branch>] [--workflow <workflow>] [--dry-run]"
      exit 1
      ;;
  esac
done

# Verify .secrets file exists
if [[ ! -f .secrets ]]; then
  echo "Error: .secrets file not found. Please create it with APAX_TOKEN and GITHUB_TOKEN"
  exit 1
fi

# Build act command (uses .actrc for configuration)
act_cmd=("act" "workflow_dispatch" "--secret-file" ".secrets")

# Add workflow-specific arguments
if [[ "$WORKFLOW" == "renovate-bot-run" ]]; then
  act_cmd+=("--workflows" ".github/workflows/renovate-bot-run.yml")
elif [[ "$WORKFLOW" == "validate-renovate-config" ]]; then
  act_cmd+=("--workflows" ".github/workflows/validate-renovate-config.yml")
fi

# Add repository and branch inputs if specified
if [[ -n "$TARGET_REPO" ]]; then
  act_cmd+=("--input" "target-repo=$TARGET_REPO")
  if [[ -n "$TARGET_BRANCH" ]]; then
    act_cmd+=("--input" "target-branch=$TARGET_BRANCH")
  fi
fi

# Add dry-run environment variable if requested
if [[ "$DRY_RUN" == "true" ]]; then
  echo "Running in DRY-RUN mode (no actual changes will be made)"
  act_cmd+=("--env" "RENOVATE_DRY_RUN=full")
else
  echo "Running in PRODUCTION mode (will make actual changes!)"
fi

echo "Executing: ${act_cmd[*]}"
"${act_cmd[@]}"
```

Usage:
```bash
chmod +x run-renovate-act.sh

# Run against all repositories (autodiscover mode) - PRODUCTION
./run-renovate-act.sh

# Test against specific repository with default branches - PRODUCTION
./run-renovate-act.sh --repo "simatic-ax/your-repo"

# Test against specific repository and branch - PRODUCTION
./run-renovate-act.sh --repo "simatic-ax/your-repo" --branch "release/v1.0"

# Run in dry-run mode for testing
./run-renovate-act.sh --repo "simatic-ax/your-repo" --dry-run

# Test on feature branch with dry-run
./run-renovate-act.sh --repo "simatic-ax/your-repo" --branch "feature/test" --dry-run

# Run validation workflow
./run-renovate-act.sh --workflow "validate-renovate-config"
```
```

### Common Development Scenarios

#### 1. Testing Configuration Changes

After modifying `Global-Config/config.yml`:

```bash
# Validate configuration syntax
act workflow_dispatch --secret-file .secrets --workflows .github/workflows/validate-renovate-config.yml
```

#### 2. Testing Against Specific Repository

```bash
# Test against a specific repository with default branches
act workflow_dispatch --secret-file .secrets \
  --input target-repo="simatic-ax/your-repo"

# Test against a specific repository and custom branch
act workflow_dispatch --secret-file .secrets \
  --input target-repo="simatic-ax/your-repo" \
  --input target-branch="feature/test-renovate"
```

#### 3. Testing Lockfile Maintenance

To specifically test lockfile maintenance behavior:

```bash
# Run workflow against repository with apax.yml files using default branches
act workflow_dispatch --secret-file .secrets \
  --input target-repo="simatic-ax/your-repo"
  
# Test lockfile maintenance on a specific branch
act workflow_dispatch --secret-file .secrets \
  --input target-repo="simatic-ax/your-repo" \
  --input target-branch="main"
```

### Advanced act Usage

#### Running with Custom Event Data

Create an `event.json` file for more complex testing:

```json
{
  "inputs": {
    "target-repo": "simatic-ax/your-target-repo",
    "target-branch": "release/v1.0"
  }
}
```

Then run:
```bash
act workflow_dispatch --secret-file .secrets --eventpath event.json
```

#### Using Different Docker Images

If you want to use a different runner image:

```bash
# Use a specific Ubuntu image
act --secret-file .secrets -P ubuntu-24.04=ubuntu:24.04
```

#### Verbose Logging

For detailed debugging information:

```bash
# Enable verbose logging
act workflow_dispatch --secret-file .secrets --verbose
```

### Debugging Tips

1. **act Specific Issues:**
   - Use `--dryrun` to see what act would do without executing
   - Use `--list` to see available workflows and jobs
   - Use `--verbose` for detailed execution logs

2. **Common act Problems:**
   - **Docker image issues:** act will automatically pull required images
   - **Secret access:** Ensure `.secrets` file format is correct (KEY=VALUE)
   - **Workflow triggers:** Make sure you're using the correct trigger event

3. **Useful act Commands:**
   ```bash
   # List all workflows
   act --list
   
   # Dry run to see execution plan
   act workflow_dispatch --secret-file .secrets --dryrun
   
   # Run specific job only
   act workflow_dispatch --secret-file .secrets --job renovate
   ```

### Benefits of Using act

✅ **Advantages over manual Docker execution:**
- Runs the exact same environment as GitHub Actions
- Automatically handles workflow steps and dependencies
- Built-in secret management
- No need to manually compose complex Docker commands
- Easy to test workflow changes before pushing

✅ **Perfect for:**
- Testing workflow modifications
- Validating Renovate configuration changes
- Debugging failed GitHub Actions locally
- Development iteration without pushing commits

### Security Considerations

- Never commit `.env` files or secrets to version control
- Use temporary tokens for local development when possible
- Regularly rotate your development tokens
- Consider using GitHub CLI authentication instead of manual token management

⚠️ **Important:** The default mode is **PRODUCTION** - renovate will create real PRs! Use `--dry-run` flag for testing.

```bash
# Alternative: Use GitHub CLI for authentication
gh auth login
export GITHUB_TOKEN=$(gh auth token)
```
