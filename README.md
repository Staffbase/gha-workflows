# Reusable Workflows from the Enthusiasts 🎉

The repository contains all general workflows which can be used for every workflow in another repository.
If you want to have more information you can take a look at the [GitHub documentation][1].

If you want to use a template workflow you can copy this template and adapt it to your use.
You can find all possible template workflows in the directory `.github/workflows` with the name `template_*.yml`.

```yml
name: <your name>

on:
  ...

jobs:
  <action name>:
    uses: Staffbase/workflows/.github/workflows/template_*.yml@main
    with:
      ...
```

[1]: https://docs.github.com/en/actions/learn-github-actions/reusing-workflows
