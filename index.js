const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); // Allow CORS from any origin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/proxy/token', async (req, res) => {
  try {
    const response = await axios.post(
      'https://testmpitesan.ooredoo.com.mm:8243/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': 'Basic U2ZvekpNdDRuTTFZRTJUY0J4ZFpqUkRZWFI4YTptQ2dNamxadDhvSFpPRGRQYUdXa09qWEgyN01h',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    res.json(response.data); // Return token response to frontend
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(500).json({ error: error.toString() });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Proxy Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));