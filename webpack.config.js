import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import RemoveSourceMapURLWebpackPlugin from "@rbarilani/remove-source-map-url-webpack-plugin";
import * as path from "path";

export default function (env, argv) {
    const isproduction = argv.mode == "production";
    const isdevelopment = argv.mode == "development";

    const config = {
        entry: {
            app: "./src/index.ts",
            mybabylon: "./src/my/index.ts",
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
        devtool: false,
        plugins: [
            new HtmlWebpackPlugin({ template: "index.html", minify: false }),
            new webpack.SourceMapDevToolPlugin({
                append: isproduction ? false : undefined,
                filename: "[file].map[query]",
                include: [/mybabylon/, /app/],
            }),
            new RemoveSourceMapURLWebpackPlugin({
                test: /^(vendor|lit)\./
            }),
        ],
        performance: {
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
                    else if (/\/(@lit|lit|lit-html|lit-element)\//.test(path)) return "lit";
                    else if (/\/node_modules\//.test(path)) return "vendor";
                },
            },
        },
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
    };

    if (isproduction) {
        config.optimization.splitChunks = {
            chunks: "all",
            name: (module, chunks, cacheGroupKey) => {
                const path = module.userRequest;
                if (/\/@babylonjs\//.test(path)) return "babylonjs";
                else if (/\/(@lit|lit|lit-html|lit-element)\//.test(path)) return "lit";
                else if (/\/node_modules\//.test(path)) return "vendor";
            },
        };

        config.plugins.push(
            new CopyPlugin({
                patterns: [{ from: "public/*.*", to: "[name][ext]", info: { minimized: true } }],
            })
        );
    }

    return config;
}
