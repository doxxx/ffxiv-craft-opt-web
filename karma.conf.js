module.exports = function( config ) {
  config.set( {
    browsers: [ 'jsdom' ],
    frameworks: [ 'mocha' ],

    plugins: [
      'karma-chrome-launcher',
      'karma-jsdom-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],

    files: [
      // since it's not a module, we include it directly
      'app/lib/string/String.js',
      'app/js/actions.js',
      'app/js/ffxivcraftmodel.js',
      'test/**/*Test.js',
    ],

    preprocessors: {
      'app/**/*.js': [ 'sourcemap' ],
      'test/**/*.js': [ 'webpack', 'sourcemap' ],
    },

    reporters: [
      'mocha',
    ],

    mochaReporter: {
      output: 'autowatch',
    },

    webpack: {
      mode: 'development',
    },

  });
};
