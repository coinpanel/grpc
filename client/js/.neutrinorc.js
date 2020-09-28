const airbnbBase = require('@neutrinojs/airbnb-base');
const library = require('@neutrinojs/library');
const jest = require('@neutrinojs/jest');
const node = require('@neutrinojs/node');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  options: {
    root: __dirname,
  },
  use: [
    airbnbBase(),
    jest(),
    neutrino => {
      // tsc and tslint checks
      neutrino.config.plugin('fork-ts-checker').use(ForkTsCheckerWebpackPlugin);
      neutrino.config.resolve.extensions.add('.tsx');
      neutrino.config.resolve.extensions.add('.ts');
      neutrino.config.module.rule('compile').test(/\.(wasm|mjs|jsx|js|tsx|ts)$/);
    }
  ],
};
