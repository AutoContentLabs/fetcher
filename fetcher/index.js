/**
 * Fetcher Module
 * Provides an HTTP request function (fetcher) with automatic retries, timeout handling, and URL formatting.
 * Includes formatURL helper to ensure URLs are properly formatted.
 *
 * @module fetcher
 */

const fetcher = require('./fetcher');
const errors = require('./errors');
const formatURL = require('./formatURL');

module.exports = { fetcher, formatURL, ...errors };
