module.exports = {
  assets: ['./assets/fonts/'],
  dependencies: {
    'react-native-threads': {
      platforms: {
        // disable auto linking and relay on manual linking for react-native-threads lib on Android
        // because we need to add some native modules required in worker.thread.js code to prevent imports failure and crash
        android: null,
      },
    },
    'react-native-v8': {
      platforms: {
        // Android only deps
        ios: null,
      },
    },
    'v8-android-jit-nointl': {
      platforms: {
        // Android only deps
        ios: null,
      },
    },
  },
}
