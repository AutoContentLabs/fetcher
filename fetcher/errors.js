// errors.js
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
  
  module.exports = {
    FetcherError,
    TimeoutError,
    NetworkError,
    HttpError,
    CORSForbiddenError,
  };
  