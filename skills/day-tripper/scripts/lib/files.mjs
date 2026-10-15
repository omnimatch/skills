import { createHash, randomUUID } from 'node:crypto';
import {
  chmod,
  mkdir,
  open,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { homedir, hostname } from 'node:os';
import { dirname, join, resolve } from 'node:path';

export const digest = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const configDirectory = () =>
  resolve(
    process.env.DAY_TRIPPER_CONFIG_DIR ||
      join(homedir(), '.config', 'omnimatch', 'day-tripper'),
  );
export async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw error;
  }
}
export async function privateDirectory(path) {
  await mkdir(path, { recursive: true, mode: 0o700 });
}
export async function atomicWrite(path, value) {
  await mkdir(dirname(resolve(path)), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, value, { mode: 0o600, flag: 'wx' });
    await rename(temporary, path);
    await chmod(path, 0o600);
  } finally {
    await unlink(temporary).catch(() => {});
  }
}
export const saveJson = (path, value) =>
  atomicWrite(path, `${JSON.stringify(value, null, 2)}\n`);
export async function withLock(directory, callback) {
  await privateDirectory(directory);
  const path = join(directory, '.lock');
  let handle;
  try {
    handle = await open(path, 'wx', 0o600);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const lock = await readJson(path);
    if (lock.host !== hostname())
      throw new Error(
        'This run is locked on another machine. Check that process before removing its .lock file.',
      );
    let alive = true;
    try {
      process.kill(lock.pid, 0);
    } catch (e) {
      if (e.code === 'ESRCH') alive = false;
    }
    if (alive)
      throw new Error('This research run is already open in another process.');
    await unlink(path);
    return withLock(directory, callback);
  }
  try {
    await handle.writeFile(
      JSON.stringify({ pid: process.pid, host: hostname() }),
    );
    return await callback();
  } finally {
    await handle.close();
    await unlink(path).catch(() => {});
  }
}

const KEY_NAMES = [
  'EXA_API_KEY',
  'OPENAI_API_KEY',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
];
export async function loadSettings() {
  const directory = configDirectory();
  const config = await readJson(join(directory, 'config.json'), {});
  const saved = await readJson(join(directory, 'credentials.json'), {});
  const keys = Object.fromEntries(
    KEY_NAMES.map((name) => [name, process.env[name] || saved[name] || '']),
  );
  return { config, keys, directory };
}
export async function saveSettings(config, keys) {
  const directory = configDirectory();
  await privateDirectory(directory);
  await chmod(directory, 0o700);
  await saveJson(join(directory, 'config.json'), config);
  await saveJson(
    join(directory, 'credentials.json'),
    Object.fromEntries(
      KEY_NAMES.filter((k) => keys[k]).map((k) => [k, keys[k]]),
    ),
  );
}
