The basic settings for the Renovate are stored in this repose story. Additionally, the job for execution is located here. 
The basic settings are described below. There is also more detailed information about the structure and how you can adapt it accordingly.

For suggestions for improvement, please write an issue or contact one of the code owners listed [here](https://github.com/simatic-ax/renovate-config/blob/main/CODEOWNERS)

# General structure

The execution is carried out via the [renovate action](https://github.com/simatic-ax/renovate-config/blob/chore/set_up_renovate/.github/workflows/renovate.yml), which can be found in the .github\workflows folder.

The global configuration for Renovate is managed in the Global-Config folder. The main files are:

- Global-Config/renovate-entrypoint.sh: This script sets up the environment and installs necessary dependencies for Renovate.
- Global-Config/renovate-global-config.js: This file contains the global configuration settings for Renovate, including package rules and update strategies.

## Execution




## Setup



To activate the renovate you have to create the file **renovate.json*+* in the route of the repose story, which has the following content:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json"
}
```

### Link to AX Prod regestry

### Pull Request Settings

### own/overwritten settings


Read more : [Self-Hosted configuration options](https://docs.renovatebot.com/self-hosted-configuration/)