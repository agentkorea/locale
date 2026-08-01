const esbuild = require('esbuild');
const { chmodSync, constants } = require('fs');
const { join } = require('path');

async function build() {
  const result = await esbuild.build({
    entryPoints: ['src/generateStringsJson.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: 'bundle/cli.js',
    banner: { js: '#!/usr/bin/env node' },
    external: ['node:*'],
    sourcemap: false,
    logLevel: 'info',
  });

  if (result.errors.length > 0) {
    console.error('Build failed:', result.errors);
    process.exit(1);
  }

  // Make the output executable
  const bundlePath = join(__dirname, '..', 'bundle', 'cli.js');
  chmodSync(bundlePath, constants.S_IRWXU | constants.S_IRGRP | constants.S_IXGRP | constants.S_IROTH | constants.S_IXOTH);

  console.log('Build successful: bundle/cli.js');
}

build();
