import { Command } from 'https://deno.land/x/cliffy@v0.19.6/command/mod.ts';

import { debug, error, log } from './lib/log.ts';
import * as Colors from './lib/colors.ts';

import { getCacheFile } from './lib/cache.ts';
import { clean, cleanup } from './lib/cleanup.ts';
import exists from './lib/exists.ts';
import subp from './lib/subprocess.ts';

import VERSION from './version.ts';

interface Options {
  compilerFlags?: string[];
}

const cmd = await new Command()
  .name('clank')
  .version(VERSION)
  .description('A simple CLI that runs your C++ code just in time')
  .arguments<string[]>('<file>')
  .option<{ compilerFlags: string[] }>(
    '-c, --compiler-flags <flags>',
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

const outputFile = await getCacheFile(fileName);

if (!await exists(outputFile)) {
  debug('compiling...');
  debug(`build location: ${outputFile}`);

  const compiler = Deno.build.os === 'darwin' ? 'clang++' : 'g++';
  debug(`compiler: ${compiler}`);

  const cmd = [
    compiler,
    // '-O2',
    '-o',
    outputFile,
    ...(options.compilerFlags ?? []),
    fileName,
  ];
  debug(`compile command being run: ${cmd.join(' ')}`);

  const compileStart = performance.now();
  const compileProc = await subp(cmd);
  const compileEnd = performance.now();

  if (!compileProc.success) {
    error('compilation failed!');
    Deno.exit(compileProc.code);
  }

  log(`compiled in ${(compileEnd - compileStart).toFixed(1)}ms`);
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
