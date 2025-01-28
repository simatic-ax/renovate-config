![main](https://docs.renovatebot.com/assets/images/mend-renovate-cli-banner.jpg)

The basic settings for the Renovate are stored in this repository. Additionally, the job for execution is located here. 
The basic settings are described below. There is also more detailed information about the structure and how you can adapt it accordingly.

For suggestions for improvement, please write an issue or contact one of the code owners listed [here](./CODEOWNERS)

The basis for execute the renovate is the [renovate CLI](https://docs.renovatebot.com/)

# General structure

The execution is carried out via the [renovate action](https://github.com/simatic-ax/renovate-config/blob/chore/set_up_renovate/.github/workflows/renovate.yml), which can be found in the .github\workflows folder.

The global configuration for Renovate is managed in the Global-Config folder. The main files are:

- Global-Config/renovate-entrypoint.sh: This script sets up the environment and installs necessary dependencies for Renovate.
- Global-Config/renovate-global-config.js: This file contains the global configuration settings for Renovate, including package rules and update strategies.

## Generel settings

A few things are preset in the general config files for clarity. These are as follows. 

- The server that provides the AX packages is set up. Accordingly, it will also log in to the renovate run and check for new products
- It is set that the apax.yml is known and checked
- For clarity, for pull request are set some predefined settings. These are as follows:
	- They are divided into the categories "ax", "simatic", "dockerimges" and "everything else".
	- In each category, all dependencies of the type are displayed and all types of changes, e.g. "major" and "minor", are summarized in one pull request

However, the settings can be overwritten locally; information about this can be found [here](#local-adaptation).

## Execution

The job for the renovate is running once a week on weekend. **At the moment still manually**
It checks all repositories that are stored in the space named Ax - see config file with the setting: autodiscoverFilter = "simatic-ax/*"

# Local Setup

To activate the renovate you have to create the file **renovate.json** in the root of the repository, which has the following content:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json"
}
```

# Customization

Of course, it is also possible to adapt the settings of the Renovate bot to your needs. For this purpose, the corresponding settings can be set in its repository - called **local**. This affects the general settings as well as the execution.

## Local setting adaptation

The changes that are made locally are made in the created **renovate.json**.

The settings made here override the global setting. 
For example, here is a configuration that also switches on the dashboard locally and at the same time overwrites the fact that the pull requests are now separated into major and minor.

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "separateMajorMinor": true,
  "dependencyDashboard": true
}
```

You can read about everything that is possible in the renovate configuration, [see here](https://docs.renovatebot.com/configuration-options/)

## Local triggering of execution

If you want to call renovate you have to create an action locally based on the Github rules. 
Normally this is a yml file in the .github/workflows folder. More information about actions can be found in the Github documentation: [here](https://docs.github.com/en/actions)

For easy use, we provide a reusable workflow that only needs to be referenced and provided with the appropriate parameters. 

How this workflow can be replicated is shown in the following example configuration:

```yml
name: my-renovate-call

on:
  *my_trigger*:

jobs:
 my-renovate-call:
    uses: simatic-ax/renovate-config/.github/workflows/reusable-renovate-workflow.yml@main
    secrets: inherit
    with:
        renovate_reposetory_filter: "simatic-ax/*my_repository_name*"
```

The following parameters must be supplied minimally:
- **my_trigger**: This is the condition when the workflow is executed. This can be a event, like a time or when you check in something. The overview of the events can be found: [here](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows)
- **renovate_reposetory_filter**: With these parameters you specify to the filters which repositories the renovate should check. If you want it to be local, it is the namespace **simatic-ax** and the repository name.

It is also advisable to give the action a suitable name.
