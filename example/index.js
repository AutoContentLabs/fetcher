/**
 * Example usage of fetcher module.
 * This example demonstrates how to use the `fetcher` function with `formatURL`.
 * 
 * - The `formatURL` function ensures the URL has the correct format.
 * - The `fetcher` function makes an HTTP request to the formatted URL with specified retry and timeout settings.
 * 
 * @example
 * // Run this example by executing: `node example.js`
 */

const { fetcher, formatURL } = require('../fetcher');

// Format the URL before making a request
const url = formatURL('google.com');

fetcher(url, { timeout: 1000, maxRetries: 2, retryDelay: 1 })
  .then(data => {
    console.log('Data received:', data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
