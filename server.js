const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.use(cors());

// In-memory cache
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in ms

const generateCacheKey = (url) => `cache_${url}`;

// --- FIXTURES ENDPOINT ---
app.get('/api/fixtures', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  const url = `https://v3.football.api-sports.io/fixtures?date=${date}`;
  const cacheKey = generateCacheKey(url);

  if (cache.has(cacheKey) && Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION) {
    return res.json(cache.get(cacheKey).data);
  }

  try {
    const response = await axios.get(url, {
      headers: { 'x-apisports-key': API_KEY }
    });
    cache.set(cacheKey, { timestamp: Date.now(), data: response.data });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
});

// --- PREDICTIONS ENDPOINT ---
app.get('/api/predictions', async (req, res) => {
  const { fixture } = req.query;
  if (!fixture) return res.status(400).json({ error: 'Fixture ID is required' });

  const url = `https://v3.football.api-sports.io/predictions?fixture=${fixture}`;
  const cacheKey = generateCacheKey(url);

  if (cache.has(cacheKey) && Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION) {
    return res.json(cache.get(cacheKey).data);
  }

  try {
    const response = await axios.get(url, {
      headers: { 'x-apisports-key': API_KEY }
    });
    cache.set(cacheKey, { timestamp: Date.now(), data: response.data });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// --- DEFAULT HOMEPAGE ---
app.get('/', (req, res) => {
  res.send('✅ API-Football proxy is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

