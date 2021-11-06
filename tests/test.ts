import { assert } from 'https://deno.land/std@0.112.0/testing/asserts.ts';
import { join } from '../_deps.ts';
import { cacheAction, mkfile, run } from './_run.ts';

Deno.test('Integer inputs', async () => {
  const randomNum = Math.floor(Math.random() * 100);
  const { stdout } = await run('square', randomNum.toString());

  assert(stdout === (randomNum * randomNum).toString());
});

Deno.test('String inputs', async () => {
  const str = 'i4gy8bsi4ej5ty7kbsi8e4jbuw83sebhr7yusbht8usebhr';
  const { stdout } = await run('string', str);

  assert(stdout === str.length.toString());
});

Deno.test('File I/O', async () => {
  const randomNum = Math.floor(Math.random() * 100);
  await Deno.writeTextFile('test.in', randomNum.toString());

  await run('file-io');

  const outFile = (await Deno.readTextFile('test.out')).trim();

  assert(outFile === (randomNum + 3).toString());

  await Deno.remove('test.in');
  await Deno.remove('test.out');
});

Deno.test('Prune', async () => {
  const cacheDir = await (await import('./../lib/cache.ts')).getCacheDir();

  // generate some large files
  for (let i = 1; i <= 10; i++) {
    await mkfile(join(cacheDir, `${i}.bigfile.test`));
  }

  await cacheAction('prune');

  const { size } = await (await import('./../lib/cacheControls.ts')).dfsInfo(
    cacheDir,
  );

  assert(
    size <= 0.5 * 1000 * 1000 * 1000,
    'cache size must be less than or equal to 0.5 GB',
  );

  await cacheAction('clean');
});

Deno.test('Clean', async () => {
  // just a random test case used to generate some cache files
  await run('square', '1');
  await run('string', 'hello');

  await cacheAction('clean');

  const cacheDir = await (await import('./../lib/cache.ts')).getCacheDir();
  const files = Deno.readDir(cacheDir);

  let len = 0;
  for await (const _ of files) len++;

  assert(len === 0, 'cache must be empty');
});
