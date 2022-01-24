import type { ScriptsConfiguration } from 'https://deno.land/x/velociraptor@1.3.0/mod.ts';

export default <ScriptsConfiguration> {
  // importMap: './import_map.json',

  scripts: {
    build: {
      cmd: '_build.ts',
      allow: ['run', 'read', 'write'],
      desc: 'Build native binaries',
    },
    'install-dev': {
      cmd: 'deno install -Af -n "clank-dev" mod.ts',
      desc: 'Install your local version of clank as `clank-dev`',
    },
    test: {
      cmd: 'deno test',
      allow: ['all'],
      desc: 'Run tests',
    },
  },
};
