# Setup Artifact Registry

Federates into Google Artifact Registry and configures the clients that need it. The job exchanges
its OIDC token for a Google access token and writes it into the selected clients' credential files
(a Docker login, `.npmrc`, a Maven `settings.xml`); no long-lived credential is stored anywhere.
That access token expires after one hour by default, so a job that publishes later than that must
re-run this action to re-authenticate.

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

      - uses: Staffbase/gha-workflows/actions/setup-artifact-registry@80c6d3ebfeab93ddf58a09e0041135de640b949d # unreleased
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
| `service-account` | Account to impersonate | `github-artifact-publisher@global-iam-436113` |
| `docker-registry` | Registry host to log in to | `europe-docker.pkg.dev` |
| `npm-registry` | Endpoint the npm credential is written for | `https://europe-npm.pkg.dev/staffbase-artifacts/npm/` |
| `maven-registry` | Endpoint the generated `settings.xml` mirrors all repository requests to | `https://europe-maven.pkg.dev/staffbase-artifacts/maven` |

## Outputs

| Name | Description |
| ---- | ----------- |
| `access-token` | The access token, masked in logs. Pass it to a build that authenticates itself. Expires after one hour by default. |
| `maven-settings-path` | Path to the job-scoped `settings.xml` written when `maven` is configured. Pass it to Maven with `--settings`. |

## What each client does

**docker** logs in to `docker-registry`, so `docker build`, `docker push` and Jib all work.

**npm** writes credentials for `npm-registry` to a job-scoped `.npmrc` under `RUNNER_TEMP`, and
points npm at it via `NPM_CONFIG_USERCONFIG`. It writes the credential only: which registry a
project resolves from stays in the project's own `.npmrc`, so this never silently repoints a
build.

**maven** writes a job-scoped `settings.xml` under `RUNNER_TEMP` (path in the `maven-settings-path`
output) with a `server` entry and a mirror that sends all repository requests to `maven-registry`.
Pass the path explicitly, e.g. `mvn --settings "${{ steps.gar.outputs.maven-settings-path }}"`.

Both credential files are written with `600` permissions and live under `RUNNER_TEMP`, which the
runner empties at the end of the job — nothing is left behind for a later job on the same runner
to read.

## Installing inside a Docker build

An `npm install` that runs in a `RUN` layer cannot see the runner's npm credentials. Pass the token
as a build secret instead:

```yaml
      - uses: Staffbase/gha-workflows/actions/setup-artifact-registry@80c6d3ebfeab93ddf58a09e0041135de640b949d # unreleased
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
