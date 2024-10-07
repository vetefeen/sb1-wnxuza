import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, Key } from 'lucide-react';
import axios from 'axios';

interface EnergyData {
  total_power: number;
  total_energy: number;
}

function App() {
  const [source, setSource] = useState<'api' | 'shelly'>('api');
  const [ipAddress, setIpAddress] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [electricityRate, setElectricityRate] = useState(0.15);
  const [bill, setBill] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (energyData) {
      const kWh = energyData.total_energy / 1000;
      setBill(kWh * electricityRate);
    }
  }, [energyData, electricityRate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setEnergyData(null);
    try {
      const response = await axios.get('/api/energy-data', {
        params: {
          source,
          ipAddress: source === 'shelly' ? ipAddress : undefined,
          apiKey: source === 'api' ? apiKey : undefined
        }
      });
      setEnergyData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (axios.isAxiosError(error)) {
        setError(`Error: ${error.response?.data?.error || 'An unknown error occurred'}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Electricity Bill Calculator</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Source
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="api"
                checked={source === 'api'}
                onChange={() => setSource('api')}
                className="form-radio"
              />
              <span className="ml-2">API</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="shelly"
                checked={source === 'shelly'}
                onChange={() => setSource('shelly')}
                className="form-radio"
              />
              <span className="ml-2">Shelly Device</span>
            </label>
          </div>
        </div>
        {source === 'api' && (
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your API key"
              />
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        )}
        {source === 'shelly' && (
          <div className="mb-4">
            <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Shelly 3EM IP Address
            </label>
            <input
              type="text"
              id="ipAddress"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 192.168.1.100"
            />
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="electricityRate" className="block text-sm font-medium text-gray-700 mb-1">
            Electricity Rate ($/kWh)
          </label>
          <input
            type="number"
            id="electricityRate"
            value={electricityRate}
            onChange={(e) => setElectricityRate(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
        </div>
        <button
          onClick={fetchData}
          disabled={loading || (source === 'api' && !apiKey) || (source === 'shelly' && !ipAddress)}
          className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4 ${
            loading || (source === 'api' && !apiKey) || (source === 'shelly' && !ipAddress) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Fetching...' : 'Fetch Data'}
        </button>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {energyData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Zap className="mr-2" size={20} />
                Current Power:
              </span>
              <span className="font-semibold">{energyData.total_power.toFixed(2)} W</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Zap className="mr-2" size={20} />
                Total Energy:
              </span>
              <span className="font-semibold">{(energyData.total_energy / 1000).toFixed(2)} kWh</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <DollarSign className="mr-2" size={20} />
                Estimated Bill:
              </span>
              <span className="font-semibold">${bill.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;