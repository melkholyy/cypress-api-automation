// ...existing code...
const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");

async function setupNodeEvents(on, config) {
  // call plugin before registering the file preprocessor
  await addCucumberPreprocessorPlugin(on, config);

  const bundler = createBundler({
    plugins: [createEsbuildPlugin(config)]
  });

  on("file:preprocessor", bundler);

  return config;
}

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://simple-tool-rental-api.click",
    specPattern: "cypress/e2e/**/*.feature",
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents
  },
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720
});
// ...existing code...