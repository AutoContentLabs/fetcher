// utils/formatURL.js

/**
 * Ensures the URL starts with a valid HTTP/HTTPS protocol.
 * If not, it defaults to adding 'https://'.
 *
 * @param {string} url - The input URL to format.
 * @returns {string} - The formatted URL with protocol if missing.
 */
function formatURL(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

module.exports = formatURL;
