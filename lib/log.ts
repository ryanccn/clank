import { blue, bold, green, red, yellow } from '../_deps.ts';

const DEBUG = Deno.env.get('CLANK_DEBUG') === '1' ||
  Deno.env.get('CLANK_DEBUG') === 'true';

const log = (a: string) => {
  console.log(blue(bold('[clank] ' + a)));
};

const debug = (a: string) => {
  if (DEBUG) console.log(yellow(bold('[clank DEBUG] ' + a)));
};

const success = (a: string) => {
  console.log(green(bold('[clank] ' + a)));
};

const warning = (a: string) => {
  console.log(yellow(bold('[clank] ' + a)));
};

const error = (a: string) => {
  console.log(red(bold('[clank] ' + a)));
};

export { debug, error, log, success, warning };
