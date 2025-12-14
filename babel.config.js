module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: './',
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './components',
            '@assets': './assets',
            '@styles': './styles',
            '@scripts': './scripts',
            '@providers': './providers',
            '@types': './types'
          }
        }
      ]
    ],
  };
};
