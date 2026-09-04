# TH-Mod synchronization and releases

`TH-Mod` is the deployment branch for this fork. The
`sync-th-mod-release.yml` workflow keeps it combined with
`mainsail-crew/mainsail:develop` and publishes installable web releases.

## Automated flow

The workflow runs daily at 04:25 UTC, after pushes to `TH-Mod`, and on manual
dispatch. It performs these operations in order:

1. Merge upstream `develop` into the fork's `develop` branch.
2. Merge the fork's `develop` branch into `TH-Mod`.
3. Run lint, unit tests, and a production build.
4. Push both branches atomically only after successful validation.
5. Publish `dist/mainsail.zip` as the latest stable GitHub release.

A merge conflict, failed test, or failed build stops the workflow before it
updates either branch or creates a release. The last working release therefore
remains available to printers.

Release tags use the stable SemVer-compatible format
`v<UTC year>.<UTC month and day>.<workflow run number>`. The archive contains a
matching `.version` and `release_info.json` for `hilbo86/mainsail`, as required
by Moonraker's `web` updater.

## Manual release

Open **Actions**, select **Sync and release TH-Mod**, then choose
**Run workflow**. Enable
`force_release` to rebuild and publish the current `TH-Mod` commit even if
upstream has not changed.

The workflow is stored on both `develop` and `TH-Mod`. GitHub reads scheduled
workflows from the repository's default branch, which is currently `develop`.
Keep the workflow copies synchronized if the workflow itself is changed.

## Moonraker configuration

After the first TH-Mod release exists, point each printer at this fork:

```ini
[update_manager mainsail]
type: web
channel: stable
repo: hilbo86/mainsail
path: ~/mainsail
refresh_interval: 24
```

The existing Mainsail installation may initially be reported as invalid because
its `release_info.json` names `mainsail-crew` as the owner. Use the update
manager's recovery action once to install the latest TH-Mod release. Subsequent
updates use the normal update action.
