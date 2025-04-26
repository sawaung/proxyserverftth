const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');


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

app.post('/proxy/balance', async (req, res) => {
  const { accessToken, msisdn } = req.body;

  if (!accessToken || !msisdn) {
    return res.status(400).json({ error: "accessToken and msisdn are required." });
  }

  const transactionId = Date.now();

  const xmlBody = `
<?xml version="1.0"?>
<COMMAND>
    <TYPE>CBEREQ</TYPE>
    <MSISDN>${msisdn}</MSISDN>
    <PAYID>12</PAYID>
    <BLOCKSMS>BOTH</BLOCKSMS>
    <PROVIDER>101</PROVIDER>
    <CELLID></CELLID>
    <LANGUAGE1>1</LANGUAGE1>
    <TRID>${transactionId}</TRID>
</COMMAND>
`;

  try {
    const response = await axios.post(
      'https://testmpitesan.ooredoo.com.mm:8243/imiNonFinancialXMLService/1.0.0',
      xmlBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'text/html',
        },
      }
    );

    const xmlResponse = response.data;
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xmlResponse, (err, result) => {
      if (err) {
        console.error('XML Parsing Error:', err);
        return res.status(500).json({ error: 'Failed to parse XML' });
      }

      const command = result.COMMAND;
      const jsonResponse = {
        balance: command.BALANCE || '',
        txnStatus: command.TXNSTATUS || '',
        message: command.MESSAGE || '',
        frBalance: command.FRBALANCE || '',
        ficBalance: command.FICBALANCE || '',
        trid: command.TRID || ''
      };

      res.json(jsonResponse); // Final JSON Response ✅
    });

  } catch (error) {
    console.error('Balance API error:', error.response?.data || error.message);
    res.status(500).json({ error: error.toString() });
  }
});


// Health check
app.get('/', (req, res) => {
  res.send('Proxy Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));