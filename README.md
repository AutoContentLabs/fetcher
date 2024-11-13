# Fetcher Module

The `fetcher` module provides a robust HTTP request utility with features like retries, timeout control, and error handling. It also includes a URL formatting function to ensure valid URLs.

## Features

- **Retry Logic**: Automatically retries failed requests up to a specified limit.
- **Timeout Control**: Cancels requests if they exceed a specified timeout.
- **Error Handling**: Detailed error messages for common HTTP errors and network issues.
- **URL Formatting**: Ensures the URL is valid and formatted correctly before making requests.

##

```bash
npm install git+https://github.com/auto-content-labs/fetcher.git

```

```js
const { fetcher, formatURL } = require("@auto-content-labs/fetcher");

const url = formatURL("google.com"); // Formats the URL to 'https://google.com'

fetcher(url, { timeout: 1000, maxRetries: 2, retryDelay: 1 })
  .then((data) => {
    console.log("Data received:", data);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```
