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
act workflow_dispatch --secret-file .secrets
```

#### Testing Against Specific Repository

To test against a specific repository (using workflow inputs):

```bash
# Test against a specific repository with default base branch (renovate-test-branch)
act workflow_dispatch \
  --secret-file .secrets \
  --input repo="simatic-ax/your-target-repo"

# Test against a specific repository with custom base branch
act workflow_dispatch \
  --secret-file .secrets \
  --input repo="simatic-ax/your-target-repo" \
  --env RENOVATE_BASE_BRANCH_PATTERNS="main"
```

#### PowerShell Helper Script

Create a `run-renovate-act.ps1` script for easier usage:

```powershell
# run-renovate-act.ps1
param(
    [Parameter(Mandatory=$false)]
    [string]$TargetRepo = "",
    
    [Parameter(Mandatory=$false)]
    [string]$BaseBranch = "renovate-test-branch",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $true,
    
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

# Add repository input if specified
if ($TargetRepo) {
    $actCommand += @("--input", "repo=$TargetRepo")
}

# Add base branch environment variable
$actCommand += @("--env", "RENOVATE_BASE_BRANCH_PATTERNS=$BaseBranch")

# Add dry-run environment variable
if ($DryRun) {
    Write-Host "Running in DRY-RUN mode (no actual changes will be made)" -ForegroundColor Yellow
    $actCommand += @("--env", "RENOVATE_DRY_RUN=full")
}

Write-Host "Executing: $($actCommand -join ' ')" -ForegroundColor Green
& $actCommand[0] $actCommand[1..($actCommand.Length-1)]
```

Usage:
```powershell
# Run against all repositories with default test branch
.\run-renovate-act.ps1

# Test against specific repository and branch
.\run-renovate-act.ps1 -TargetRepo "simatic-ax/your-repo" -BaseBranch "main"

# Run validation workflow
.\run-renovate-act.ps1 -Workflow "validate-renovate-config"

# Run without dry-run (make actual changes)
.\run-renovate-act.ps1 -TargetRepo "simatic-ax/your-repo" -DryRun:$false
```

#### Bash Helper Script

Create a `run-renovate-act.sh` script:

```bash
#!/bin/bash
# run-renovate-act.sh

set -e

# Default values
TARGET_REPO=""
BASE_BRANCH="renovate-test-branch"
DRY_RUN=true
WORKFLOW="renovate-bot-run"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --repo)
      TARGET_REPO="$2"
      shift 2
      ;;
    --base-branch)
      BASE_BRANCH="$2"
      shift 2
      ;;
    --workflow)
      WORKFLOW="$2"
      shift 2
      ;;
    --no-dry-run)
      DRY_RUN=false
      shift
      ;;
    *)
      echo "Unknown option $1"
      echo "Usage: $0 [--repo <repository>] [--base-branch <branch>] [--workflow <workflow>] [--no-dry-run]"
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

# Add repository input if specified
if [[ -n "$TARGET_REPO" ]]; then
  act_cmd+=("--input" "repo=$TARGET_REPO")
fi

# Add base branch environment variable
act_cmd+=("--env" "RENOVATE_BASE_BRANCH_PATTERNS=$BASE_BRANCH")

# Add dry-run environment variable
if [[ "$DRY_RUN" == "true" ]]; then
  echo "Running in DRY-RUN mode (no actual changes will be made)"
  act_cmd+=("--env" "RENOVATE_DRY_RUN=full")
fi

echo "Executing: ${act_cmd[*]}"
"${act_cmd[@]}"
```

Usage:
```bash
chmod +x run-renovate-act.sh

# Run against all repositories with default test branch
./run-renovate-act.sh

# Test against specific repository and branch
./run-renovate-act.sh --repo "simatic-ax/your-repo" --base-branch "main"

# Run validation workflow
./run-renovate-act.sh --workflow "validate-renovate-config"

# Run without dry-run (make actual changes)
./run-renovate-act.sh --repo "simatic-ax/your-repo" --no-dry-run
```
```

Usage:
```bash
chmod +x run-renovate-local.sh

# Test against specific repository and branch
./run-renovate-local.sh --repo "simatic-ax/your-repo" --branch "renovate-test-branch"

# Test with trace logging
./run-renovate-local.sh --repo "simatic-ax/your-repo" --log-level "trace"
```

### Common Development Scenarios

#### 1. Testing Configuration Changes

After modifying `Global-Config/config.yml`:

```bash
# Validate configuration and test with act
act workflow_dispatch --secret-file .secrets --workflows .github/workflows/validate-renovate-config.yml
```

#### 2. Testing Against Specific Repository

```bash
# Test against a specific repository
act workflow_dispatch --secret-file .secrets --input repo="simatic-ax/your-repo"
```

#### 3. Testing Lockfile Maintenance

To specifically test lockfile maintenance behavior:

```bash
# Run workflow that will trigger lockfile maintenance for eligible repositories
act workflow_dispatch --secret-file .secrets --input repo="simatic-ax/your-repo"
```

### Advanced act Usage

#### Running with Custom Event Data

Create an `event.json` file for more complex testing:

```json
{
  "inputs": {
    "repo": "simatic-ax/your-target-repo"
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

```bash
# Alternative: Use GitHub CLI for authentication
gh auth login
export GITHUB_TOKEN=$(gh auth token)
```
