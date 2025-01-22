import { GeoapifyError } from '../../types';

const API_URLS = {
  v1: 'https://api.geoapify.com/v1',
  v2: 'https://api.geoapify.com/v2'
};

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

interface GeoapifyRequestOptions {
  endpoint: string;
  params?: Record<string, string | number | boolean>;
}

async function makeRequest<T>({ endpoint, params = {} }: GeoapifyRequestOptions): Promise<T> {
  if (!API_KEY) {
    throw new GeoapifyError('API key is not configured');
  }

  // Convert all params to strings
  const stringParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    stringParams[key] = String(value);
  });

  // Add API key to params
  const queryParams = new URLSearchParams({
    ...stringParams,
    apiKey: API_KEY
  });

  // Clean up endpoint and determine API version
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = cleanEndpoint.startsWith('places') ? API_URLS.v2 : API_URLS.v1;
  
  const url = `${baseUrl}/${cleanEndpoint}?${queryParams}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new GeoapifyError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof GeoapifyError) {
      throw error;
    }

    throw new GeoapifyError(
      `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export const geoapifyClient = {
  get: makeRequest
};