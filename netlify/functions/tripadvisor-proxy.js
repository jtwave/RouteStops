const fetch = require('node-fetch');

// Simple in-memory cache (will reset on function cold starts)
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// Rate limiting
const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url, options, retryCount = 0) {
  try {
    const response = await fetch(url, options);

    if (response.status === 429 && retryCount < MAX_RETRIES) {
      console.log(`Rate limited, retrying in ${RETRY_DELAY}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY);
      return makeRequest(url, options, retryCount + 1);
    }

    const responseText = await response.text();
    // Only log the status code and URL, not the full response
    console.log(`Response status ${response.status} for ${url}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    // Log a summary of the data instead of the full response
    console.log('Response summary:', {
      url,
      status: response.status,
      hasData: !!data,
      dataLength: data.data?.length
    });

    return data;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Request failed, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY);
      return makeRequest(url, options, retryCount + 1);
    }
    throw error;
  }
}

function getCacheKey(params) {
  return JSON.stringify(params);
}

function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Cache hit:', key);
    return cached.data;
  }
  return null;
}

function setInCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };

  // Debug environment variables and request
  console.log('Function environment:', {
    nodeEnv: process.env.NODE_ENV,
    hasTripadvisorKey: !!process.env.TRIPADVISOR_API_KEY,
    functionName: context.functionName,
    functionVersion: context.functionVersion
  });

  // Verify API key
  if (!process.env.TRIPADVISOR_API_KEY) {
    console.error('TripAdvisor API key is missing in environment');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'API configuration error',
        details: 'TripAdvisor API key is not configured'
      })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const parsedBody = JSON.parse(event.body);
    // Only log essential request info
    console.log('Processing request:', {
      type: parsedBody.fetchDetails ? 'details' : 'search',
      name: parsedBody.name,
      locationId: parsedBody.locationId
    });

    // Check cache first
    const cacheKey = getCacheKey(parsedBody);
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: cachedResult })
      };
    }

    // Handle details request
    if (parsedBody.locationId) {
      const detailsUrl = `https://api.content.tripadvisor.com/api/v1/location/${parsedBody.locationId}/details?key=${process.env.TRIPADVISOR_API_KEY}&language=en&currency=USD`;
      console.log('Making TripAdvisor Details Request for ID:', parsedBody.locationId);

      const detailsData = await makeRequest(detailsUrl, {
        headers: { 'Accept': 'application/json' }
      });

      if (!detailsData || !detailsData.data) {
        console.log('No details found for location:', parsedBody.locationId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: null })
        };
      }

      setInCache(cacheKey, detailsData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: detailsData })
      };
    }

    // Handle search request
    const { name, lat, lon } = parsedBody;
    if (!name) {
      console.log('No restaurant name provided');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: null })
      };
    }

    const searchUrl = `https://api.content.tripadvisor.com/api/v1/location/search?key=${process.env.TRIPADVISOR_API_KEY}&searchQuery=${encodeURIComponent(name)}&latLong=${lat},${lon}&radius=20&radiusUnit=mi&language=en`;
    console.log('Making TripAdvisor Search Request for:', name);

    const searchResponse = await makeRequest(searchUrl, {
      headers: { 'Accept': 'application/json' }
    });

    console.log('Search Response:', JSON.stringify(searchResponse, null, 2));

    if (!searchResponse || !searchResponse.data || searchResponse.data.length === 0) {
      console.log('No results found for:', name);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: null })
      };
    }

    // Find the best matching result
    const results = searchResponse.data;
    const bestMatch = results.find(location => {
      // Check if names are very similar
      const normalizedSearchName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedLocationName = location.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedSearchName === normalizedLocationName;
    }) || results[0];

    try {
      // Get details for the best match
      const detailsUrl = `https://api.content.tripadvisor.com/api/v1/location/${bestMatch.location_id}/details?key=${process.env.TRIPADVISOR_API_KEY}&language=en&currency=USD`;
      console.log('Making TripAdvisor Details Request for ID:', bestMatch.location_id);

      const detailsResponse = await makeRequest(detailsUrl, {
        headers: { 'Accept': 'application/json' }
      });

      console.log('Details Response:', JSON.stringify(detailsResponse, null, 2));

      if (!detailsResponse) {
        console.log('No details found for location:', bestMatch.location_id);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            data: {
              ...bestMatch,
              rating: null,
              reviews: null,
              priceLevel: null,
              website: null,
              address: null,
              cuisine: [],
              phone: null,
              description: null,
              hours: null
            }
          })
        };
      }

      // Combine search and details data
      const enrichedData = {
        ...bestMatch,
        details: detailsResponse,
        rating: detailsResponse.rating,
        reviews: detailsResponse.num_reviews,
        priceLevel: detailsResponse.price_level,
        website: detailsResponse.website,
        address: detailsResponse.address_obj ? `${detailsResponse.address_obj.street1}, ${detailsResponse.address_obj.city}` : null,
        cuisine: detailsResponse.cuisine ? detailsResponse.cuisine.map(c => c.name) : [],
        phone: detailsResponse.phone,
        description: detailsResponse.description,
        hours: detailsResponse.hours ? detailsResponse.hours.weekday_text : null,
        distance: bestMatch.distance ? `${parseFloat(bestMatch.distance).toFixed(1)} mi` : null
      };

      setInCache(cacheKey, enrichedData);
      console.log('Final enriched data:', enrichedData);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: enrichedData })
      };
    } catch (error) {
      console.error('Error enriching data:', error);
      // Return the best match without enrichment if details request fails
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          data: {
            ...bestMatch,
            rating: null,
            reviews: null,
            priceLevel: null,
            website: null,
            address: null,
            cuisine: [],
            phone: null,
            description: null,
            hours: null
          }
        })
      };
    }
  } catch (error) {
    console.error('Function error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    if (error.message.includes('Missing required parameters')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Bad Request',
          message: error.message
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
