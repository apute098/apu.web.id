#!/usr/bin/env node
/**
 * rb-add.mjs — vendor React Bits components from the public registry.
 *
 * Why not the CLI: `jsrepo`/`shadcn add` write into the project and need a
 * components.json; we only need the registry payload, and this way the vendor
 * step is reproducible and logged.
 *
 * Usage:  node tools/rb-add.mjs BellToggle:TS-CSS SquishSwitch:SplitText...
 *         node tools/rb-add.mjs BellToggle            (default variant TS-CSS)
 *         node tools/rb-add.mjs --variant TS-TW BellToggle
 *         node tools/rb-add.mjs --out=packages/apu/src/components/rb BellToggle
 *         node tools/rb-add.mjs --dry BellToggle
 *
 * License: React Bits is MIT + Commons Clause — usable in any app, but the
 * component source may not be redistributed/sold on its own. Keep the vendor
 * dir gitignored; this script + RB-VENDOR.md is the reproducible trail.
 */
import { mkdir, writeFile, readFile, appendFile, access } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';

const REGISTRY = 'https://reactbits.dev/r';
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

const argv = process.argv.slice(2);
const dry = argv.includes('--dry');
const outArg = argv.find((a) => a.startsWith('--out='));
const variantArg = argv.find((a) => a.startsWith('--variant'));
// --variant=TS-TW and "--variant TS-TW" both work; strip the flag and its value.
let defaultVariant = 'TS-CSS';
if (variantArg) defaultVariant = variantArg.split('=')[1] ?? 'TS-CSS';
const flagValues = new Set([defaultVariant, outArg?.split('=')[1]].filter(Boolean));
const VALUED_FLAGS = new Set(['--variant', '--out', '--variant=', '--out=']);
const outDir = outArg
  ? join(ROOT, outArg.split('=')[1])
  : join(ROOT, 'packages/regsi/src/components/rb');

const specs = argv.filter(
  (a, i) => !a.startsWith('--') && !flagValues.has(a) && !VALUED_FLAGS.has(argv[i - 1])
);
if (!specs.length) {
  console.error('usage: node tools/rb-add.mjs [--variant=TS-CSS] [--out=packages/.../rb] [--dry] BellToggle[SquishSwitch]');
  process.exit(2);
}

const LICENSE = `React Bits — MIT + Commons Clause License Condition v1.0
Copyright (c) 2026 David Haz
https://reactbits.dev  ·  registry: ${REGISTRY}/<Name>-<LANG>-<STYLE>

You may use this software, including commercially, as part of an
application/website/product, PROVIDED you do not sell, sublicense or
redistribute the components themselves — alone, in a bundle, or as a ported
version. This directory is gitignored for that reason; re-fetch with
tools/rb-add.mjs (see RB-VENDOR.md).
`;

const exists = async (p) => access(p).then(() => true, () => false);

async function fetchItem(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 120)}`);
  if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
    throw new Error(`registry did not return JSON (got ${text.slice(0, 60).replace(/\s+/g, ' ')}...)`);
  }
  return JSON.parse(text);
}

const manifestPath = join(ROOT, 'RB-VENDOR.md');
const rows = [];
let failed = 0;

for (const spec of specs) {
  const [name, variant = defaultVariant] = spec.split(':');
  const id = `${name}-${variant}`;
  const url = `${REGISTRY}/${id}`;
  try {
    const item = await fetchItem(url);
    const target = join(outDir, item.title || name);
    const files = item.files || [];
    if (!files.length) throw new Error('registry item has no files');

    // Sanity: every file path must stay inside the target dir.
    for (const f of files) {
      const leaf = f.path.split('/').pop();
      if (!leaf || leaf.includes('..')) throw new Error(`unsafe file path: ${f.path}`);
    }

    if (!dry) {
      await mkdir(target, { recursive: true });
      for (const f of files) {
        await writeFile(join(target, f.path.split('/').pop()), f.content, 'utf8');
      }
      await writeFile(join(outDir, 'LICENSE'), LICENSE, 'utf8');
    }

    const deps = item.dependencies || [];
    const regDeps = item.registryDependencies || [];
    rows.push(
      `| ${item.title} | \`${id}\` | ${files.map((f) => f.path.split('/').pop()).join(', ')} | ${deps.join(' ') || '—'} | ${regDeps.join(' ') || '—'} |`
    );
    console.log(`${dry ? '[dry] ' : '✓ '}${item.title}  →  ${target.replace(ROOT + '/', '')}`);
    if (deps.length) console.log(`   deps: ${deps.join(' ')}`);
    if (regDeps.length) console.log(`   registryDependencies: ${regDeps.join(' ')}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${id}: ${err.message}`);
  }
}

if (rows.length && !dry) {
  const header = (await exists(manifestPath))
    ? ''
    : `# RB-VENDOR — React Bits vendor log

Lisensi: MIT + Commons Clause (© 2026 David Haz). Source komponen **tidak** di-commit (lihat .gitignore).
Re-fetch: \`node tools/rb-add.mjs <Nama>:<Varian>\`.

| Komponen | Registry id | Files | Dependencies | Registry deps |
| :--- | :--- | :--- | :--- | :--- |
`;
  await appendFile(manifestPath, header + rows.join('\n') + '\n', 'utf8');
  console.log(`\nlogged ${rows.length} item(s) → RB-VENDOR.md`);
}

if (failed) process.exit(1);