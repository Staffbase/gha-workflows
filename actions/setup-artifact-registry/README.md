# Setup Artifact Registry

Federates into Google Artifact Registry and configures the clients that need it. No credential is
stored anywhere: the job exchanges its OIDC token for a Google access token that lasts as long as
the run.

## Usage

```yaml
jobs:
  build:
    runs-on: ubuntu-24.04
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v6

      - uses: Staffbase/gha-workflows/actions/setup-artifact-registry@1ad4ec63950c1dd36695bc073bc101f816dd8c06 # v17.0.2
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
| `maven-registry` | Endpoint written into the generated `settings.xml` | `https://europe-maven.pkg.dev/staffbase-artifacts/maven` |

## Outputs

| Name | Description |
| ---- | ----------- |
| `access-token` | The access token, masked in logs. Pass it to a build that authenticates itself. |

## What each client does

**docker** logs in to `docker-registry`, so `docker build`, `docker push` and Jib all work.

**npm** appends credentials for `npm-registry` to `~/.npmrc`. It writes the credential only: which
registry a project resolves from stays in the project's own `.npmrc`, so this never silently
repoints a build.

**maven** writes `~/.m2/settings.xml` with a `server` entry under the id `artifact-registry`.
Reference that id from the project's `repository` definition. The step fails rather than
overwriting an existing `settings.xml`.

## Installing inside a Docker build

An `npm install` that runs in a `RUN` layer cannot see the runner's `~/.npmrc`. Pass the token as a
build secret instead:

```yaml
      - uses: Staffbase/gha-workflows/actions/setup-artifact-registry@1ad4ec63950c1dd36695bc073bc101f816dd8c06 # v17.0.2
        id: gar

      - uses: docker/build-push-action@v7
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
