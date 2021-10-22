import {
  Command,
  EnumType,
} from 'https://deno.land/x/cliffy@v0.19.6/command/mod.ts';

import { error, log } from './lib/log.ts';
import * as Colors from './lib/colors.ts';

import compile from './compile.ts';

import { getCacheFile } from './lib/cache.ts';
import { clean, cleanup } from './lib/cleanup.ts';

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
    'clean',
    new Command()
      .description('clean the cache completely')
      .action(async () => {
        await clean();
        log('cleaned the cache completely!');
        Deno.exit(0);
      }),
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

const cuR = await cleanup();
if (cuR) {
  log(`automatically limited cache to 0.5 GB`);
}

Deno.exit(cppProc.code);
