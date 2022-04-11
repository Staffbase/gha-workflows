# Reusable Workflows from the Enthusiasts 🎉

The repository contains all general workflows which can be used for every workflow in another repository.
If you want to have more information you can take a look at the [GitHub documentation][1].

If you want to use a template workflow you can copy this template and adapt it to your specific use case.
You can find all possible template workflows in the directory `.github/workflows` with the name `template_*.yml`.

```yml
name: <your name>

on:
  ...

jobs:
  <action name>:
    uses: Staffbase/gha-workflows/.github/workflows/template_*.yml@<version>
    with:
      ...
```

## Example Configurations 🔧

In the next sections you can find examples for the template workflows. For more information, please take a look at the templates.

### AutoDev

<details>
<summary>The action can be used to merge labeled pull requests into a branch.</summary>

```yml
name: Autodev
on:
  push:
    branches-ignore:
      - dev
  pull_request:
    types: [labeled, unlabeled, opened, closed]

jobs:
  update_release_draft:
    uses: Staffbase/gha-workflows/.github/workflows/template_autodev.yml@<version>
    with:
      token: ${{ secrets.DEV_PUSH_TOKEN }}
      user: ${{ secrets.DEV_PUSH_USER }}
```
</details>

<details>
<summary>You can also use the manual script to merge labeled pull requests into a branch.</summary>

```yml
name: Autodev
on:
  push:
    branches-ignore:
      - dev
  pull_request:
    types: [labeled, unlabeled, opened, closed]

jobs:
  update_release_draft:
    uses: Staffbase/gha-workflows/.github/workflows/template_autodev_script.yml@<version>
    with:
      token: ${{ secrets.DEV_PUSH_TOKEN }}
```
</details>

### Release Drafter

<details>
<summary>The action can be used to draft automatically a new release.</summary>

```yml
name: Release Drafter

on:
  push:
    branches:
      - main

jobs:
  update_release_draft:
    uses: Staffbase/gha-workflows/.github/workflows/template_release_drafter.yml@<version>
```
</details>

### Stale

<details>
<summary>The action can be used to close old pull requests or issues automatically after a few days.</summary>

```yml
name: Stale PRs

on:
  schedule:
    - cron: "0 0 * * 1-5"

jobs:
  stale:
    uses: Staffbase/gha-workflows/.github/workflows/template_stale.yml@<version>
```
</details>

### Yamllint

<details>
<summary>The action can be used to check yaml files for formatting.</summary>

```yml
name: YAMLlint

on:
  push:
    branches:
      - '**'
    tags-ignore:
      - '**'

jobs:
  yamllint:
    uses: Staffbase/gha-workflows/.github/workflows/template_yaml.yml@<version>
```
</details>

## Release 🔖

To create a new release just use [this page][2] and publish the draft release.

## Contributing 👥

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License 📄

This project is licensed under the Apache-2.0 License - see the [LICENSE.md](LICENSE) file for details.

[1]: https://docs.github.com/en/actions/learn-github-actions/reusing-workflows
[2]: https://github.com/Staffbase/gha-workflows/releases
