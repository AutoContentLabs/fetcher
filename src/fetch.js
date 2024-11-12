const axios = require('axios');

const fetchData = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Data retrieval error:: ${error.message}`);
        throw new Error(`Data retrieval error: ${error.message}`);
    }
};

module.exports = {
    fetchData
};
