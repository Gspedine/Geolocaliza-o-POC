module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin para resolver aliases de paths
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@types': './src/types',
            '@utils': './src/utils',
          },
        },
      ],
      ['inline-dotenv'],
    ],
  };
};