const HTMLWebPackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';
	
	return {
		mode: isProduction ? 'production' : 'development',
		entry: "./src/index.tsx",
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'bundle.js',
			publicPath: '/'
		},
		resolve: {
			extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
		},
		module: {
			rules: [
				{
					test: /\.(ts|tsx)$/,
					use: {
						loader: "ts-loader"
					}
				},
				{
					enforce: "pre",
					test: /\.js$/,
					use: {
						loader: "source-map-loader"
					}
				},
			]
		},
		plugins: [
			new HTMLWebPackPlugin({
				template: "./src/index.html"
			})
		],
		devServer: {
			historyApiFallback: true,
			hot: true,
			port: 3000,
			open: true,
			static: {
				directory: path.join(__dirname, 'dist'),
			},
			compress: true,
			liveReload: true
		}
	};
};
