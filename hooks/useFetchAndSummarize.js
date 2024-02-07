import { useEffect, useState } from "react";
import axios from "axios";
import cheerio from "cheerio";
import sha256 from "crypto-js/sha256";
import storage from "../config/storage";

export const useFetchAndSummarize = (
  data,
  apiUrl,
  corsProxy,
  refreshKey,
  setData,
  url,
) => {
  const [errorWithSummaries, setErrorWithSummaries] = useState(null);

  function summarizeText(text) {
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

  useEffect(() => {
    if (!data || (data.length > 0 && data[0].summary)) return;

    const fetchData = async () => {
      try {
        const storedSummaries = await storage.getItem("summaries");
        const storedHash = await storage.getItem("summariesHash");
        const storedImages = await storage.getItem("images");
        const storedImagesHash = await storage.getItem("imagesHash");
        if (
          storedSummaries &&
          storedHash &&
          storedHash === sha256(storedSummaries).toString() &&
          storedImages &&
          storedImagesHash &&
          storedImagesHash === sha256(storedImages).toString()
        ) {
          const summaries = JSON.parse(storedSummaries);
          const images = JSON.parse(storedImages);
          const updatedData = data.map((item, index) => ({
            ...item,
            summary: summaries[index],
            image: images[index],
          }));

          setData(updatedData);
          return;
        }

        const updatedData = [...data]; // Create a copy of data
        for (let i = 0; i < updatedData.length; i++) {
          const response = await axios.get(data[i].link);
          const $ = cheerio.load(response.data);
          const articleText = $("#article-content")
            .find("p")
            .map((index, element) => $(element).text().trim())
            .get()
            .join(" ");
          const summaryResponse = await axios.post(apiUrl, {
            text: articleText,
          });
          //const summaryResponse = summarizeText(articleText);
          //updatedData.push(summaryResponse.data.summary);

          const articleThumbnail = $("#article-content")
            .find("img")
            .filter((index, element) => {
              const src = $(element).attr("src");
              return src.includes("upload") && src.includes("content");
            })
            .map((index, element) => $(element).attr("src"))
            .get()[0];
          console.log("articleThumbnail:", articleThumbnail);

          updatedData[i].summary = summaryResponse;
          updatedData[i].image =
            articleThumbnail !== undefined
              ? url + articleThumbnail
              : updatedData[i].image;
        }
        setData(updatedData);
        await storage.setItem(
          "summaries",
          JSON.stringify(updatedData.map((item) => item.summary)),
        );
        await storage.setItem(
          "summariesHash",
          sha256(
            JSON.stringify(updatedData.map((item) => item.summary)),
          ).toString(),
        );
        await storage.setItem(
          "images",
          JSON.stringify(updatedData.map((item) => item.image)),
        );
        await storage.setItem(
          "imagesHash",
          sha256(
            JSON.stringify(updatedData.map((item) => item.image)),
          ).toString(),
        );
      } catch (err) {
        setErrorWithSummaries(err);
      }
    };

    fetchData();
  }, [data, apiUrl, corsProxy, refreshKey]);

  return { errorWithSummaries };
};
