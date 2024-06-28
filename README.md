# action-publish
GitHub action for publishing a package

## Setup
To set up publishing for a package repository add the following to `./github/workflows/publish.yml`:
```yml
name: Publish package

on:
  push:
    tags:
    - 'v[0-9]+.[0-9]+.[0-9]+'
    - 'v[0-9]+.[0-9]+.[0-9]+-*'

jobs:
  create-release:
    name: Create new release
    runs-on: ubuntu-latest
    steps:
      - name: Publish
        uses: toitlang/action-publish@v1.5.0
```
