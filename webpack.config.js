// webpack.config.js
const path = require('path');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  entry: './src/index.js',  // Entry point of your application
  output: {
    filename: 'lt.min.js',   // Output file name
    path: path.resolve(__dirname, 'dist'),  // Output directory
    library: {
        name: 'lcsTools',
        type: 'umd'  // Universal Module Definition: CommonJS, AMD, or browser
      },
    libraryTarget: 'window' // Important for <script src> usage
  },
  module: {
    rules: [
      {
        test: /\.js$/,  // Process JavaScript files
        exclude: /node_modules/,
        use: 'babel-loader',  // Transpile ES6+ code to ES5
      },
      {
        test: /\.css$/,  // Process CSS files
        use: ['style-loader', 'css-loader'],  // Inject CSS into JS
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.css'],  // File types to resolve
  },
  plugins: [
    new WebpackObfuscator({
        compact: true, // Keeps the code compact
        controlFlowFlattening: false, // Disable control flow flattening for better performance
        deadCodeInjection: false, // Avoid adding unnecessary junk code
        stringArrayEncoding: ['base64'], // Use simpler encoding for strings
        stringArrayThreshold: 0.75, // Slightly reduce string obfuscation
        splitStrings: true,
        splitStringsChunkLength: 3,
        selfDefending: false, // Disable self-defending for compatibility
        disableConsoleOutput: false, // Allow console.log for debugging
        renameGlobals: false // Avoid renaming globals to prevent conflicts
    }, [])
  ],
  mode: 'production',  // Set the mode
};