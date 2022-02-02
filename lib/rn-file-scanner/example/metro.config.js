'use strict';

const path = require('path');

const blacklist = require('metro-config/src/defaults/exclusionList');

const rootProjectDir = path.resolve(__dirname, '..');
console.log('__dirname', __dirname);

module.exports = {
	projectRoot: path.resolve(__dirname, '.'),
	resolver: {
		blacklistRE: blacklist([
			/node_modules\/rn-file-scanner\/.*/,
			new RegExp(`${rootProjectDir}/node_modules/react-native/.*`),
		]),
		extraNodeModules: new Proxy(
			{
				'rn-file-scanner': path.resolve(__dirname, '..'),
			},
			{
				get: (target, name) => path.join(process.cwd(), `node_modules/${name}`),
			},
		),
	},
	// Resolve rn-file-scanner from parent directory so we do not have to install rn-file-scanner after each change applied
	watchFolders: [rootProjectDir],
	transformer: {
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: false,
			},
		}),
	},
};
