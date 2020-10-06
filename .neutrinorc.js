const webpack = require('webpack');
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
    library({
      name: 'grpc',
      babel: {
        presets: ['@babel/typescript'],
      },
      target: 'node',
    }),
    jest(),
    neutrino => {
      // tsc and tslint checks
      neutrino.config.plugin('fork-ts-checker').use(ForkTsCheckerWebpackPlugin);
      neutrino.config.resolve.extensions.add('.tsx');
      neutrino.config.resolve.extensions.add('.ts');
      neutrino.config.module.rule('compile').test(/\.(wasm|mjs|jsx|js|tsx|ts)$/);

      neutrino.config.plugin('env')
        .use(webpack.DefinePlugin, [{
          'process.env': JSON.stringify({
            ROOT_PROTO_FILENAME: process.env.ROOT_PROTO_FILENAME,
            PROTO_PACKAGE_NAME: process.env.PROTO_PACKAGE_NAME,
          })
        }]);
    }
  ],
};
