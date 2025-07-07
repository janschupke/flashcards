const HTMLWebPackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: "./src/index.tsx",
	resolve: {
		extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				use: {
					loader: "awesome-typescript-loader"
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
