# Renovate configuration
![main](https://docs.renovatebot.com/assets/images/mend-renovate-cli-banner.jpg)

The [renovate CLI](https://docs.renovatebot.com/) can be used to automatically update dependencies in your project, once new versions of them have been released or whenever you see need.

To support the user in setting up the required infrastructure, two things are being offered:
- A workflow that automatically detects and applies updates of a dependency
  - The execution happens for all repositories within the SIMATIC AX GitHub organization
  - Schedule: Once, every Sunday
- A workflow that enables the maintainer of a repository to manually trigger the detection and application of dependency updates

Once the Renovate bot discovered newly available versions of a dependency, it'll automatically set up a pull request wherein the updates have been applied. This supports the user in deciding if and when to update dependencies of a project.

## Incorporating the Renovate workflow in your own repository

The Renovate workflow defined inside this repository can be reused inside workflows of other repositories. To do so, for any given repository, include a YML file inside the .github/workflows folder, containing at least the following declarations:

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

This will configure a GitHub workflow, named my-renovate-call whose job simply references and executes the workflow provided by **THIS** repository to run the Renovate bot inside a CI pipeline of your own repository.

Further information on how to facilitate GitHub actions and workflows can be found [here](https://docs.github.com/en/actions).

# General structure

- ./.github/workflows
  - Contains the YML definition of the workflows
- ./Global-Config
  - Contains the default presets for the Renovate bot
  - Contains a script to further configure the runtime environment of the bot
- ./renovate.json
  - Enables the general usage of a Renovate bot for the given repository
The execution is carried out via the [renovate action](https://github.com/simatic-ax/renovate-config/blob/chore/set_up_renovate/.github/workflows/renovate.yml), which can be found in the .github\workflows folder.

## Renovate workflows

### Automatic execution

The automatic execution of the Renovate bot includes the following major steps:
- Check out the repository which is to be updated
- Configure the environment and install SIMATIC AX tooling, namely apax
- Add the SIMATIC AX registry and the repositories to be updated
- Pass the configuration files to the Renovate bot and start execution

### Manual execution

The manual execution does the exact same thing, except it offers a button to the user to run the Renovate bot manually whenever required.

## Renovate configuration

### Entry point

The [renovate-entrypoint.sh](./Global-Config/renovate-entrypoint.sh) serves as an entry point for the Renovate bot. By adapting the file the user may control the installation of required prerequisites dependening on his own requirements. In its current implementation the script installs apax inside the image that is running the Renovate bot. This is required in order for the Renovate bot to communicate with the SIMATIC AX registry and check package versions.

### Global configuration

The current configuration, which will be applied to the Renovate bot can be found inside the [renovate-global-config.js](./Global-Config/renovate-global-config.js).

The most important settings are:
  - hostRules
    - Tells the Renovate bot in which remote registry to lookup dependencies
    - May be extended to include other package registries as well
  - regexManagers
    - Tells the Renovate bot which files to check for possible dependencies
    - Tells the Renovate bot how to identify dependencies inside those files
  - packageRules
    - Tells the Renovate bot when and how to update the found dependencies

For more detailed information regarding the configuration, see the [official renovate documentation](https://docs.renovatebot.com/configuration-options/)


### Customizing and extending the configuration

One may either simply use the existing configuration, or extend it wherever necessary. In case you require additional parameterization of the Renovate bot, or in case you'd like to override an existing setting, adapt the [renovate.json](./renovate.json) inside your own repository. Once done, the set of settings to configure the bot will be an aggregation of the globally defined [renovate-global-config.js](./Global-Config/renovate-global-config.js) and the renovate.json file inside the respective repository.

The following example of a renovate.json configuration will:
  - extend the global configuration, such that a dashboard will be shown inside the update pull request
  - overwrites the handling of minor and major version while updating.

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "separateMajorMinor": true,
  "dependencyDashboard": true
}
```

Further information on what and how to configure can be found [here](https://docs.renovatebot.com/configuration-options/)

Note, that every single property of the global configuration could be altered this way, in case required.

### Local execution

In order to be able to test and debug renovate, it is recommended to run the renovate locally.
Here is a short, bullet-point guide. More and more in-depth information can also be found on the corresponding renovate page [here](https://docs.renovatebot.com/examples/self-hosting/).

It is best to install renovate globally on your PC. You can do this with the following command in your terminal / bash:

```bash
{
    npm install -g renovate
}
```

https://docs.renovatebot.com/modules/platform/local/

```bash
{
    renovate --platform=local --dry-run=full --config /Global-Config/renovate-global-config.js
}
```

--require-config "D:\Git\renovate-config\Global-Config\renovate-global-config.js"