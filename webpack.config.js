const HTMLWebPackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
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
	]
};
