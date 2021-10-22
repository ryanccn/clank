import { fail } from 'https://deno.land/std@0.112.0/testing/asserts.ts';

const CLANK_CMD = ['deno', 'run', '--allow-all', 'mod.ts'];

export const run = async (name: string, stdin?: string) => {
  const p = Deno.run({
    cmd: [...CLANK_CMD, `tests/${name}.cpp`],
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
    env: { ...Deno.env.toObject(), NO_COLOR: '1' },
  });

  if (stdin) await p.stdin.write(new TextEncoder().encode(stdin));
  p.stdin.close();

  const stdout = new TextDecoder().decode(await p.output()).trim();

  const stderr = new TextDecoder().decode(await p.stderrOutput()).trim();

  const status = await p.status();

  p.close();

  if (!status.success) fail(`${name} exited with status code ${status.code}`);

  return { status, stdout, stderr };
};

export const cacheAction = async (action: string) => {
  const p = Deno.run({
    cmd: [...CLANK_CMD, 'cache', action],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
    env: { ...Deno.env.toObject(), NO_COLOR: '1' },
  });

  const s = await p.status();
  p.close();

  if (!s.success) fail(`cache ${action} exited with status code ${s.code}`);
};

export const mkfile = async (path: string) => {
  const p = Deno.run({
    cmd: ['mkfile', '100m', path],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
  });

  const s = await p.status();
  p.close();

  if (!s.success) fail(`failed to create big files`);
};
