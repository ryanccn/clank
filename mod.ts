import {
  Command,
  EnumType,
} from 'https://deno.land/x/cliffy@v0.19.6/command/mod.ts';

import { error, log } from './lib/log.ts';
import * as Colors from './lib/colors.ts';

import compile from './compile.ts';

import { getCacheFile } from './lib/cache.ts';
import { prune } from './lib/cacheControls.ts';
import cacheControlCmd from './cacheControls.ts';

import exists from './lib/exists.ts';
import subp from './lib/subprocess.ts';

import type Options from './lib/options.ts';
import VERSION from './version.ts';

const cmd = await new Command()
  .name('clank')
  .version(VERSION)
  .description('A simple CLI that runs your C++ code just in time')
  .arguments<string[]>('<file>')
  .type('compilers', new EnumType(['clang++', 'g++']))
  .option<{ compiler: 'clang++' | 'g++' }>(
    '-c, --compiler <name:compilers>',
    'which compiler executable to use',
    { default: Deno.build.os === 'darwin' ? 'clang++' : 'g++' },
  )
  .option<{ compilerFlags: string[] }>(
    '-f, --compiler-flags <flags>',
    'flags to pass to the compiler',
    (given: string) => given.split(' ').filter((k) => !!k),
  )
  .command(
    'cache',
    cacheControlCmd,
  )
  .parse(Deno.args);

const args = cmd.args;
const options: Options = cmd.options;

const fileName = args[0];

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
    (cppProc.success ? Colors.bgGreen : Colors.bgRed)(
      Colors.white(' ' + cppProc.code.toString() + ' '),
    )
  }`,
);

const cacheSize = await prune();
if (cacheSize !== -1) {
  log(`Pruned cache, now size is ${cacheSize / 1000 / 1000} MB!`);
}

Deno.exit(cppProc.code);
