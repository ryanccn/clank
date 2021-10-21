import { join } from 'https://deno.land/std@0.112.0/path/mod.ts';
import { debug } from './log.ts';
import { getCacheDir } from './cache.ts';

const LIMIT = 0.5 * 1000 * 1000 * 1000; // 0.5 GB

async function convert<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of gen) {
    out.push(x);
  }
  return out;
}

const getInfo = async (dir: string) => {
  let size = 0;
  const files = await convert(Deno.readDir(dir));

  for (const i in files) {
    const p = join(dir, files[i].name);
    size += (await Deno.stat(p)).size;
  }

  debug(`cache size ${(size / 1000 / 1000).toFixed(2)}MB`);

  return { size, files };
};

export default async () => {
  const dir = await getCacheDir();
  let { size, files } = await getInfo(dir);

  // 0.5GB
  if (size <= LIMIT) return false;

  let i = 0;

  while (size > LIMIT) {
    const p = join(dir, files[i].name);
    const s = (await Deno.stat(p)).size;

    await Deno.remove(p);
    size -= s;

    i++;
    debug(`deleted ${files[i].name} from cache`);
    debug(`cache size now ${(size / 1000 / 1000).toFixed(2)}MB`);
  }

  return true;
};
