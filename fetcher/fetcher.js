class FetcherError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FetcherError';
  }
}

class TimeoutError extends FetcherError {
  constructor(timeout) {
    super(`Request timed out after ${timeout} ms`);
    this.name = 'TimeoutError';
  }
}

class NetworkError extends FetcherError {
  constructor() {
    super('Network error: Failed to fetch, DNS resolution issue, or network problem.');
    this.name = 'NetworkError';
  }
}

class HttpError extends FetcherError {
  constructor(status, message) {
    super(`HTTP Error: ${status} - ${message}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

class CORSForbiddenError extends FetcherError {
  constructor() {
    super('CORS error: Access to this resource is blocked.');
    this.name = 'CORSForbiddenError';
  }
}

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
            throw new HttpError(400, 'Bad Request: The request was malformed or contains invalid data.');
          case 401:
            throw new HttpError(401, 'Unauthorized: Access is denied due to invalid credentials.');
          case 403:
            throw new HttpError(403, 'Forbidden: You do not have permission to access this resource.');
          case 404:
            throw new HttpError(404, 'Not Found: The requested resource could not be found.');
          case 500:
            throw new HttpError(500, 'Internal Server Error: The server encountered an unexpected condition.');
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
        throw new FetcherError('An unexpected error occurred: ' + error.message);
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
