# BLOCKSET-JS

The `blockset-js` application is a command line program that can retrieve data blocks using a content-dependent tree (CDT) hash function as a universal address of the blocks.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/current).
- [Blockset](https://github.com/datablockset/blockset), if you need to add files to a blockset repository.

## Installation

To install the latest stable version from [npmjs.com](https://npmjs.com/), run:

```console
npm install -g blockset-js
```

To unininstall the `blockset`, run:

```console
npm uninstall -g blockset-js
```

## Usage

Get a file by address:

```console
npx blockset-js <address> <outputFile> [hostName]
```

### Examples

Get a file from remote storage:

```console
npx blockset-js awt9x8564999k276wap2e5b7n10575ffy946kencva4ve out.txt 410f5a49.blockset-js-test.pages.dev
```

Get a file from local storage:

```console
npx blockset-js hsdfs1zs8fnf810v8f9k6pjdkz7b4y95sembmswac5sjt out.txt
```