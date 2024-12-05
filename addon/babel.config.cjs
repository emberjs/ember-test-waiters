'use strict';

module.exports = {
  plugins: [
    ['@babel/plugin-transform-typescript', { allowDeclareFields: true }],
    ['module:decorator-transforms', { runtime: { import: 'decorator-transforms/runtime' } }],
  ],
};
