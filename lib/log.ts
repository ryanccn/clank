import * as Colors from './colors.ts';

const DEBUG = Deno.env.get('CLANK_DEBUG') === '1' ||
  Deno.env.get('CLANK_DEBUG') === 'true';

const log = (a: string) => {
  console.log(Colors.blue(Colors.bold('[clank] ' + a)));
};

const debug = (a: string) => {
  if (DEBUG) console.log(Colors.yellow(Colors.bold('[clank DEBUG] ' + a)));
};

const success = (a: string) => {
  console.log(Colors.green(Colors.bold('[clank] ' + a)));
};

const warning = (a: string) => {
  console.log(Colors.yellow(Colors.bold('[clank] ' + a)));
};

const error = (a: string) => {
  console.log(Colors.red(Colors.bold('[clank] ' + a)));
};

export { debug, error, log, success, warning };
