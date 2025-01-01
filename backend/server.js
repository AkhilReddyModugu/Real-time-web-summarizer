import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

import connectDB from './config/db.js';
import authRouter from './src/routes/authRouter.js';
import sendEmail from './src/controllers/sendEmailController.js';
import chatRouter from './src/routes/chatRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; 
const fastAPIServer = process.env.FASTAPI_SERVER || 'http://localhost:8000';

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);

app.use("/api/chat",chatRouter);

app.post('/api/send-email',sendEmail);

// Summarize: request to python server
app.post('/api/summarize', async (req, res) => {
  const { query, length } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!length) {
    return res.status(400).json({ error: 'Length is required' });
  }

  try {
    const summarizationResponse = await axios.post(`${fastAPIServer}/summarize`, { query, length });
    res.json({
      summary: summarizationResponse.data.summary,
      image_urls: summarizationResponse.data.image_urls || []
    });
  } catch (error) {
    console.error('Error from FastAPI server:', error.response ? error.response.data : error.message);

    if (error.response && error.response.data && error.response.data.detail) {
      const detail = error.response.data.detail;

      let userFriendlyMessage;

      if (detail.includes('Failed to fetch sufficient data')) {
        userFriendlyMessage =
          'We could not gather enough relevant information for your query. Please try refining your search with more specific keywords.';
      } else {
        userFriendlyMessage = 'An unexpected error occurred. Please try again later.';
      }

      res.status(500).json({ error: userFriendlyMessage });
    } else {
      res.status(500).json({ error: 'An error occurred while processing your request. Please try again later.' });
    }
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
