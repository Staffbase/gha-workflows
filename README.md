# Staffbase Open Source Repository Template

This repository should be used as a template or model for projects we like to publish as Open Source.

Please note this is the instance for projects we want to publish below the **Apache 2.0** license. There might be other permitted licenses in the future.

Please adhere to the [**Staffbase Open Source Policy**](https://mitarbeiterapp.atlassian.net/wiki/spaces/LEGAL/pages/1369178123/Staffbase+Open+Source+Policy). Do not publish anything without following this policy.

This repository shows the structure of an compliant OSS project with the following documents and tools: 

* [LICENSE](../master/LICENSE) file
* [CONTRIBUTING.md](../master/CONTRIBUTING.md) file (clarifying how to contribute)
* [CLA.md](../master/CLA.md) file (a Contributor License Agreement, see below)
* Every source code file ([example](../master/src/main/your-code-files-here.js)) must start with a license header (see below) 
* A [configuration](../master/.github/workflows/cla.yml) for the CLA Assistant Lite

## Source File License Header
Please adjust the block comment syntax to your programming language ;)

Please adjust the year(s) at the copyright statement following [this section at our Open Source Policy](https://mitarbeiterapp.atlassian.net/wiki/spaces/LEGAL/pages/1600422442/Copyright+Statements+in+Staffbase+Code+Files).

```
/*
Copyright 2020, Staffbase GmbH and contributors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.

You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

```

## What is an CLA or *Contributor License Agreement*?
- In order to allow other Non-Staffpranos to contribute to our public repositories, those contributors need to sign an agreement to lower the risk for Staffbase to introduce serious legal issues when incorporating outside contributions.

- That's a common process at the Open Source community and you find lots of those agreements at GitHub.

- Staffbase Legal has created our own CLA [which you can find right here](../master/CLA.md).  

- To streamline this digital signing process, there are some tools around that integrate with GitHub.

- We're using CLA Assistant and currently experimenting with the *Lite* version, because it uses a local storage (and is not connecting another SaaS solution) of the signatures and runs as a GitHub Action directly below the respective repository.

- This GitHub Action adds a check to every Pull Request and blocks the merging until all contributors have signed the CLA (by commenting a line like "I have read the CLA Document and I hereby sign the CLA" to the PR).


## How to adjust the CLA Assistant Lite?
The central configuration is below the GitHub Action configuration: 

[.github/workflows/cla.yml](../master/.github/workflows/cla.yml)

- The signatures are simply stored within a JSON document
- This document gets updated as soon as a contributor signs the CLA
- Since the main (legacy master) branch should be protected, the default branch for those signatures is now *signatures*. Make sure to create this branch initially.
- **Important** You need to set the `PERSONAL_ACCESS_TOKEN` as secret. See https://github.
  com/cla-assistant/github-action#6-adding-personal-access-token-as-a-secret
- You can also add whitelisted users, who don't need to sign the CLA. Please do this only with Staffpranos.
- **Important**: Once a Staffprano has left Staffbase, we need to make sure to remove this user from those whitelists (!).


