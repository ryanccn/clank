import { Sha256 } from 'https://deno.land/std@0.112.0/hash/sha256.ts';
import { join } from 'https://deno.land/std@0.112.0/path/mod.ts';

import exists from './exists.ts';
import { debug, error } from './log.ts';

import type Options from './options.ts';

export const getCacheDir = async () => {
  const HOME = Deno.env.get('HOME');
  if (!HOME) {
    error('couldn\'t get home directory!');
    Deno.exit(1);
  }

  const XDG_CACHE = Deno.env.get('XDG_CACHE_HOME');
  const OS = Deno.build.os;

  if (XDG_CACHE) debug(`found XDG_CACHE to be ${XDG_CACHE}, using`);

  const CACHE_DIR = XDG_CACHE ??
      OS === 'darwin'
    ? join(HOME, 'Library', 'Caches', 'clank')
    : OS === 'windows'
    ? join(HOME, 'AppData', 'Local', 'clank', 'Cache')
    : OS === 'linux'
    ? join(HOME, '.cache', 'clank')
    : 'unknown';

  if (CACHE_DIR === 'unknown') {
    error('couldn\'t compute cache directory');
    Deno.exit(1);
  }
  if (!await exists(CACHE_DIR)) {
    await Deno.mkdir(CACHE_DIR, { recursive: true });
  }
  debug(`cache location: ${CACHE_DIR}`);

  return CACHE_DIR;
};

export const getCacheFile = async (
  fileName: string,
  options: Options,
) => {
  const data = await Deno.readFile(fileName);

  const optionsString = options.compiler + ':' +
    (options.compilerFlags ? options.compilerFlags?.join(',') : 'noflags');

  const hashData = new Uint8Array([
    ...data,
    ...new TextEncoder().encode(':::partition:::'),
    ...new TextEncoder().encode(optionsString),
  ]);

  const hash = new Sha256().update(hashData).hex();

  debug(
    `computed hash ${hash} for file ${fileName} w/ compiler ${options.compiler} & flags ${
      options.compilerFlags ? options.compilerFlags.join(', ') : 'none'
    }`,
  );

  return join(await getCacheDir(), `${hash}.clank.build`);
};
