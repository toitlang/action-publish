# pkg-publish
GitHub action for publishing a package

## Setup
To set up publishing for a package repository add the following to `./github/workflows/publish.yml`:
```
name: Publish package
on:
  push:
    tags:
    - 'v*'
jobs:
  create-release:
    name: Create new release
    runs-on: ubuntu-latest
    steps:
      - name: Publish
        uses: toitlang/pkg-publish@v1
```
