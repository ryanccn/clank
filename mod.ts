import { Command, EnumType } from './_deps.ts';

import main from './commands/main.ts';
import cacheControl from './commands/cacheControls.ts';
import upgrade from './commands/upgrade.ts';

import VERSION from './version.ts';

const cmd = new Command()
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
  .action(main);

cmd.command(
  'cache',
  cacheControl,
);

cmd.command(
  'upgrade',
).description('upgrade clank to the latest version').action(upgrade);

await cmd.parse(Deno.args);
