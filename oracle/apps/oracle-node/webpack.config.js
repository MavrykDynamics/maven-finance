let nodeExternals = require('webpack-node-externals');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = (config, context) => {
  return {
    ...config,
    externals: [
      nodeExternals({
        allowlist: [/^@mavryk-oracle-node/],
      }),
    ],
  };
};
