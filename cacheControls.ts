import { Command } from 'https://deno.land/x/cliffy@v0.19.6/command/mod.ts';
import { Table } from 'https://deno.land/x/cliffy@v0.19.6/table/mod.ts';

import { join } from 'https://deno.land/std@0.112.0/path/mod.ts';
import { blue, bold } from './lib/colors.ts';

import { getCacheDir } from './lib/cache.ts';
import { clean, prune } from './lib/cacheControls.ts';

const cmd = new Command()
  .description('cache controls')
  .action(() => {
    cmd.showHelp();
    Deno.exit(0);
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
    else console.log('There\'s nothing in the cache!');

    Deno.exit(0);
  });

cmd.command('clean')
  .description('clean the entire cache')
  .action(async () => {
    await clean();

    console.log('Cleaned the entire cache!');

    Deno.exit(0);
  });

cmd.command('prune')
  .description('prune the cache to under 0.5 GB')
  .action(async () => {
    const size = await prune();

    if (size !== -1) {
      console.log(
        `Pruned cache, now size is ${(size / 1000 / 1000).toFixed(2)} MB!`,
      );
    } else console.log('Cache is already under 0.5 GB!');

    Deno.exit(0);
  });

cmd.command('path')
  .description('print the cache path')
  .action(async () => {
    console.log(await getCacheDir());

    Deno.exit(0);
  });

export default cmd;
