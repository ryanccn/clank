import { assert, fail } from 'https://deno.land/std@0.112.0/testing/asserts.ts';
import run from './_run.ts';

Deno.test('squares', async () => {
  const randomNum = Math.floor(Math.random() * 100);
  const { status, stdout } = await run('square', randomNum.toString());

  if (!status.success) fail(`exited with status code ${status.code}`);

  assert(stdout === (randomNum * randomNum).toString());
});

Deno.test('string', async () => {
  const str = 'i4gy8bsi4ej5ty7kbsi8e4jbuw83sebhr7yusbht8usebhr';
  const { status, stdout } = await run('string', str);

  if (!status.success) fail(`exited with status code ${status.code}`);

  assert(stdout === str.length.toString());
});
