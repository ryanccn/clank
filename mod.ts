import { debug, error, log } from './lib/log.ts';
import * as Colors from './lib/colors.ts';

import { getCacheFile } from './lib/cache.ts';
import cleanup from './lib/cleanup.ts';
import exists from './lib/exists.ts';
import subp from './lib/subprocess.ts';

import VERSION from './version.ts';

if (Deno.args.length > 1) {
  error('too many arguments!');
  Deno.exit(1);
} else if (
  Deno.args.length === 0 || Deno.args[0] === '-h' || Deno.args[0] === '--help'
) {
  console.log(
    Colors.bold(`clank ${VERSION}`),
  );
  console.log('a simple CLI that runs your C++ code just in time');

  console.log(
    `${Colors.bold('usage:')} ${Colors.bgBlue(' clank <filename> ')}`,
  );

  Deno.exit(0);
}

const fileName = Deno.args[0];

if (!(await exists(fileName))) {
  error('file doesn\'t exist!');
  Deno.exit(1);
}

const outputFile = await getCacheFile(fileName);

if (!await exists(outputFile)) {
  debug('compiling...');
  debug(`build location: ${outputFile}`);

  const compiler = Deno.build.os === 'darwin' ? 'clang++' : 'g++';
  debug(`compiler: ${compiler}`);

  const compileStart = performance.now();
  const compileProc = await subp([
    compiler,
    // '-O2',
    '-o',
    outputFile,
    fileName,
  ]);
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
