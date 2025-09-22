const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configuração específica para web
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  config.resolver.platforms = ['ios', 'android', 'native', 'web'];
} else {
  config.resolver.platforms = ['web'];
}

// Bloqueia TODOS os módulos nativos problemáticos do react-native-maps
const nativeModulesToBlock = [
  // Módulos principais do react-native-maps
  /react-native-maps\/lib\/.*NativeComponent/,
  /react-native-maps\/lib\/MapView/,
  /react-native-maps\/lib\/MapMarker/,
  /react-native-maps\/lib\/MapPolyline/,
  /react-native-maps\/lib\/MapPolygon/,
  /react-native-maps\/lib\/MapCircle/,
  /react-native-maps\/lib\/MapUrlTile/,
  
  // Módulos nativos do React Native
  /react-native\/Libraries\/Utilities\/codegenNativeCommands/,
  /react-native\/Libraries\/Components\/View\/RCTView/,
  /react-native\/Libraries\/Components\/MapView\/RCTMap/,
  /react-native\/Libraries\/Renderer\/fabric\/*/,
  /react-native\/Libraries\/Renderer\/native*/,
  /react-native\/Libraries\/NewAppScreen/,
  
  // Outros módulos nativos comuns
  /react-native\/Libraries\/ActionSheetIOS/,
  /react-native\/Libraries\/Alert/,
  /react-native\/Libraries\/Animated\/src\/AnimatedImplementation/,
  /react-native\/Libraries\/Components\/ActivityIndicator/,
  /react-native\/Libraries\/Components\/ScrollView/,
  /react-native\/Libraries\/Lists\/FlatList/,
];

config.resolver.blockList = nativeModulesToBlock;

// Suporte para assets
config.resolver.assetExts.push('svg', 'db');
config.resolver.sourceExts.push('svg', 'cjs', 'mjs');

// Alias para evitar imports acidentais
config.resolver.alias = {
  'react-native-maps': 'react-native-maps/lib/commonjs/index',
  'react-native/Libraries/Utilities/codegenNativeCommands': false,
};

module.exports = config;