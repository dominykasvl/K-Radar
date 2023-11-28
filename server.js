const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const app = express();
const port = 3000;

const SummarizerManager = require("node-summarizer").SummarizerManager;

app.use(cors()); // Enable All CORS Requests
app.use(express.json()); // for parsing application/json

app.get('/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    const response = await axios.get(url);
    res.json({ contents: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the webpage' });
  }
});

app.post('/summarize', async (req, res) => {
  try {
    const text = req.body.text;
    let Summarizer = new SummarizerManager(text, 3); // 3 is the number of sentences in the summary
    let summaryObject = await Summarizer.getSummaryByRank();
    let summaryText = summaryObject.summary; // Extract the summary text
    res.json({ summary: summaryText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while summarizing the text' });
  }
});

// SSL options
const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});