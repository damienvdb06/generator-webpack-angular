'use strict';

// Modules
var webpack = require('webpack');
var path = require('path');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = ConfigBuilder;

/**
 * Configuration builder. Tool to easily build your webpack configuration.
 */
function ConfigBuilder() {
  var that = this;
  this.staticResourcesPath = path.join(__dirname, '/src/public');
  this.cssLoaderValue = 'null';
  this.output = true;
  this.fileNames = '[name].bundle.js';
  this.config = {
    entry: {},
    module: {
      preLoaders: []
    },
    plugins: [],
    /**
     * PostCSS Reference: https://github.com/postcss/autoprefixer-core Add
     * vendor prefixes to your css
     */
    postcss: [autoprefixer({
      browsers: ['last 2 version']
    })],
    /**
     * Dev server this.configuration Reference:
     * http://webpack.github.io/docs/this.configuration.html#devserver
     * Reference: http://webpack.github.io/docs/webpack-dev-server.html
     */
    devServer: {
      contentBase: this.staticResourcesPath,
      stats: 'minimal'
    }
  };

  this.build = function() {
    if (this.output) {
      computeOutput();
    }
    this.config.module.loaders = computeLoaders();
    return this.config;
  };

  this.withoutOutput = function() {
    this.output = false;
    return this;
  };

  this.hashedOutput = function() {
    this.fileNames = '[name].[hash]';
    return this;
  };

  this.entryPoint = function(entry) {
    this.config.entry.app = entry;
    return this;
  };

  this.devtool = function(devtool) {
    this.config.devtool = devtool;
    return this;
  };

  this.coverage = function() {
    // ISPARTA LOADER
    // Reference: https://github.com/ColCh/isparta-instrumenter-loader
    // Instrument JS files with Isparta for subsequent code coverage
    // reporting
    // Skips node_modules and files that end with .spec.js
    this.config.module.preLoaders.push({
      test: /\.js$/,
      exclude: [/node_modules/, /\.spec\.js$/],
      loader: 'isparta-instrumenter'
    });
    return this;
  };

  this.noErrors = function() {
    this.config.plugins.push(
    // Reference:
    // http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
    // Only emit files when there are no errors
    new webpack.NoErrorsPlugin());
    return this;
  };

  this.minify = function() {
    this.config.plugins.push(

    // Reference:
    // http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
    // Dedupe modules in the output
    new webpack.optimize.DedupePlugin(),

    // Reference:
    // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
    // Minify all javascript, switch loaders to minimizing mode
    new webpack.optimize.UglifyJsPlugin());
    return this;
  };

  this.copyStaticResources = function() {
    this.config.plugins.push(

    // Copy assets from the public folder
    // Reference: https://github.com/kevlened/copy-webpack-plugin
    new CopyWebpackPlugin([{
      from: this.staticResourcesPath
    }]));
    return this;
  };

  /**
   * Configures loaders.
   * @return{array} Arrays of loaders
   */
  function computeLoaders() {
    return [{
      test: /\.css$/,
      loader: that.cssLoaderValue
    }, {
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
      loader: 'file'
    }, {
      test: /\.html$/,
      loader: 'raw'
    }];
  }

  /**
   * Fills configuration with output related block.
   */
  function computeOutput() {
    that.config.output = {
      path: path.join(__dirname, '/dist'),
      publicPath: '/',
      filename: that.fileNames + '.js',
      chunkFilename: that.fileNames + '.js'
    };
    renderHtml();
    handleCss();
  }

  /**
   * Configures HtmlWebpackPlugin.
   */
  function renderHtml() {
    that.config.plugins.push(new HtmlWebpackPlugin({
      template: './src/public/index.html',
      inject: 'body'
    }));
  }

  /**
   * Configures ExtractTextPlugin.
   */
  function handleCss() {
    that.cssLoaderValue = ExtractTextPlugin.extract('style',
        'css?sourceMap!postcss');
    that.config.plugins.push(
    // Reference: https://github.com/webpack/extract-text-webpack-plugin
    // Extract css files
    new ExtractTextPlugin(that.fileNames + '.css'));
  }
}
