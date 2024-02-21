const express = require("express");
const cors = require("cors");
const axios = require("axios");
const http = require("http");
const fs = require("fs");
const app = express();
const port = 3000;

const SummarizerManager = require("node-summarizer").SummarizerManager;

////////////////////////

const crypto = require("crypto");
const readline = require("readline");

const OpenAI = require("openai");

function decrypt(encryptedText, secretKey, iv) {
  let hash = crypto.createHash("sha256");
  hash.update(secretKey);
  let hashedKey = hash.digest();

  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    hashedKey,
    Buffer.from(iv, "hex"),
  );
  let decrypted = decipher.update(Buffer.from(encryptedText, "hex"));

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getSecretKey() {
  return new Promise((resolve) => {
    rl.question("Please enter the tag for the file names: ", (tag) => {
      if (tag.includes("..")) {
        console.error("Invalid tag");
        return;
      }
      let iv = fs.readFileSync(`AES/iv_${tag}.txt`, "utf8");
      let encrypted = fs.readFileSync(`AES/encrypted_${tag}.txt`, "utf8");
      rl.question("Please enter your secret key: ", (secretKey) => {
        resolve(decrypt(encrypted, secretKey, iv));
      });
    });
  });
}

const args = process.argv.slice(2); // Get command-line arguments passed when starting the script

if (args.includes("--load-key")) {
  getSecretKey().then((apikey) => {
    // Use API key here
    startServer(apikey);
    rl.close();
  });
} else {
  startServer("000");
}

////////////////////////

async function startServer(apikey) {
  console.clear();

  const openai = new OpenAI({
    apiKey: apikey, // Assign decrypted api key
  });

  async function getSummary(text) {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "Summarise the following text. Text should be short and concise. 3 sentences max. Text: " +
            text,
        },
      ],
      model: "gpt-3.5-turbo-0125",
    });

    console.log(chatCompletion);
    return chatCompletion.choices[0].message.content;
  }

  app.use(cors()); // Enable All CORS Requests
  app.use(express.json()); // for parsing application/json

  // Logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "Europe/Vilnius",
    });
    console.log(`[${timestamp}] New ${req.method} request to ${req.path}`);
    next();
  });

  app.post("/summarise/v1/frequency", async (req, res) => {
    try {
      const text = req.body.text;
      let Summarizer = new SummarizerManager(text, 2);
      let summaryText = Summarizer.getSummaryByFrequency().summary;
      console.log("Summary: " + summaryText);
      res.json({ summary: summaryText });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while summarizing the text" });
    }
  });

  app.post("/summarise/v1/textrank", async (req, res) => {
    try {
      const text = req.body.text;
      let Summarizer = new SummarizerManager(text, 2);
      let summaryText = Summarizer.getSummaryByRank().then((summary_object) => {
        console.log(summary_object.summary);
        res.json({ summary: summary_object.summary });
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while summarizing the text" });
    }
  });

  app.post("/summarise/v2", async (req, res) => {
    try {
      const text = req.body.text;
      const summaryText = await getSummary(text); // Utilize getSummary() function
      console.log("Summary: " + summaryText);
      res.json({ summary: summaryText });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while summarizing the text" });
    }
  });

  http.createServer(app).listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
