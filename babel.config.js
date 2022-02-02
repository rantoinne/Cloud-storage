module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    ['@babel/plugin-proposal-optional-catch-binding'],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: true,
        allowUndefined: true,
      },
    ],
    [
      'module-resolver',
      {
        extensions: ['.ts', '.tsx', '.json'],
        alias: {
          '@images': './assets/images',
          '@animations': './assets/animations',
          '@svg': './assets/svg',
          '@components': './src/components',
          '@config': './src/config',
          '@i18n': './src/i18n',
          '@modals': './src/modals',
          '@models': './src/models',
          '@navigation': './src/navigation',
          '@containers': './src/containers',
          '@api': './src/services/api',
          '@theme': './src/theme',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@controllers': './src/controllers',
          'opacity-library': './lib/opacity-library.ts',
        },
      },
    ],
  ],
}
