const apaxNpmrc = process.env.RENOVATE_NPMRC;

const prFooter = `:space_invader: :sparkles: This merge request is proudly presented by [Renovate Bot](https://code.siemens.com/ax/devops/renovate-bot).`;
module.exports = {
  platform: "github",
  groupName: "all",
  separateMajorMinor: false,
  gitAuthor: "simatic-ax-bot <ax-public@gmx.de>",
  prFooter: prFooter,
  requireConfig: "required",
  autodiscoverFilter: process.env.RENOVATE_AUTODISCOVERFILTER, // 
  autodiscover: true,
  allowPostUpgradeCommandTemplating: true,
  allowedPostUpgradeCommands: [".+"],
  logFile: process.env.LOG_FILE,
  logFileLevel: process.env.LOG_FILE_LEVEL || "trace",
  cacheDir: process.env.CACHE_DIR,
  allowScripts: true,
  exposeAllEnv: true,
  ignoreScripts: true,
  npmrc: process.env.RENOVATE_NPMRC,
  labels: ["renovate"],
  hostRules: [
    {
      hostType: "npm",
      matchHost: "registry.simatic-ax.siemens.io",
      token: process.env.RENOVATE_APAX_TOKEN,
    },
  ],
  regexManagers: [
    {
      fileMatch: ["(^|\\/)(test.|test-windows.)?apax.ya?ml$"],
      matchStrings: [
        // We're using `String.raw` here so that the RegEx can be easily copied from/to other tools (e.g. https://regex101.com/)
        String.raw`"(?<depName>@ax\/.*?)"\s*:\s*"?(?<currentValue>[\d\.^\-\w]*)"?`,
      ],
      datasourceTemplate: "npm",
      // Unfortunately setting the registryUrl here does not work properly.
      // The registry can only be set via the `npmrc` property in the package rules.
      // Seems to be an NPM-specific weird behavior of Renovate, maybe related to
      // https://github.com/renovatebot/renovate/issues/4224
      // registryUrlTemplate: "https://axciteme.siemens.com/registry/apax/"
    },
    {
      fileMatch: ["(^|\\/)(test.|test-windows.)?apax.ya?ml$"],
      matchStrings: [
        // We're using `String.raw` here so that the RegEx can be easily copied from/to other tools (e.g. https://regex101.com/)
        String.raw`#\s*renovate:\s+datasource=(?<datasource>.*?)\s+depName=(?<depName>[\.\w]+)[\s-]+[\w]+_VERSION\s*=\s*"?(?<currentValue>[\d\.^\-\w]*)"?`,
      ],
    },
  ],
  packageRules: [
    {
      // Set endpoint and credentials for the Apax registry
      matchPaths: ["**/{test.,test-windows.,}apax.y{a,}ml"],
      npmrc: apaxNpmrc,
    },
    {
      // Ensure lock files are updated
      matchPaths: ["**/apax.y{a,}ml"],
      postUpgradeTasks: {
        // Switch to the directory of the apax.yml and update the lock file if it exists.
        commands: [
          `
          cd ./{{{packageFileDir}}} &&
          if test -f apax-lock.json; then
            if apax install; then
              echo 'Successfully updated lock file.'
            else
              echo 'Failed to update lock file.'
            fi
          else
            echo 'No lock file to update.'
          fi
        `,
        ],
        fileFilters: ["**/apax-lock.json"],
          },
      },
    {
      "matchDatasources": ["docker"],
      "groupName": "all container images",
      "matchUpdateTypes": ["major", "minor", "patch", "pin", "pinDigest", "digest", "lockFileMaintenance", "rollback", "bump"]
    },
    {
      "matchPackagePatterns": ["^@{0,1}[Aa][Xx]"],
      "groupName": "AX Product Dependencies_V4",
      "matchUpdateTypes": ["major", "minor", "patch", "pin", "pinDigest", "digest", "lockFileMaintenance", "rollback", "bump"],
      },
      {
          // splite SDK out that it doesn't follow the rules regarding breaking changes and version number assignment
          "matchPackagePatterns": ["^@{0,1}[Aa][Xx]/[Ss][Dd][Kk]"],
          "groupName": "AX Product SDK_V4",
          "matchUpdateTypes": ["major", "minor", "patch", "pin", "pinDigest", "digest", "lockFileMaintenance", "rollback", "bump"],
      },
    {
    // ax simatic dependencies separated because of breaking changes
      "matchPackagePatterns": ["^@{0,1}[Ss][Ii][Mm][Aa][Tt][Ii][Cc]-[Aa][Xx]"],
      "groupName": "AX Github Comunity",
      "matchUpdateTypes": ["major", "minor", "patch", "pin", "pinDigest", "digest", "lockFileMaintenance", "rollback", "bump"],
    }
    ],
};
