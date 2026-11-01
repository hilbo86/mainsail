import fs from 'fs'
import path from 'path'
import pkg from '../../package.json' with { type: 'json' }
import type { PluginOption } from 'vite'

/**
 * Custom build plugin to write the version in a dedicated .version file after bundling
 */

export default function buildVersion(): PluginOption {
    const version = pkg.version

    return {
        name: 'build-version',
        writeBundle: () => {
            setImmediate(async () => {
                const versionIdentifier = process.env.MAINSAIL_BUILD_VERSION ?? `v${version}`
                const versionFile = await fs.promises.open(
                    path.resolve(import.meta.dirname, '../../dist/.version'),
                    'w'
                )
                await versionFile.writeFile(versionIdentifier)
                await versionFile.close()
            })
        },
    }
}
