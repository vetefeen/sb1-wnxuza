import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock API endpoint (replace this with your actual API endpoint)
const API_ENDPOINT = 'https://api.example.com/energy-data';

app.get('/api/energy-data', async (req, res) => {
  const { source, ipAddress, apiKey } = req.query;

  if (source !== 'api' && source !== 'shelly') {
    return res.status(400).json({ error: 'Invalid source. Use "api" or "shelly".' });
  }

  if (source === 'api' && !apiKey) {
    return res.status(400).json({ error: 'API key is required for API source.' });
  }

  if (source === 'shelly' && !ipAddress) {
    return res.status(400).json({ error: 'IP address is required for Shelly device.' });
  }

  try {
    let data;
    if (source === 'api') {
      const response = await axios.get(API_ENDPOINT, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      data = response.data;
    } else {
      const response = await axios.get(`http://${ipAddress}/status`, { timeout: 5000 });
      data = response.data;
    }

    // Process and return the data
    const processedData = processEnergyData(data, source);
    res.json(processedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      error: 'An error occurred while fetching data.',
      details: error.message
    });
  }
});

function processEnergyData(data, source) {
  if (source === 'api') {
    // Process API data (adjust according to your API response structure)
    return {
      total_power: data.current_power,
      total_energy: data.total_energy
    };
  } else {
    // Process Shelly data
    return {
      total_power: data.meters.reduce((sum, meter) => sum + meter.power, 0),
      total_energy: data.meters.reduce((sum, meter) => sum + meter.total, 0)
    };
  }
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});