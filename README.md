# TONC (TON Compiler)

Tired of trying to find TON binaries compiled for your system, we've got you covered.

This is a heavy rewrite of [ton-compiler](https://github.com/ton-foundation/ton-compiler) package, so kudos to its authors.
All commits were erased, because there were heavy binaries in git and we don't want them to stuck in history.

## Features

- 🚀 Binaries (fift and func) are compiled to WASM, runs anywhere without any hustle
- 🍰 Programmatic and CLI interfaces
- 💸 Ready to use in unit testing

## Install

```bash
npm install tonc
```

## How to use

This packages adds multiple binaries: func, fift and tonc.

- Fift compiler already has stdlib included
- Func compiler needs stdlib to be provided, you can use bundled version: `./node_modules/tonc/funclib/stdblib.fc`
- Ton Compiler is a wrapper to compile everything in one go

### Console Use

```bash
# Compile to binary form (for contract creation)
tonc --input ./wallet.fc --output ./wallet.cell

# Compile to fift (useful for debuging)
tonc --input ./wallet.fc --output ./wallet.fif --fift
```

## Programmatic use

```typescript
import { compileFunc } from "tonc";
let compiled = await compileFunc("source code");
console.log(compiled.fift); // Compiled Fift assembler
console.log(compiled.cell.toString("hex")); // Compiled cell
```

## Developments

Currently building WASM works only on Linux, though it should be possible on OS X too.

1. Install emscripten as explained in https://emscripten.org/docs/getting_started/downloads.html
2. Make sure you have installed git, curl, and build-tools (clang, cmake, etc)
3. Run `make compile`, this will bootstrap all needed file in `./build/` directory, compile binaries to WASM initially and copy those WASM files to `./bin/exec`
   It takes some time, so be patient
4. After that you can run `compile-only-ton`, which will only recompile TON to wasm

# License

MIT
