# Setup Artifact Registry

Federates into Google Artifact Registry and configures the clients that need it. The job exchanges
its OIDC token for a Google access token and writes it into the selected clients' credential files
(a Docker login, `.npmrc`, a Maven `settings.xml`); no long-lived credential is stored anywhere.
That access token expires after one hour by default, so a job that publishes later than that must
re-run this action to re-authenticate. `maven` in `configure` requires `python3` on the runner
(present by default on GitHub-hosted runners) to merge Maven credentials into `settings.xml`.

## Usage

```yaml
jobs:
  build:
    runs-on: ubuntu-24.04
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0

      - uses: Staffbase/gha-workflows/actions/setup-artifact-registry@b33aec6ee6d058c287820ad2fac4874f45d12227 # v17.2.0
        id: gar
        with:
          configure: docker,npm
```

**The `permissions` block is required.** A composite action cannot request a permission for itself,
so without `id-token: write` on the calling job the token exchange fails.

## Inputs

| Name | Description | Default |
| ---- | ----------- | ------- |
| `configure` | Clients to configure: `docker`, `npm`, `maven`, comma-separated | `docker` |
| `workload-identity-provider` | Provider to federate through | the Staffbase pool |
| `service-account` | Account to impersonate | `github-artifact-publisher@global-iam-436113.iam.gserviceaccount.com` |
| `docker-registry` | Registry host to log in to | `europe-docker.pkg.dev` |
| `npm-registry` | Endpoint the npm credential is written for | `https://europe-npm.pkg.dev/staffbase-artifacts/npm/` |
| `maven-registry` | Endpoint the generated `settings.xml` mirrors all repository requests to | `https://europe-maven.pkg.dev/staffbase-artifacts/maven` |
| `maven-server-id` | Server ID the Maven credential is registered under; set it to the project's `distributionManagement.repository` ID if that differs | `artifact-registry` |
| `maven-snapshot-server-id` | Additional server ID for the same credential, if `distributionManagement.snapshotRepository` uses a different ID | none |

## Outputs

| Name | Description |
| ---- | ----------- |
| `access-token` | The access token, masked in logs. Pass it to a build that authenticates itself. Expires after one hour by default. |
| `maven-settings-path` | Path to the job-scoped `settings.xml` written when `maven` is configured. Pass it to Maven with `--settings`. |

## What each client does

**docker** logs in to `docker-registry`, so `docker build`, `docker push` and Jib all work.

**npm** starts from the caller's active user config — `NPM_CONFIG_USERCONFIG` if already set (for
example by `actions/setup-node`), otherwise `~/.npmrc` — copies it into a job-scoped file under
`RUNNER_TEMP`, appends credentials for `npm-registry`, and points npm at that copy via
`NPM_CONFIG_USERCONFIG`. It writes the credential only: which registry a project resolves from
stays in the project's own `.npmrc`, so this never silently repoints a build.

**maven** merges into a job-scoped copy of the caller's `~/.m2/settings.xml` (if present, other
servers/profiles/proxies survive, and its Maven Settings namespace is respected) under
`RUNNER_TEMP` (path in the `maven-settings-path` output): a mirror that sends all repository
*downloads* to `maven-registry`, authenticated under the server id `artifact-registry`, plus a
`server` entry for `maven-server-id` and, if set, `maven-snapshot-server-id`. A `deploy` is
authenticated separately from downloads, by the ID in the project's
`distributionManagement.repository` (or `.snapshotRepository`), not by the mirror — set those
inputs to match when they are not `artifact-registry`. Pass the settings path explicitly, e.g.
`mvn --settings "${{ steps.gar.outputs.maven-settings-path }}"`.

The action fails rather than guess if the caller's `~/.m2/settings.xml` already defines another
mirror: Maven picks whichever mirror matches a repository first by document order, not by
specificity, so silently adding ours could leave either mirror shadowed. Remove the conflicting
mirror, or don't use `maven` from this action, if that happens.

Both credential files are written with `600` permissions and live under `RUNNER_TEMP`, which the
runner empties at the end of the job — nothing is left behind for a later job on the same runner
to read.

## Installing inside a Docker build

An `npm install` that runs in a `RUN` layer cannot see the runner's npm credentials. Pass the token
as a build secret instead:

```yaml
      - uses: Staffbase/gha-workflows/actions/setup-artifact-registry@b33aec6ee6d058c287820ad2fac4874f45d12227 # v17.2.0
        id: gar

      - uses: docker/build-push-action@c3c9e263c25d99ce0380d002d59b67737d91b0dc # v7.4.0
        with:
          secrets: |
            gar=${{ steps.gar.outputs.access-token }}
```

```dockerfile
RUN --mount=type=secret,id=gar,env=NODE_AUTH_TOKEN npm ci
```

with the project's `.npmrc` reading the token from that variable:

```text
registry=https://europe-npm.pkg.dev/staffbase-artifacts/npm/
//europe-npm.pkg.dev/staffbase-artifacts/npm/:_authToken=${NODE_AUTH_TOKEN}
//europe-npm.pkg.dev/staffbase-artifacts/npm/:always-auth=true
```

One endpoint serves public packages, Staffbase packages and the `@staffbase` scope, so a project
that migrates drops its `registry.npmjs.org` and `npm.pkg.github.com` entries and the GitHub token
behind them.

A project-level `_authToken` entry like this one takes precedence over the job-scoped `.npmrc`
this action writes when `configure` includes `npm`. If the same job also runs `npm ci` directly on
the runner (not just inside the Docker build), either export `NODE_AUTH_TOKEN` from the action's
`access-token` output for that step too, or keep the `_authToken` entry in a Docker-specific
`.npmrc` that the runner-side install never reads.
