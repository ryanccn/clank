import { error, log, success, warning } from './../lib/log.ts';
import currentVersion from '../version.ts';

interface SemVer {
  major: number;
  minor: number;
  patch: number;
}

const parse = (str: string): SemVer => {
  const frags = str.split('.');
  const major = parseInt(frags[0]);
  const minor = parseInt(frags[1]);
  const patch = parseInt(frags[2]);

  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    throw new Error(`Failed to parse semver string ${str}`);
  }

  return { major, minor, patch };
};

const leftBehind = (current: SemVer, latest: SemVer) =>
  current.major < latest.major || current.minor < latest.minor ||
  current.patch < latest.patch;

export default async () => {
  let latest: string;

  log('Fetching version info...');
  try {
    latest = (await (await fetch(
      'https://cdn.deno.land/clank/meta/versions.json',
    )).json()).latest;
  } catch {
    error('Failed to fetch version info');
    Deno.exit(1);
  }

  const needsUpgrade = leftBehind(
    parse(currentVersion),
    parse(latest),
  );

  if (!needsUpgrade) {
    warning(`You're already on the latest version ${latest} of clank!`);
    return;
  }

  log('Upgrading...');
  const res = await Deno.run({
    cmd: [
      'deno',
      'install',
      '--allow-all',
      '--force',
      '--name',
      'clank',
      `https://deno.land/x/clank@${latest}/mod.ts`,
    ],
  }).status();

  if (!res.success) {
    error('update failed');
    Deno.exit(1);
  }

  success(`Upgraded clank from ${currentVersion} to ${latest}!`);
};
