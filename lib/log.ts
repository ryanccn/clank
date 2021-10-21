import * as Colors from './colors.ts';

const DEBUG = Deno.env.get('CLANK_DEBUG') === '1' ||
  Deno.env.get('CLANK_DEBUG') === 'true';

const log = (a: string) => {
  console.error(Colors.blue(Colors.bold('[clank] ' + a)));
};

const debug = (a: string) => {
  if (DEBUG) console.error(Colors.yellow(Colors.bold('[clank DEBUG] ' + a)));
};

const error = (a: string) => {
  console.error(Colors.red(Colors.bold('[clank] ' + a)));
};

export { debug, error, log };
