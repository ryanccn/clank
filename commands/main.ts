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
    error(`File \`${fileName}\` doesn\'t exist!`);
    Deno.exit(1);
  }

  if (options.compilerFlags) {
    const badOptions = options.compilerFlags.filter((k) => !k.startsWith('-'));
    if (badOptions.length) {
      error(`Compiler flag ${badOptions.join(', ')} is bad`);
      Deno.exit(1);
    }
  }

  const outputFile = await getCacheFile(fileName, options);

  if (!await exists(outputFile)) {
    await compile({ outputFile, fileName }, options);
  } else {
    log(`Already compiled, using cached version`);
  }

  log('Running...');

  const { code: exitCode, success: cppSuccess } = await subp([outputFile]);

  const statusText = exitCode === 127
    ? 'Command Not Found'
    : exitCode === 132
    ? 'SIGKILL'
    : exitCode === 133
    ? 'SIGTRAP'
    : exitCode === 134
    ? 'SIGABRT'
    : exitCode === 136
    ? 'SIGFPE'
    : exitCode === 137
    ? 'Out of Memory'
    : exitCode === 138
    ? 'SIGBUS'
    : exitCode === 139
    ? 'Segmentation Fault'
    : null;

  log(
    `Exiting with status ${
      (cppSuccess ? bgGreen : bgRed)(
        white(
          ' ' + (statusText
            ? `${statusText} (${exitCode})`
            : exitCode.toString()) +
            ' ',
        ),
      )
    }`,
  );

  const cacheSize = await prune();
  if (cacheSize !== -1) {
    success(`Pruned cache, now size is ${cacheSize / 1000 / 1000} MB!`);
  }

  Deno.exit(exitCode);
};
