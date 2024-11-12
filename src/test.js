const { fetchData } = require('./fetch');

const testUrl = 'https://jsonplaceholder.typicode.com/posts';  // Example

const testFetch = async () => {
    try {
        const data = await fetchData(testUrl);
        console.log('Data was extracted successfully:', data);
    } catch (error) {
        console.error('An error occurred during testing:', error.message);
    }
};

testFetch();
