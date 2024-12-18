const prFooter = `:space_invader: :sparkles: This merge request is proudly presented by [Renovate Bot](https://code.siemens.com/ax/devops/renovate-bot).`;
const autodiscoverFilter = "simatic-ax/*";
module.exports = {
    platform: "github",
    gitAuthor: "simatic-ax-bot <ax-public@gmx.de>",
    prFooter: prFooter,
    requireConfig: "required",
    autodiscoverFilter: autodiscoverFilter,
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
    ]
};
