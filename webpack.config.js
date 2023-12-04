const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Ignore warnings
  config.stats = {
    warningsFilter: warning => /Failed to parse source map/,
  };

  return config;
};
