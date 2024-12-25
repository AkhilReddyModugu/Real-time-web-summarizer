import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

import connectDB from './config/db.js';
import authRouter from './src/routes/authRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const fastAPIServer = process.env.FASTAPI_SERVER || 'http://localhost:8000';

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);

app.post('/api/summarize', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // Sending the request to FastAPI server
    const summarizationResponse = await axios.post(`${fastAPIServer}/summarize`, { query });
    res.json({ summary: summarizationResponse.data.summary });
  } catch (error) {
    console.error('Error from FastAPI server:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error occurred while processing the request' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, world! This is your Node.js server!');
});

app.all('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
