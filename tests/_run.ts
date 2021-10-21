export default async (name: string, stdin?: string) => {
  const p = Deno.run({
    cmd: ['deno', 'run', '--allow-all', 'mod.ts', `tests/${name}.cpp`],
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
    env: { ...Deno.env.toObject(), NO_COLOR: '1' },
  });

  await p.stdin.write(new TextEncoder().encode(stdin));
  p.stdin.close();

  const stdout = new TextDecoder().decode(await p.output());

  const stderr = new TextDecoder().decode(await p.stderrOutput());

  const status = await p.status();

  p.close();

  return { status, stdout, stderr };
};
