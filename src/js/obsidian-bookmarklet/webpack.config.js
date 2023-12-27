const path = require('path');
const webpack = require('webpack');

// Modified for webpack v5: See https://stackoverflow.com/a/46920791/839595
class AssetToBookmarkletPlugin {
    pluginName = 'AssetToBookmarkletPlugin';
    apply(compiler) {
        compiler.hooks.thisCompilation.tap(this.pluginName, (compilation) => {
            compilation.hooks.processAssets.tap({
                name: this.pluginName,
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
            }, (assets) => {
                // Emit a new .bookmarklet
                for (const assetName in assets) {
                    const asset = assets[assetName];
                    const content = 'javascript:' + encodeURIComponent('(function(){' + asset.source() + '})()');
                    compilation.emitAsset(assetName + '.bookmarklet', new webpack.sources.RawSource(content))
                    const htmlContent = "<html><body><p><a href=\""+content+"\">Send To Obsidian</a></p><p><textarea width='100%' height='10%' onclick='this.select()'>"+content+"</textarea></p></body></html>";
                    compilation.emitAsset('index.html', new webpack.sources.RawSource(htmlContent))
                    const mdContent = "# Send To Obsidian\n\n<p><a href=\""+content+"\">Send To Obsidian</a></p>";
                    compilation.emitAsset('index.md', new webpack.sources.RawSource(mdContent))
                }
            });
        });
    };
}

module.exports = {
    entry: {
        index: './src/index.js'
    },
    mode: 'production',
    output: {
        publicPath: '',
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    target: 'web',
    module: {
        rules: [{
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: 'url-loader',
                options: { limit: 0 } // 0 = always inline resource
            }]
        }, {
            test: /\.css$/,
            use: ['style-loader', {
                loader: 'css-loader',
                options: { minimize: true } // Minify CSS as well
            }]
        }]
    },
    plugins: [
        new AssetToBookmarkletPlugin()
    ]
}