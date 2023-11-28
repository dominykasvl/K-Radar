import { useEffect, useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import sha256 from 'crypto-js/sha256';
import storage from '../config/storage';

export const useFetchAndSummarize = (data, apiUrl, corsProxy) => {
  const [errorWithSummaries, setErrorWithSummaries] = useState(null);

  useEffect(() => {
    if (!data) return;

    const fetchData = async () => {
      try {
        const storedSummaries = await storage.getItem('summaries');
        const storedHash = await storage.getItem('summariesHash');
        if (storedSummaries && storedHash && storedHash === sha256(storedSummaries).toString()) {
          const summaries = JSON.parse(storedSummaries);
          data.forEach((item, index) => {
            if (summaries[index]) {
              item.summary = summaries[index];
            }
          });
          return;
        }

        const updatedData = [];
        for (let i = 0; i < data.length; i++) {
          const response = await axios.get(corsProxy + encodeURIComponent(data[i].link));
          const $ = cheerio.load(response.data.contents);
          const articleText = $('#article-content').find('p').text();
          const summaryResponse = await axios.post(apiUrl, { text: articleText });
          updatedData.push(summaryResponse.data.summary);
        }
        data.forEach((item, index) => {
          item.summary = updatedData[index];
        });
        await storage.setItem('summaries', JSON.stringify(updatedData));
        await storage.setItem('summariesHash', sha256(JSON.stringify(updatedData)).toString());
      } catch (err) {
        setErrorWithSummaries(err);
      }
    };

    fetchData();
  }, [data, apiUrl, corsProxy]);

  return { data, errorWithSummaries };
};