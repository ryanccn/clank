import { join } from 'https://deno.land/std@0.112.0/path/mod.ts';
import { debug } from './log.ts';
import { getCacheDir } from './cache.ts';

const LIMIT = 0.5 * 1000 * 1000 * 1000; // 0.5 GB

export const getInfo = async (dir: string) => {
  let totalSize = 0;

  const asyncIterFiles = Deno.readDir(dir);
  const files:
    ({ name: string; size: number; path: string; removalIndex: number })[] = [];

  for await (const x of asyncIterFiles) {
    const path = join(dir, x.name);

    const stats = await Deno.stat(path);
    const size = stats.size;
    const staleness = Date.now() - (stats.birthtime?.getTime() ?? Infinity);

    totalSize += size;
    files.push({ name: x.name, path, size, removalIndex: size * staleness });
  }

  debug(`cache size ${(totalSize / 1000 / 1000).toFixed(2)}MB`);

  return {
    size: totalSize,
    files: files.sort((a, b) => a.removalIndex < b.removalIndex ? 1 : -1),
  };
};

export const prune = async () => {
  const dir = await getCacheDir();

  let { size, files } = await getInfo(dir);

  if (size <= LIMIT) return -1;

  let i = 0;

  while (size > LIMIT) {
    await Deno.remove(files[i].path);
    size -= files[i].size;

    i++;
    debug(
      `deleted ${files[i].name} from cache, removal index ${
        files[i].removalIndex
      }`,
    );
    debug(`cache size now ${(size / 1000 / 1000).toFixed(2)}MB`);
  }

  return size;
};

export const clean = async () => {
  const dir = await getCacheDir();

  await Deno.remove(dir, { recursive: true });
  await Deno.mkdir(dir, { recursive: true });
};
