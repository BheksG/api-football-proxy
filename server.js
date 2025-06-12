const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // cache for 10 minutes

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE_URL = 'https://v3.football.api-sports.io';

app.use(express.json());

app.get('/fixtures', async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: 'Missing date parameter' });

  const cacheKey = `fixtures-${date}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get(`${API_BASE_URL}/fixtures`, {
      params: { date },
      headers: { 'x-apisports-key': API_KEY }
    });
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
});

app.get('/predictions', async (req, res) => {
  const fixture = req.query.fixture;
  if (!fixture) return res.status(400).json({ error: 'Missing fixture parameter' });

  const cacheKey = `predictions-${fixture}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get(`${API_BASE_URL}/predictions`, {
      params: { fixture },
      headers: { 'x-apisports-key': API_KEY }
    });
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Football Proxy running on port ${PORT}`));
