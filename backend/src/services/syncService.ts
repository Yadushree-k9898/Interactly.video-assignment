import axios, { AxiosError } from 'axios';
import https from 'https';

// Helper
function handleResponse(resp: { data: any; status: number }) {
  if (!resp.data) {
    throw new Error('Empty response from Sync API');
  }

  return {
    request: resp.config.data,
    response: resp.data,
    videoUrl: resp.data.video_url || resp.data.url,
    videoId: resp.data.id,
  };
}

// Generate personalized video
export async function generatePersonalizedVideo({ actorId, name, city, requestId }: any) {
  try {
    if (!process.env.SYNC_API_BASE || !process.env.SYNC_API_KEY) {
      throw new Error('Missing required environment variables: SYNC_API_BASE or SYNC_API_KEY');
    }

    const text = `Hi ${name} from ${city}, thanks for checking this out!`;
    const requestPayload = {
      actor_id: actorId,
      script: { type: 'text', input: text },
      test: true,
      aspect_ratio: '16:9',
      webhook_url: null,
    };

    const axiosInstance = axios.create({
      baseURL: process.env.SYNC_API_BASE,
      timeout: 60000,
      headers: {
        Authorization: `Bearer ${process.env.SYNC_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      validateStatus: (status) => status >= 200 && status < 500,
      httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: true }),
    });

    try {
      const resp = await axiosInstance.post('/v1/generate', requestPayload);
      return handleResponse(resp);
    } catch (axiosError) {
      console.log('Axios failed, trying fetch fallback...', axiosError);
      const fetchResp = await fetch(`${process.env.SYNC_API_BASE}/v1/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SYNC_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!fetchResp.ok) throw new Error(`Fetch API error: ${fetchResp.status} ${fetchResp.statusText}`);
      const data = await fetchResp.json();
      return handleResponse({ data, status: fetchResp.status });
    }
  } catch (error: any) {
    if (error.response) {
      console.error('Sync API Response Error:', error.response.data);
      throw new Error(`Sync API error: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('No response received from Sync API', error.request);
      throw new Error('No response received from Sync API');
    } else {
      console.error('Sync API Error:', error.message);
      throw error;
    }
  }
}
