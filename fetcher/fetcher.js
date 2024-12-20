// fetcher.js
const { FetcherError, TimeoutError, NetworkError, HttpError, CORSForbiddenError } = require('./errors');

/**
 * Fetcher: A robust HTTP request function that handles retries, timeout, and error handling.
 */
module.exports = async function fetcher(url, { timeout = 1000, maxRetries = 2, retryDelay = 200, log = false } = {}) {
  // URL validity check before making requests
  try {
    new URL(url); // Try to create a new URL object to check validity
  } catch (error) {
    throw new FetcherError(`Invalid URL: ${url} - Please check the URL format.`);
  }

  let retries = 0;
  const totalStartTime = Date.now(); 

  // Function to attempt the fetch request with retries
  const tryFetch = async () => {
    const attemptStartTime = Date.now();
    const currentTimeout = timeout * Math.pow(2, retries);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), currentTimeout);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId); 

      const attemptEndTime = Date.now();
      const attemptDuration = attemptEndTime - attemptStartTime; 
      if (log)
        console.log(`[fetcher] Attempt took ${attemptDuration} ms`);

      // Handle HTTP response errors based on status code
      if (!response.ok) {
        const status = response.status;
        switch (status) {
          case 400:
            throw new HttpError(400, 'Bad Request');
          case 401:
            throw new HttpError(401, 'Unauthorized');
          case 403:
            throw new HttpError(403, 'Forbidden');
          case 404:
            throw new HttpError(404, 'Not Found');
          case 500:
            throw new HttpError(500, 'Internal Server Error');
          default:
            throw new HttpError(status, response.statusText);
        }
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data; 
      } else {
        const text = await response.text();
        return text;
      }

    } catch (error) {
      if (retries < maxRetries) {
        retries += 1;
        if (log)
          console.log(`[fetcher] Retrying... Attempt ${retries} of ${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay)); 
        return tryFetch();
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Could not resolve host')) {
        throw new NetworkError();
      }
      if (error.name === 'AbortError') {
        throw new TimeoutError(currentTimeout);
      }
      if (error.message.includes('CORS')) {
        throw new CORSForbiddenError();
      } else {
        throw new FetcherError(error.message);
      }
    }
  };

  const result = await tryFetch(); 

  const totalEndTime = Date.now();  
  const totalDuration = totalEndTime - totalStartTime;
  if (log)
    console.log(`[fetcher] Total request duration: ${totalDuration} ms`);

  return result;
};
