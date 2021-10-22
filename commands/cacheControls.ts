import { blue, bold, Command, join, Table } from '../_deps.ts';

import { success, warning } from '../lib/log.ts';

import { getCacheDir } from './../lib/cache.ts';
import { clean, prune } from './../lib/cacheControls.ts';

const cmd = new Command()
  .description('cache controls')
  .action(() => {
    cmd.showHelp();
  });

cmd.command('list')
  .description('list all the files in the cache')
  .action(async () => {
    const dir = await getCacheDir();

    const files = Deno.readDir(dir);
    const tb = new Table().header(['Name', 'Size'].map(bold)).border(true);

    let totalSize = 0;

    for await (const f of files) {
      const size = (await Deno.stat(join(dir, f.name))).size / 1000;
      totalSize += size;

      tb.push([f.name, `${size.toFixed(2)} KB`]);
    }

    tb.push([
      blue(bold('Total')),
      blue(bold(`${(totalSize / 1000).toFixed(2)} MB`)),
    ]);

    if (totalSize) console.log(tb.toString());
    else warning('There\'s nothing in the cache!');
  });

cmd.command('clean')
  .description('clean the entire cache')
  .action(async () => {
    await clean();

    success('Cleaned the entire cache!');
  });

cmd.command('prune')
  .description('prune the cache to under 0.5 GB')
  .action(async () => {
    const size = await prune();

    if (size !== -1) {
      success(
        `Pruned cache, now size is ${(size / 1000 / 1000).toFixed(2)} MB!`,
      );
    } else warning('Cache is already under 0.5 GB!');
  });

cmd.command('path')
  .description('print the cache path')
  .action(async () => {
    console.log(await getCacheDir());
  });

export default cmd;
