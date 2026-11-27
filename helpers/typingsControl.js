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

// react-sanfona 0.2.3 expects a default export, but uuid 11 exports v4 by name.
const accordionItem = require.resolve('react-sanfona/dist-modules/AccordionItem');
const original = fs.readFileSync(accordionItem, 'utf8');
const updated = original.replace('_uuid2.default.v4()', '_uuid.v4()');
if (updated !== original) {
  fs.writeFileSync(accordionItem, updated);
}
