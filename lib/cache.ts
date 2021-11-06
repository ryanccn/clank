import { join, Sha256 } from '../_deps.ts';

import exists from './exists.ts';
import { debug, error } from './log.ts';

import type Options from './options.ts';

export const getCacheDir = async () => {
  const HOME = Deno.env.get('HOME');
  if (!HOME) {
    error('Couldn\'t get home directory!');
    Deno.exit(1);
  }

  const XDG_CACHE = Deno.env.get('XDG_CACHE_HOME');
  const OS = Deno.build.os;

  if (XDG_CACHE) debug(`Found XDG_CACHE to be ${XDG_CACHE}, using`);

  const CACHE_DIR = XDG_CACHE ??
      OS === 'darwin'
    ? join(HOME, 'Library', 'Caches', 'clank')
    : OS === 'windows'
    ? join(HOME, 'AppData', 'Local', 'clank', 'Cache')
    : OS === 'linux'
    ? join(HOME, '.cache', 'clank')
    : 'unknown';

  if (CACHE_DIR === 'unknown') {
    error('Couldn\'t compute cache directory');
    Deno.exit(1);
  }
  if (!await exists(CACHE_DIR)) {
    await Deno.mkdir(CACHE_DIR, { recursive: true });
  }
  debug(`Cache location: ${CACHE_DIR}`);

  return CACHE_DIR;
};

const splitTwo = (orig: string) => {
  if (orig.length % 2 !== 0) throw new Error('splitTwo string not even length');

  let ret: string[] = [];

  for (let i = 0; i < orig.length; i += 2) {
    ret = [...ret, orig[i] + orig[i + 1]];
  }

  return ret;
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
  const frags = splitTwo(hash);

  debug(
    `computed hash ${hash} for file ${fileName} w/ compiler ${options.compiler} & flags ${
      options.compilerFlags ? options.compilerFlags.join(', ') : 'none'
    }`,
  );

  const smallCacheDir = join(
    await getCacheDir(),
    ...frags.slice(0, -1),
  );

  if (!await exists(smallCacheDir)) {
    await Deno.mkdir(smallCacheDir, { recursive: true });
  }

  return join(
    smallCacheDir,
    `${frags[frags.length - 1]}.clank.build`,
  );
};
