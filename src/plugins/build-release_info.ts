import fs from 'fs'
import path from 'path'
import { version } from '../../package.json'
import { PluginOption } from 'vite'

/**
 * Custom build plugin to write the version in a dedicated release_info.json file after bundling
 */

export default function buildReleaseInfo(): PluginOption {
    return {
        name: 'build-release_info',
        writeBundle: () => {
            setImmediate(async () => {
                const versionIdentifier = process.env.MAINSAIL_BUILD_VERSION ?? `v${version.toString()}`
                const releaseInfoFile = await fs.promises.open(
                    path.resolve(__dirname, '../../dist/release_info.json'),
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
