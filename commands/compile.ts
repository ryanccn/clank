import { debug, error, success } from './../lib/log.ts';

import subp from './../lib/subprocess.ts';
import type Options from './../lib/options.ts';

export default async (
  args: { outputFile: string; fileName: string },
  options: Options,
) => {
  debug('Compiling...');
  debug(`Build location: ${args.outputFile}`);

  const compiler = options.compiler;
  debug(`Compiler: ${compiler}`);

  const cmd = [
    compiler,
    // '-O2',
    '-o',
    args.outputFile,
    ...(options.compilerFlags ?? []),
    args.fileName,
  ];
  debug(`Compile command being run: ${cmd.join(' ')}`);

  const compileStart = performance.now();
  const compileProc = await subp(cmd);
  const compileEnd = performance.now();

  if (!compileProc.success) {
    error('Compilation failed!');
    Deno.exit(compileProc.code);
  }

  success(`compiled in ${(compileEnd - compileStart).toFixed(1)}ms`);
};
