/*
 * Post-install fixups for third-party packages that cannot be expressed in
 * package.json. Each step is idempotent and silently skips if the upstream
 * package has already been fixed.
 */

const fs = require('fs');
const path = require('path');

const nodeModules = path.join(__dirname, '..', 'node_modules');

// 1. @types/redux-form ships its own nested @types tree which collides with the
//    top-level one during compilation; drop it after install.
fs.rmSync(path.join(nodeModules, '@types', 'redux-form', 'node_modules'), {
  recursive: true,
  force: true,
});

// (A second step used to rewrite arachne-ui-components' compound @extends in
// tooltip.scss, which Dart Sass rejects. Fixed at source in 1.21.0, so it is
// gone.)
