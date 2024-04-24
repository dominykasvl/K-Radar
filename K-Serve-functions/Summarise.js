const axios = require("axios");
const cheerio = require("cheerio");
const summary = require("../summarizer/driver");

function summarizeWithTextRan(text) {
  console.warn("Using TextRan text summarizer");
  return summary(text);
}

function summarizeText(text) {
  console.warn("Using text summarizer");
  // Split the text into sentences
  let sentences = text.split(". ");

  // Calculate the frequency of each word
  let frequencies = {};
  for (let sentence of sentences) {
    let words = sentence.split(" ");
    for (let word of words) {
      if (word in frequencies) {
        frequencies[word]++;
      } else {
        frequencies[word] = 1;
      }
    }
  }

  // Sort the sentences by the sum of the frequencies of their words
  sentences.sort((a, b) => {
    let frequencyA = a
      .split(" ")
      .reduce((sum, word) => sum + (frequencies[word] || 0), 0);
    let frequencyB = b
      .split(" ")
      .reduce((sum, word) => sum + (frequencies[word] || 0), 0);
    return frequencyB - frequencyA;
  });

  // Return the first sentence as the summary
  return sentences[0];
}

async function useFetchAndSummarize(data) {
  if (!data || (data.length > 0 && data[0].summary)) return;

  const updatedData = [...data]; // Create a copy of data

  try {
    console.log("Fetching summaries and higher def thumbnails...");
    await Promise.all(
      data.map(async (item, i) => {
        const response = await axios.get(item.link);
        const $ = cheerio.load(response.data);
        const articleText = $("#article-content")
          .find("p")
          .map((index, element) => $(element).text().trim())
          .get()
          .join(" ");
        const summaryResponse = summarizeText(articleText);
        console.log("summaryResponse:", summaryResponse);

        const articleThumbnail = $("#article-content")
          .find("img")
          .filter((index, element) => {
            const src = $(element).attr("src");
            return src.includes("upload") && src.includes("content");
          })
          .map((index, element) => $(element).attr("src"))
          .get()[0];
        console.log("articleThumbnail:", articleThumbnail);

        if (typeof summaryResponse === "string") {
          updatedData[i].summary = summaryResponse;
        }
        updatedData[i].image =
          articleThumbnail !== undefined
            ? url + articleThumbnail
            : updatedData[i].image;
      }),
    );
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }

  return updatedData;
}

module.exports = useFetchAndSummarize;
