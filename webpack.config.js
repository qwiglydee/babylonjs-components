import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import * as path from "path";

export default function (env, argv) {
    const isproduction = argv.mode == "production";
    const isdevelopment = argv.mode == "development";
    const istesting = !isproduction && !isdevelopment;

    const config = {
        entry: {
            ourapp: ["./src/our/index.ts"],
            mybabylon: ["./src/my/index.ts"],
        },
        resolve: {
            extensions: [".ts", ".js"],
            alias: {
                "@utils": path.resolve("./src/utils/"),
                "@lib": path.resolve("./src/lib/"),
            },
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: "/node_modules/",
                    loader: "ts-loader",
                    options: { compilerOptions: { sourceMap: isdevelopment } },
                },
                {
                    test: /\.ts$/,
                    exclude: "/node_modules/",
                    loader: "minify-html-literals-loader",
                },
            ],
        },
        output: {
            path: path.resolve("./dist"),
            filename: "[name].[contenthash].js",
            assetModuleFilename: "[name][ext]",
        },
        plugins: [
            new HtmlWebpackPlugin({ template: "index.html", minify: false }),
            new webpack.SourceMapDevToolPlugin({
                append: isproduction ? false : undefined,
                columns: false,
                // filename: "[file].map[query]",
                exclude: [/\/node_modules\//],
            }),
        ],
        performance: {
            maxAssetSize: 3000000,
            maxEntrypointSize: 5000000,
        },
        optimization: {
            minimize: isproduction,
            minimizer: [
                new TerserPlugin({
                    exclude: [/draco_.*_gltf/],
                }),
            ],
            splitChunks: {
                chunks: "all",
                name: (module, chunks, cacheGroupKey) => {
                    const path = module.userRequest;
                    if (/\/@babylonjs\//.test(path)) return "babylonjs";
                    else if (/\/(@lit|lit-html|lit-element)\//.test(path)) return "lit";
                },
            },
        },
        devtool: false,
        devServer: {
            hot: true,
            compress: true,
            historyApiFallback: false,
            static: {
                directory: "./public",
                serveIndex: false,
            },
            client: {
                overlay: false,
            },
        },
        infrastructureLogging: {
            colors: true, 
            appendOnly: true,
            level: "info",
        },
    };

    if (isproduction) {
        config.plugins.push(
            new CopyPlugin({
                patterns: [
                    { from: "public/*.*", to: "[name][ext]", info: { minimized: true } },
                    { from: "public/assets/*.*", to: "assets/[name][ext]" }
                ],
            }),
        );
    }

    if (isdevelopment) {
        config.entry.mybabylon.push("./src/testing.ts");
        config.plugins.push(new HtmlWebpackPlugin({ template: "tests/testpage.html", filename: "testpage.html", minify: false, inject: "body" }));
    }

    return config;
}
