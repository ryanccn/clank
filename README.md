# clank

A simple CLI that runs your C++ code just in time.

Built with Deno.

## 👾 Installation

```bash
$ deno install -Af -n "clank" https://deno.land/x/clank/mod.ts
```

Alternatively, you can download a binary from the [releases page](https://github.com/ryanccn/clank/releases/). The upgrade command **does** work in the standalone binary.

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

# Add autocompletion to your shell:
$ source <(clank completions bash)        # bash => ~/.bashrc
$ source (clank completions fish | psub)  # fish => ~/.config/fish/config.fish
$ source <(clank completions zsh)         # zsh  => ~/.zshrc

# Upgrade clank:
$ clank upgrade
```

## 🚀 Features

- **Passthrough** `stdin`, `stdout` and `stderr`
- Prints **status code** and corresponding signal
- A **cache** based on unique hashes of files
- **Smart deletion** of cached files to keep cache size under 0.5 GB
- Configure **which compiler** to use
- Passing options **directly to compilers**
- An incredibly convenient **upgrade command**
- **Shell autocompletion** support
- Looks great

## 🚧 Roadmap

- [ ] Config file
- [x] Smarter deletion algo
- [x] Options to compiler
- [x] Configure which compiler to use
- [x] More tests

## 🧑‍💻 Development

The [Velociraptor](https://velociraptor.run) script runner is used for productivity.

```bash
# Build native binaries
$ vr build

# Install your local version of clank as `clank-dev`
$ vr install-dev

# Run tests
$ vr test
```
