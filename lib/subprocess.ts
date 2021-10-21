export default async (cmd: string[]) => {
  const p = Deno.run({
    cmd,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const status = await p.status();

  p.close();

  return status;
};
