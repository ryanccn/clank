import { error, log, success, warning } from './../lib/log.ts';
import { writeAll } from '../_deps.ts';
import currentVersion from '../version.ts';

interface SemVer {
  major: number;
  minor: number;
  patch: number;
}

const isStandalone = () => {
  return !Deno.execPath().endsWith('deno');
};

const parse = (str: string): SemVer => {
  const frags = (str.startsWith('v') ? str.substring(1) : str).split('.');
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

const denoUpgrade = async () => {
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

  const versions = { current: parse(currentVersion), latest: parse(latest) };

  if (versions.latest.major > versions.current.major) {
    warning('New major version found!');
    warning('You will need to reinstall to upgrade.');
    warning('Go to https://github.com/ryanccn/clank to download / install.');

    Deno.exit(0);
  }

  const needsUpgrade = leftBehind(
    versions.current,
    versions.latest,
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
      '--import-map',
      `https://deno.land/x/clank@${latest}/import_map.json`,
      `https://deno.land/x/clank@${latest}/mod.ts`,
    ],
  }).status();

  if (!res.success) {
    error('Update failed');
    Deno.exit(1);
  }

  success(`Upgraded clank from ${currentVersion} to ${latest}!`);
};

const standaloneUpgrade = async () => {
  const archName = Deno.build.os === 'windows'
    ? 'x86_64-pc-windows-msvc'
    : Deno.build.os === 'linux'
    ? 'x86_64-unknown-linux-gnu'
    : Deno.build.os === 'darwin'
    ? Deno.build.arch === 'x86_64'
      ? 'x86_64-apple-darwin'
      : 'aarch64-apple-darwin'
    : null;

  if (!archName) {
    error('Can\'t find a binary with a matching architecture');
    Deno.exit(1);
  }

  const downloadUrl =
    `https://github.com/ryanccn/clank/releases/latest/download/clank-${archName}`;

  const tmpPath = await Deno.makeTempFile();
  const tmpFile = await Deno.open(tmpPath, { create: true, write: true });

  log('Downloading binary...');
  const res = await fetch(downloadUrl);

  if (!res.ok || !res.body) {
    error('Download failed');
    Deno.exit(1);
  }

  for await (const chunk of res.body) {
    await writeAll(tmpFile, chunk);
  }
  tmpFile.close();

  log('Installing...');
  await Deno.rename(tmpPath, Deno.execPath());
};

export default isStandalone() ? standaloneUpgrade : denoUpgrade;
