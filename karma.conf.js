module.exports = function(config) {
  config.set({
    basePath: '',
    browsers: ['Chrome'],
    client:{ clearContext: false }, // leave Jasmine Spec Runner output visible in browser 
    colors: true,
    concurrency: Infinity,
    files: ['src/index.spec.ts', 'dist/index.js'],
    frameworks: ['jasmine', 'karma-typescript'],
    karmaTypescriptConfig: {
      compilerOptions: {
          allowJs: true,
      },
      tsconfig: "./tsconfig.spec.json",
      reports: {
        "html": "coverage",
        "lcovonly": "coverage",
      },
    },
    port: 9876,
    preprocessors: {
      'dist/index.js': 'karma-typescript',
      'src/index.spec.ts': 'karma-typescript',
    },
    reporters: ["karma-typescript", 'progress'],
  });
};
