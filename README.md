# clank

A simple CLI that runs your C++ code just in time.

Built with Deno.

## 👾 Installation

```bash
$ deno install -Af -n "clank" https://deno.land/x/clank/mod.ts
```

## 🔥 Usage

```bash
# Basic help text:
$ clank

# Run a C++ script:
$ clank hello.cpp

# See juicy debug info:
$ CLANK_DEBUG=1 clank hello.cpp

# Inspect the cache:
$ clank cache list

# Clear the cache:
$ clank cache clean

# Prune the cache (limit it to 0.5 GB):
$ clank cache prune

# Upgrade clank:
$ clank upgrade
```

## 🚀 Features

- **Passthrough** `stdin`, `stdout` and `stderr`
- Prints **status code**
- A **cache** based on unique hashes of files
- **Smart deletion** of cached files to keep cache size under 0.5 GB
- Configure **which compiler** to use
- Passing options **directly to compilers**
- An incredibly convenient **upgrade command**
- Looks great

## 🚧 Roadmap

- [ ] Config file
- [x] Smarter deletion algo
- [x] Options to compiler
- [x] Configure which compiler to use
- [x] More tests
