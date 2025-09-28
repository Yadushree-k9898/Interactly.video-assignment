import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

async function testSyncConnection() {
  try {
    console.log('Testing Sync Labs API connection...');
    
    const baseURL = process.env.SYNC_API_BASE || 'https://api.synclabs.dev';
    const apiKey = process.env.SYNC_API_KEY;

    if (!apiKey) {
      throw new Error('SYNC_API_KEY is not set');
    }

    console.log('Using base URL:', baseURL);
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10));

    // First try /health endpoint
    try {
      const healthResponse = await axios.get(`${baseURL}/health`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      });

      console.log('Health check successful:', {
        status: healthResponse.status,
        data: healthResponse.data
      });
    } catch (healthError) {
      console.log('Health check failed, trying /v1/actors...');
    }

    // Try fetching actors list as backup test
    const actorsResponse = await axios.get(`${baseURL}/v1/actors`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      timeout: 5000
    });

    console.log('Connection test successful:', {
      status: actorsResponse.status,
      data: actorsResponse.data
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Connection test failed:', {
        message: error.message,
        response: error.response?.data,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

testSyncConnection();