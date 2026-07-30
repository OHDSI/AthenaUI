const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const sourcePath = path.join(__dirname, './src');
const outPath = path.join(__dirname, './dist');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const ENV_TYPE = {
  DEV: 'development',
  PRODUCTION: 'production',
};

module.exports = function(env) {
  const mode = (env && env.mode) || ENV_TYPE.PRODUCTION;
  return {
    mode: mode,
    context: sourcePath,
    entry: {
      main: './index.tsx',
    },
    output: {
      path: outPath,
      publicPath: '/',
      filename: 'app.[contenthash].js',
      clean: true,
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      // Prefer each package's browser build, but keep excluding the `module`
      // (jsnext:main) field - https://github.com/Microsoft/TypeScript/issues/11677
      mainFields: ['browser', 'main'],
      modules: [
        sourcePath,
        path.join(__dirname, 'node_modules')
      ],
      // webpack 5 dropped the automatic Node core-module polyfills that the old
      // `node: { fs: 'empty', net: 'empty' }` block used to configure.
      fallback: {
        fs: false,
        net: false,
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /(node_modules|ArachneUIComponents|@types)/gi,
          use: ['ts-loader']
        },
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|ArachneUIComponents)/,
          use: ['babel-loader']
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: "style-loader"
            },
            {
              loader: "css-loader",
              options: {
                // Root-relative url(/fonts/...) references point at assets that
                // CopyWebpackPlugin emits into dist/ and the server exposes at
                // runtime, so leave them for the browser to resolve.
                url: {
                  filter: (url) => !url.startsWith('/'),
                },
              },
            },
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  includePaths: [
                    sourcePath,
                    path.join(__dirname, 'node_modules')
                  ],
                  // Silence deprecations raised inside node_modules only - the
                  // tootik package still uses @import internally and we cannot
                  // fix it here. Deprecations in this app's own stylesheets are
                  // still reported.
                  quietDeps: true,
                },
              },
            },
          ]
        }
      ]
    },
    devServer: {
      static: {
        directory: sourcePath,
      },
      historyApiFallback: true,
      hot: true,
      port: 3000,
      proxy: [
        {
          // `/auth/sso` requires authentication server-side, so Spring Security
          // bounces it through its own entry point: /auth/sso -> 302 /login ->
          // (SAML) /saml2/**. Those hops belong to the backend, but they are
          // plain page loads, so without them listed here historyApiFallback
          // swallows the redirect and serves index.html - the SSO popup then
          // renders the SPA shell with no matching route, i.e. blank.
          context: [
            '/api',
            '/auth/sso',
            '/auth/slo',
            '/login',
            '/logout',
            '/saml2',
            '/default-ui.css',
          ],
          target: 'http://localhost:3010',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        hash: true,
        template: 'index.html',
        favicon: 'favicon.ico',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'node_modules/arachne-ui-components/lib/resources/fonts'),
            to: path.join(outPath, 'fonts')
          },
          {
            from: path.join(__dirname, 'node_modules/arachne-ui-components/lib/resources/material-design-icons/iconfont'),
            to: path.join(outPath, 'fonts')
          },
          {
            from: path.join(__dirname, 'resources/icons'),
            to: path.join(outPath, 'icons')
          },
        ],
      }),
      new webpack.DefinePlugin({
        __DEV__: mode === ENV_TYPE.DEV,
      }),
    ],
  };
}
