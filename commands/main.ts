import { error, log, success } from './../lib/log.ts';
import { bgGreen, bgRed, white } from '../_deps.ts';

import compile from './compile.ts';

import { getCacheFile } from './../lib/cache.ts';
import { prune } from './../lib/cacheControls.ts';
import exists from './../lib/exists.ts';
import subp from './../lib/subprocess.ts';

import type Options from './../lib/options.ts';

export default async (options: Options, fileName: string) => {
  // ensure that only the program's output is run through stdout
  console.log = console.error;

  if (!(await exists(fileName))) {
    error('file doesn\'t exist!');
    Deno.exit(1);
  }

  if (options.compilerFlags) {
    const badOptions = options.compilerFlags.filter((k) => !k.startsWith('-'));
    if (badOptions.length) {
      error(`compiler flag ${badOptions.join(', ')} is bad`);
      Deno.exit(1);
    }
  }

  const outputFile = await getCacheFile(fileName, options);

  if (!await exists(outputFile)) {
    await compile({ outputFile, fileName }, options);
  } else {
    log(`already compiled, using cached version`);
  }

  log('running...');

  const cppProc = await subp([outputFile]);

  log(
    `exiting with status code ${
      (cppProc.success ? bgGreen : bgRed)(
        white(' ' + cppProc.code.toString() + ' '),
      )
    }`,
  );

  const cacheSize = await prune();
  if (cacheSize !== -1) {
    success(`Pruned cache, now size is ${cacheSize / 1000 / 1000} MB!`);
  }

  Deno.exit(cppProc.code);
};
