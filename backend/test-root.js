const axios = require('axios');

async function testRoot() {
  try {
    console.log('Testing root API endpoint...');
    
    const response = await axios.get('http://localhost:3000/');
    
    console.log('Request successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Request failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Error connecting to server.');
      console.error('Make sure the server is running on the correct port.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

// Run the test
testRoot();
