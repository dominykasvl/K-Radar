import { useEffect, useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import sha256 from 'crypto-js/sha256';
import storage from '../config/storage';

export const useFetchAndSummarize = (data, apiUrl, corsProxy, refreshKey, setData) => {
  const [errorWithSummaries, setErrorWithSummaries] = useState(null);

  function summarizeText(text) {
    // Split the text into sentences
    let sentences = text.split('. ');

    // Calculate the frequency of each word
    let frequencies = {};
    for (let sentence of sentences) {
        let words = sentence.split(' ');
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
        let frequencyA = a.split(' ').reduce((sum, word) => sum + (frequencies[word] || 0), 0);
        let frequencyB = b.split(' ').reduce((sum, word) => sum + (frequencies[word] || 0), 0);
        return frequencyB - frequencyA;
    });
    
    // Return the first sentence as the summary
    return sentences[0];
}

useEffect(() => {
  if (!data || (data.length > 0 && data[0].summary)) return;

  const fetchData = async () => {
    try {
      const storedSummaries = await storage.getItem('summaries');
      const storedHash = await storage.getItem('summariesHash');
      if (storedSummaries && storedHash && storedHash === sha256(storedSummaries).toString()) {
        const summaries = JSON.parse(storedSummaries);
        const updatedData = data.map((item, index) => ({ ...item, summary: summaries[index] }));
        setData(updatedData);
        return;
      }

      const updatedData = [...data]; // Create a copy of data
      for (let i = 0; i < updatedData.length; i++) {
          const response = await axios.get(corsProxy + encodeURIComponent(data[i].link));
          const $ = cheerio.load(response.data.contents);
          const articleText = $('#article-content').find('p').map((index, element) => $(element).text().trim()).get().join(' ');
          //const summaryResponse = await axios.post(apiUrl, { text: articleText });
          const summaryResponse = summarizeText(articleText);
          //updatedData.push(summaryResponse.data.summary);
          updatedData[i].summary = summaryResponse;
        }
        setData(updatedData);
        await storage.setItem('summaries', JSON.stringify(updatedData.map(item => item.summary)));
        await storage.setItem('summariesHash', sha256(JSON.stringify(updatedData.map(item => item.summary))).toString());
      } catch (err) {
        setErrorWithSummaries(err);
      }
    };

    fetchData();
  }, [data, apiUrl, corsProxy, refreshKey]);

  return { errorWithSummaries };
};