const axios = require("axios");
const cheerio = require("cheerio");

async function fetchNewsData() {
  const url = "https://www.allkpop.com";

  try {
    console.log("Fetching data...");
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articlesData = [];

    $(".list").each(function () {
      const titleElement = $(this).find(".title a");
      const title = titleElement.text().trim();
      const link = titleElement.attr("href")
        ? url + titleElement.attr("href")
        : null;

      const imageElement = $(this).find(".image img");
      const image = imageElement.attr("data-src")
        ? imageElement.attr("data-src")
        : null;

      const timeElement = $(this).find(".realtime");
      const timestamp = timeElement.attr("data-ts")
        ? timeElement.attr("data-ts")
        : null;

      const summary = ""; // Assuming summary is empty as per original logic

      // Only add to array if all necessary data is present
      if (title && link && image && timestamp) {
        articlesData.push({ title, link, image, timestamp, summary });
      }
    });

    return articlesData;
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    return []; // Return an empty array in case of error
  }
}

module.exports = fetchNewsData;
