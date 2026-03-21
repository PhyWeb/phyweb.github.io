const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const isCI = process.env.CI === 'true';

module.exports = {
  packagerConfig: {
    prune: true,
    asar: true,
    ignore: "/portable",
    icon: './assets/icons/phyweb'
  },

  rebuildConfig: {},

  makers: [
    {
      name: '@rabbitholesyndrome/electron-forge-maker-portable',
      config: {
        icon: './assets/icons/phyweb.png',
        nsis: {
          installerIcon: './assets/icons/phyweb.png',
          installerHeaderIcon: './assets/icons/phyweb.png'
        }
      },
    },

    {
      name: '@electron-forge/maker-appx',
      config: {
        identityName: 'PhyWeb.PhyWeb',
        publisher: 'CN=2A272021-41C4-4363-BC75-191E2B3B681C',
        publisherDisplayName: 'PhyWeb',
        languages: ['fr-FR'],
        assets: './assets/appx',
        manifest: './appxmanifest.xml'
      }
    },

    // Flatpak sécurisé (runtime corrigé)
    ...(
      isCI
        ? [
            {
              name: '@electron-forge/maker-flatpak',
              config: {
                options: {
                  id: 'io.github.phyweb',
                  productName: 'PhyWeb',
                  runtimeVersion: '23.08',
                  base: 'org.electronjs.Electron2.BaseApp',
                  baseVersion: '23.08',
                  sdkExtensions: ['org.freedesktop.Sdk.Extension.llvm16'],
                  buildOptions: {
                    prependPath: '/usr/lib/sdk/llvm16/bin',  // camelCase → le bundler le convertit
                    env: {
                      CC:  '/usr/lib/sdk/llvm16/bin/clang',
                      CXX: '/usr/lib/sdk/llvm16/bin/clang++',
                      // PATH explicite en fallback si prependPath ne prend pas effet
                      PATH: '/usr/lib/sdk/llvm16/bin:/app/bin:/usr/bin:/bin'
                    }
                  }
                }
              }
            }

          ]
        : []
    )
  ],

  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};