# @himenon/git-control-js

Wrapper for using git commands in Node.js.

## Install

```
yarn add @himenon/git-control-js
```

## Usage

```ts
import * as GitControl from "@himenon/git-control-js";

const main = async () => {
  const git = GitControl.Wrap.create(process.cwd());
  await git.clone({
    owner: "Himenon",
    repo: "git-control-js",
    branch: "main",
    baseUrl: "https://github.com",
    baseSsh: "git@github.com",
    protocol: "https",
    outputDir: process.cwd(),
    authToken: "", // https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#http-based-git-access-by-an-installation
  });

  const latestCommitDate = await git.getLatestCommitDate()
  console.log(latestCommitDate);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
})
```

## Development

| scripts                   | description                                 |
| :------------------------ | :------------------------------------------ |
| `build`                   | typescript build and create proxy directory |
| `clean`                   | clean up                                    |
| `format:code`             | prettier                                    |
| `format:yarn:lock`        | yarn.lock deduplicate                       |
| `lerna:version:up`        | lerna version up                            |
| `test`                    | execute test:depcruise, test:jest           |
| `test:depcruise`          | dependency-cruiser's test                   |
| `test:jest`               | jest test                                   |
| `ts`                      | execute ts-node                             |
| `release:github:registry` | publish github registry                     |
| `release:npm:registry`    | publish npm registry                        |

## Features

- [Proxy Directory](https://himenon.github.io/docs/javascript/proxy-directory-design-pattern/)

## Release

- Automatic version updates are performed when merged into the `main` branch.

## LICENCE

[@himenon-git-control-js](https://github.com/Himenon/git-control-js)・MIT
