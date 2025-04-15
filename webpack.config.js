// Core Node.js module for working with file and directory paths
const path = require('path');

// Plugin for obfuscating/minifying the JS code for security
const WebpackObfuscator = require('webpack-obfuscator');

// Plugin for compressing output files (e.g., .js, .css) using gzip and Brotli
const CompressionPlugin = require('compression-webpack-plugin');

// Core Node.js module for zlib compression, used for Brotli settings
const zlib = require('zlib');

// Webpack configuration object
module.exports = {
  // Entry point of the application
  // Specifies the main JS file to start bundling from
  entry: './src/index.js',

  // Output configuration
  // Defines where and how the bundled files are saved
  output: {
    filename: 'lt.min.js', // Name of the output JS file after bundling
    path: path.resolve(__dirname, 'dist'), // Output directory (absolute path to dist/)
    library: {
      name: 'lcsTools', // Name of the global variable for the library
      type: 'umd'       // Universal Module Definition for CommonJS, AMD, and browser compatibility
    }
  },

  // Module rules
  // Defines how Webpack processes different file types during bundling
  module: {
    rules: [
      {
        test: /\.js$/,           // Apply this rule to .js files
        exclude: /node_modules/, // Skip node_modules to avoid processing dependencies
        use: 'babel-loader'      // Use Babel to transpile ES6+ code to ES5 for broader compatibility
      },
      {
        test: /\.css$/,                 // Apply this rule to .css files
        use: ['style-loader', 'css-loader'] // Bundle CSS into JS; style-loader injects CSS into DOM, css-loader processes CSS imports
      }
    ]
  },

  // Resolve configuration
  // Automatically resolves these file extensions during imports
  resolve: {
    extensions: ['.js', '.json', '.css'] // Allow importing files without specifying .js, .json, or .css extensions
  },

  // Plugins
  // Extends Webpack functionality with additional features like obfuscation and compression
  plugins: [
    // Obfuscator settings
    // Makes the code harder to reverse-engineer by transforming it
    new WebpackObfuscator({
      compact: true,                    // Output compact code to reduce size
      controlFlowFlattening: false,     // Avoid altering control flow to maintain performance
      deadCodeInjection: false,         // Don't inject fake code to keep bundle lean
      stringArrayEncoding: ['base64', 'rc4'],       // Disable base64 encoding to avoid size increase
      stringArrayThreshold: 0.5,        // Apply string obfuscation to 50% of strings for balanced security
      splitStrings: false,              // Disable splitting strings to reduce overhead
      splitStringsChunkLength: 3,       // Ignored since splitStrings is false
      selfDefending: false,             // Avoid adding code that breaks beautifiers
      disableConsoleOutput: false,      // Allow console logs for debugging
      renameGlobals: false              // Keep original global variable names
    }, []),

    // Gzip compression settings
    // Compresses output files to reduce size for faster downloads
    new CompressionPlugin({
      algorithm: 'gzip',          // Use gzip compression algorithm
      test: /\.(js|css)$/,        // Target only JS and CSS files
      threshold: 10240,           // Only compress files larger than 10 KB
      minRatio: 0.8,              // Only compress if size reduction is at least 20%
      filename: '[path][base].gz' // Output compressed files with .gz extension (e.g., lt.min.js.gz)
    }),

    // Brotli compression settings
    // Compresses output files using Brotli for better compression ratios than gzip
    new CompressionPlugin({
      algorithm: 'brotliCompress', // Use Node.js zlib's Brotli compression
      test: /\.(js|css)$/,         // Target only JS and CSS files
      threshold: 10240,            // Only compress files larger than 10 KB
      minRatio: 0.8,               // Only compress if size reduction is at least 20%
      filename: '[path][base].br', // Output compressed files with .br extension (e.g., lt.min.js.br)
      compressionOptions: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11 // Set maximum compression level (1-11)
      }
    })
  ],

  // Optimization settings
  // Configures bundle splitting and code elimination for smaller output
  optimization: {
    splitChunks: {
      chunks: 'all' // Split vendor and shared modules into separate chunks for better caching
    }
  },

  // Performance-related configurations
  // Controls warnings and limits for bundle and asset sizes
  performance: {
    hints: 'warning',              // Show warnings when assets exceed size limits
    maxEntrypointSize: 104857600,  // Maximum entrypoint size (100 MB)
    maxAssetSize: 104857600        // Maximum single asset size (100 MB)
  },

  // Build mode
  // Optimizes the bundle for production with minification and other optimizations
  mode: 'production'
};