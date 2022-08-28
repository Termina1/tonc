# TONC (TON Compiler)

Packaged Func compiler for TON smart contracts.

This is a heavy rewrite of [ton-compiler](https://github.com/ton-foundation/ton-compiler) package, so kudos to its authors.
All commits were erased, because there were heavy binaries in git and we don't want them to stuck in history.

## Features

- 🚀 Automatically downloads binaries from last release for you OS
- 🍰 Programmatic and CLI interfaces
- 💸 Ready to use in unit testing

## Install

```bash
npm install tonc

npx func-install // or
./node_modules/.bin/func-install // to download binaries
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

# License

MIT
