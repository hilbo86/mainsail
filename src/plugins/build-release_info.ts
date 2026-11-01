import fs from 'fs'
import path from 'path'
import pkg from '../../package.json' with { type: 'json' }
import type { PluginOption } from 'vite'

/**
 * Custom build plugin to write the version in a dedicated release_info.json file after bundling
 */

export default function buildReleaseInfo(): PluginOption {
    const version = pkg.version

    return {
        name: 'build-release_info',
        writeBundle: () => {
            setImmediate(async () => {
                const versionIdentifier = process.env.MAINSAIL_BUILD_VERSION ?? `v${version}`
                const releaseInfoFile = await fs.promises.open(
                    path.resolve(import.meta.dirname, '../../dist/release_info.json'),
                    'w'
                )
                await releaseInfoFile.writeFile(
                    JSON.stringify({
                        project_name: process.env.MAINSAIL_PROJECT_NAME ?? 'mainsail',
                        project_owner: process.env.MAINSAIL_PROJECT_OWNER ?? 'mainsail-crew',
                        version: versionIdentifier,
                    })
                )
                await releaseInfoFile.close()
            })
        },
    }
}
