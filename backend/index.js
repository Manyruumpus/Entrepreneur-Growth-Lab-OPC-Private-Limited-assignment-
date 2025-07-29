// Load environment variables from the .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---

// Route to get the list of actors
app.post('/api/actors', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Apify API token is required.' });
  }
  try {
    const response = await axios.get('https://api.apify.com/v2/acts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    res.json(response.data.data.items);
  } catch (error) {
    if (error.response && error.response.status === 401) {
        return res.status(401).json({ error: 'Invalid Apify API token.' });
    }
    console.error('Error fetching actors:', error.message);
    res.status(500).json({ error: 'Failed to fetch actors from Apify.' });
  }
});


// Route to get the input schema for a specific actor
// --- Replace the entire `/api/get-schema` route with this ---

// Route to get the input schema for a specific actor
app.post('/api/get-schema', async (req, res) => {
  const { token, actorId } = req.body;

  if (!token || !actorId) {
    return res.status(400).json({ error: 'API token and actorId are required.' });
  }

  try {
    const encodedActorId = actorId.replace('/', '~');
    const url = `https://api.apify.com/v2/acts/${encodedActorId}`;

    const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const actorData = response.data.data;
    let schema = null;

    // Strategy 1: Check for a direct 'inputSchema' property on the actor object.
    // This is the most common case for newer actors.
    if (actorData.inputSchema && typeof actorData.inputSchema === 'object') {
        schema = actorData.inputSchema;
    } 
    // Strategy 2: If the first method fails, search for an 'INPUT_SCHEMA.json' file.
    // This is the fallback for actors like 'web-scraper'.
    else if (actorData.versions && actorData.versions.length > 0) {
        const latestVersion = actorData.versions[actorData.versions.length - 1];
        if (latestVersion.sourceFiles) {
            const schemaFile = latestVersion.sourceFiles.find(
              (file) => file.name === 'INPUT_SCHEMA.json'
            );
            if (schemaFile && schemaFile.content) {
                schema = JSON.parse(schemaFile.content);
            }
        }
    }

    // If we found a schema by either method, return it.
    if (schema) {
        res.json(schema);
    } else {
        // If no schema is found, return an empty object so the frontend doesn't break.
        // This will show the "This actor has no configurable input" message.
        res.json({ title: `${actorData.name} Input`, type: 'object', properties: {} });
    }

  } catch (error) {
    if (error.response && error.response.status === 404) {
        return res.status(404).json({ error: 'Actor not found.' });
    }
    console.error('Error fetching actor schema:', error.message);
    res.status(500).json({ error: 'Failed to fetch actor schema.' });
  }
});
// Route to run an actor and get its result
app.post('/api/run-actor', async (req, res) => {
  const { token, actorId, inputData } = req.body;

  if (!token || !actorId || !inputData) {
    return res.status(400).json({ error: 'API token, actorId, and inputData are required.' });
  }

  try {
    const encodedActorId = actorId.replace('/', '~');
    const url = `https://api.apify.com/v2/acts/${encodedActorId}/run-sync-get-dataset-items`;

    const response = await axios.post(url, inputData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);

 // --- Find the /api/run-actor route and replace its CATCH block ---

// ... inside app.post('/api/run-actor', ...
} catch (error) {
  // Log the full error for server-side debugging
  console.error('Error running actor:', error.response?.data || error.message);

  // Extract a more specific error message to send to the user.
  // The detailed error from Apify is often nested inside error.response.data.error.message
  const specificError = error.response?.data?.error?.message || 'An unknown error occurred during the actor run.';
  
  // Send back a specific status code from the error if available, otherwise default to 500
  const statusCode = error.response?.status || 500;

  res.status(statusCode).json({ error: specificError });
}
// ...
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});