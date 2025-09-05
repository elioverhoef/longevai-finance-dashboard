// Development server to securely serve financial data
// This should NOT be used in production - implement proper authentication instead

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve financial data (JSON)
app.get('/api/data', async (req, res) => {
  try {
    const dataPath = path.resolve(__dirname, '../data/sample-db.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading financial data:', error);
    res.status(404).json({ error: 'Financial data not found' });
  }
});

// Serve CSV data
app.get('/api/csv', async (req, res) => {
  try {
    const csvPath = path.resolve(__dirname, '../data/export_202501..202512.csv');
    const data = await fs.readFile(csvPath, 'utf-8');
    res.send(data);
  } catch (error) {
    console.error('Error reading CSV data:', error);
    res.status(404).json({ error: 'CSV data not found' });
  }
});

// Serve DB version
app.get('/api/db-version', async (req, res) => {
  try {
    const versionPath = path.resolve(__dirname, '../data/db-version.txt');
    const version = await fs.readFile(versionPath, 'utf-8');
    res.send(version.trim());
  } catch (error) {
    console.error('Error reading DB version:', error);
    res.status(404).json({ error: 'DB version not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🔒 Development data server running on http://localhost:${PORT}`);
  console.log('⚠️  This server should NEVER be used in production!');
});