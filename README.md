The basic settings for the Renovate are stored in this repose story. Additionally, the job for execution is located here. 
The basic settings are described below. There is also more detailed information about the structure and how you can adapt it accordingly.

For suggestions for improvement, please write an issue or contact one of the code owners listed [here](./CODEOWNERS)

# General structure

The execution is carried out via the [renovate action](https://github.com/simatic-ax/renovate-config/blob/chore/set_up_renovate/.github/workflows/renovate.yml), which can be found in the .github\workflows folder.

The global configuration for Renovate is managed in the Global-Config folder. The main files are:

- Global-Config/renovate-entrypoint.sh: This script sets up the environment and installs necessary dependencies for Renovate.
- Global-Config/renovate-global-config.js: This file contains the global configuration settings for Renovate, including package rules and update strategies.

## Generell settings

A few things are preset in the general config files for clarity. These are as follows. 

- The server that provides the AX packages is set up. Accordingly, it will also log in to the renovate run and check for new products
- It is set that the apax.yml is known and checked
- For clarity, some predefined pull request settings are predefined. these are as follows:
	- They are divided into the categories "ax", "simatic", "dockerimges" and "everything else".
	- In each category, all dependencies of the type are displayed and all types of changes, e.g. "major" and "minor", are summarized in one pull request

However, the settings can be overwritten locally; information about this can be found [here](#local-adaptation).

## Execution

The job for the renovate is running once a week on weekend. **At the moment still manually**
It checks all reposetories that are stored in the space named Ax - see config file with the setting: autodiscoverFilter = "simatic-ax/*"

# Local Setup

To activate the renovate you have to create the file **renovate.json** in the route of the repose story, which has the following content:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json"
}
```

## Local adaptation

The changes that are made locally are made in the created **renovate.json**.

The settings made here overwrite the global setting. 
For example, here is a configuration that also switches on the dashboard locally and at the same time overwrites the fact that the pull requests are now separated into major and minor.

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "separateMajorMinor": true,
  "dependencyDashboard": true
}
```

You can read about everything that is possible in the renovate configuration, [see here](https://docs.renovatebot.com/configuration-options/)