# clank

A simple CLI that runs your C++ code just in time.

Built with Deno.

## 👾 Installation

```bash
$ deno install -fAq --name="clank" https://deno.land/x/clank/mod.ts
```

## 🚀 Features

- **Passthrough** `stdin`, `stdout` and `stderr`
- Prints **status code**
- A **cache** based on unique hashes of files
- **Automatically limiting** said cache to 0.5 GB
- Looks great

## 🚧 Roadmap

- [ ] Config file
- [ ] Options to compiler
- [ ] Configure which compiler to use
- [ ] More tests
