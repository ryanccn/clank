import { bold, green } from './_deps.ts';
import exists from './lib/exists.ts';

if (await exists('build')) {
  await Deno.remove('build', { recursive: true });
}
await Deno.mkdir('build');

const ARCHES = [
  'x86_64-unknown-linux-gnu',
  'x86_64-pc-windows-msvc',
  'x86_64-apple-darwin',
  'aarch64-apple-darwin',
];

await Promise.all(ARCHES.map(async (arch) => {
  const tA = performance.now();

  const s = await Deno.run({
    cmd: [
      'deno',
      'compile',
      '-A',
      '--target',
      arch,
      '--output',
      `build/clank-${arch}`,
      'mod.ts',
    ],

    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
  }).status();

  const tB = performance.now();

  if (!s.success) {
    throw new Error(`compiling for ${arch} failed!`);
  }

  const timeStr = `${((tB - tA) / 1000).toFixed(2)}s`;

  console.log(
    `built ${bold(arch)} in ${green(timeStr)}`,
  );
}));
