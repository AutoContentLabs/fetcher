const fetcher = require('../fetcher');

describe('Fetcher Function - Real Connection and Data Fetch', () => {
  test('fetchDataWithTimeout should successfully fetch data in under the timeout limit', async () => {
    const url = 'example.com';

    const startTime = Date.now();
    const result = await fetcher(url);
    const endTime = Date.now();

    expect(typeof result).toBe('string');
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
