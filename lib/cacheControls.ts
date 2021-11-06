import { join } from '../_deps.ts';
import { debug } from './log.ts';
import { getCacheDir } from './cache.ts';

const LIMIT = 0.5 * 1000 * 1000 * 1000; // 0.5 GB

type FileData = (Deno.DirEntry & {
  path?: string;
  size?: number;
  removalIndex?: number;
});

export const dfsInfo = async (dir: string) => {
  const asyncIterFiles = Deno.readDir(dir);
  let totalSize = 0;

  let files: FileData[] = [];

  for await (const x of asyncIterFiles) {
    if (x.isFile) {
      const path = join(dir, x.name);

      const stats = await Deno.stat(path);
      const size = stats.size;
      const staleness = Date.now() - (stats.birthtime?.getTime() ?? Infinity);

      totalSize = totalSize + size;
      files = [...files, {
        ...x,
        path,
        size,
        removalIndex: size * staleness,
      }];
    } else if (x.isDirectory) {
      const deeperInfo = await dfsInfo(join(dir, x.name));

      files = [...files, ...deeperInfo.files];
      totalSize += deeperInfo.size;
    } else {
      throw new Error('symlink found!');
    }
  }

  return { size: totalSize, files };
};

export const prune = async () => {
  const dir = await getCacheDir();

  let { size, files } = await dfsInfo(dir);

  if (size <= LIMIT) return -1;

  let i = 0;

  while (size > LIMIT) {
    await Deno.remove(files[i].path!);
    size -= files[i].size ?? 0;

    i++;
    debug(
      `Deleted ${files[i].name} from cache, removal index ${
        files[i].removalIndex
      }`,
    );
    debug(`Cache size now ${(size / 1000 / 1000).toFixed(2)}MB`);
  }

  return size;
};

export const clean = async () => {
  const dir = await getCacheDir();

  await Deno.remove(dir, { recursive: true });
  await Deno.mkdir(dir, { recursive: true });
};
