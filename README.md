# BLOCKSET-JS

The `blockset-js` application is a command line program that can retrieve data blocks using a content-dependent tree (CDT) hash function as a universal address of the blocks.

## Usage

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install).
- For Windows, you may need Visual C++. You can get either
  - by installing [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/),
  - or adding [Desktop development with C++](https://learn.microsoft.com/en-us/cpp/build/vscpp-step-0-installation?view=msvc-170) to Visual Studio.
- [Blockset](https://github.com/datablockset/blockset).

## Installation

To install the latest stable version from [crates.io](https://crates.io/crates/blockset), run:

```console
npm install blockset-js
```

To unininstall the `blockset`, run:

```console
npm uninstall blockset-js
```

## Commands

Get a file by address:

```console
npx blockset-js hsdfs1zs8fnf810v8f9k6pjdkz7b4y95sembmswac5sjt out.txt
```
