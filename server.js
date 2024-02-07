const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const fs = require('fs');
const app = express();
const port = 3000;

const SummarizerManager = require("node-summarizer").SummarizerManager;

////////////////////////

const crypto = require('crypto');
const readline = require('readline');

function decrypt(encryptedText, secretKey, iv) {
  let hash = crypto.createHash('sha256');
  hash.update(secretKey);
  let hashedKey = hash.digest();

  let decipher = crypto.createDecipheriv('aes-256-cbc', hashedKey, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getSecretKey() {
  return new Promise((resolve) => {
    rl.question('Please enter the tag for the file names: ', (tag) => {
      if (tag.includes('..')) {
        console.error('Invalid tag');
        return;
      }
      let iv = fs.readFileSync(`AES/iv_${tag}.txt`, 'utf8');
      let encrypted = fs.readFileSync(`AES/encrypted_${tag}.txt`, 'utf8');
      rl.question('Please enter your secret key: ', (secretKey) => {
        resolve(decrypt(encrypted, secretKey, iv));
      });
    });
  });
}

getSecretKey().then(apikey => {
  console.log('Decrypted text:', apikey);
  // You can use apikey here
  startServer(apikey);

  rl.close();
});

////////////////////////

async function startServer(apikey) {
  app.use(cors()); // Enable All CORS Requests
  app.use(express.json()); // for parsing application/json

  // Logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Europe/Vilnius" });
    console.log(`[${timestamp}] New ${req.method} request to ${req.path}`);
    next();
  });

  app.get('/proxy', async (req, res) => {
    try {
      const url = req.query.url;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${apikey}`
        }
      });
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

  http.createServer(app).listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}