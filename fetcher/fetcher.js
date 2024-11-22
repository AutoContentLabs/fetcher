/**
 * Fetcher: A robust HTTP request function that handles retries, timeout, and error handling.
 * This function makes an HTTP request to the provided URL with options for timeout, retries, and retry delay.
 * It will attempt to fetch the resource, retry on failure, and handle different HTTP error statuses.
 *
 * @param {string} url - The URL to fetch the resource from.
 * @param {Object} [options] - Configuration options for the fetch request.
 * @param {number} [options.timeout=1000] - The timeout in milliseconds for the request. Default is 1000 ms.
 * @param {number} [options.maxRetries=2] - The maximum number of retry attempts in case of failure. Default is 2 retries.
 * @param {number} [options.retryDelay=200] - The delay in milliseconds between retries. Default is 200 ms.
 * 
 * @returns {Promise<Object|string>} - Returns a promise that resolves to the fetched data (JSON or text), or rejects with an error.
 */
module.exports = async function fetcher(url, { timeout = 1000, maxRetries = 2, retryDelay = 200, log = false } = {}) {
  // URL validity check before making requests
  try {
    new URL(url); // Try to create a new URL object to check validity
  } catch (error) {
    throw new Error(`Invalid URL: ${url} - Please check the URL format.`);
  }

  let retries = 0;  // Counter to track the number of retries
  const totalStartTime = Date.now(); // Start time for total request duration measurement

  // Function to attempt the fetch request with retries
  const tryFetch = async () => {
    const attemptStartTime = Date.now(); // Start time for this specific attempt

    try {
      // Dynamically adjust the timeout for each retry attempt (multiply by 2 for each retry)
      const currentTimeout = timeout * Math.pow(2, retries); // Increase timeout exponentially

      const controller = new AbortController();  // Create a new AbortController for each attempt
      const timeoutId = setTimeout(() => controller.abort(), currentTimeout);  // Set timeout based on currentTimeout

      // Attempt to make the fetch request with the provided URL and timeout signal
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);  // Clear the timeout if the request succeeds

      // Calculate the time taken for this attempt
      const attemptEndTime = Date.now(); // End time for this attempt
      const attemptDuration = attemptEndTime - attemptStartTime; // Duration of the current attempt
      if (log)
        console.log(`[fetcher] Attempt took ${attemptDuration} ms`);

      // Handle HTTP response errors based on status code
      if (!response.ok) {
        const status = response.status;
        switch (status) {
          case 400:
            throw new Error('400 Bad Request: The request was malformed or contains invalid data.');
          case 401:
            throw new Error('401 Unauthorized: Access is denied due to invalid credentials.');
          case 403:
            throw new Error('403 Forbidden: You do not have permission to access this resource.');
          case 404:
            throw new Error('404 Not Found: The requested resource could not be found.');
          case 500:
            throw new Error('500 Internal Server Error: The server encountered an unexpected condition.');
          default:
            throw new Error(`HTTP Error: ${status} - ${response.statusText}`);
        }
      }

      // Check the response content type and return appropriate data
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;  // Return JSON data if content type is JSON
      } else {
        const text = await response.text();
        return text;  // Return the response text if not JSON
      }

    } catch (error) {
      // Retry logic in case of failure
      if (retries < maxRetries) {
        retries += 1;
        if (log)
          console.log(`[fetcher] Retrying... Attempt ${retries} of ${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));  // Wait before retrying
        return tryFetch();  // Retry the fetch request
      }

      // Handle specific error cases
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Could not resolve host')) {
        // DNS resolution issue handling
        throw new Error('DNS resolution failed: Could not resolve the domain, check the URL or network connection. This might be a DNS_PROBE_FINISHED_NXDOMAIN error.');
      }
      if (error.name === 'AbortError') {
        // Timeout handling
        throw new Error(`Request timed out after ${currentTimeout} ms`);
      }
      if (error.message.includes('CORS')) {
        // CORS error handling
        throw new Error('CORS error: Access to this resource is blocked');
      } else {
        // Generic error handling
        throw new Error('An unexpected error occurred: ' + error.message);  // Catch any other errors
      }
    }
  };

  const result = await tryFetch(); // Start the fetch attempt

  const totalEndTime = Date.now();  // End time for total request duration
  const totalDuration = totalEndTime - totalStartTime;  // Total duration for the entire fetch process
  if (log)
    console.log(`[fetcher] Total request duration: ${totalDuration} ms`);

  return result;
};
