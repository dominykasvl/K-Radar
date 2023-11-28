import { useEffect, useState } from 'react';
import htmlparser2 from 'htmlparser2-without-node-native';
import sha256 from 'crypto-js/sha256';
import storage from '../config/storage';

export const useFetchAndParse = (url, corsProxy) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUrl = corsProxy + encodeURIComponent(url);

    const getData = async () => {
      try {
        const storedData = await storage.getItem('data');
        const storedHash = await storage.getItem('dataHash');
        const parsedData = storedData ? JSON.parse(storedData) : null;
        const currentHash = sha256(JSON.stringify(parsedData)).toString();

        if (storedHash === currentHash && parsedData) {
          setData(parsedData);
          return;
        }

        fetch(fetchUrl)
          .then(response => response.json())
          .then(content => {
            const html = content.contents;
            const handler = new htmlparser2.DomHandler(async (error, dom) => {
              if (error) {
                setError('An error occurred while parsing HTML.');
              } else {
                const articles = htmlparser2.DomUtils.findAll(el => el.attribs && el.attribs.class && el.attribs.class.split(' ').includes('list'), dom);
                const articlesData = articles ? articles.map(article => {
                  //return title and link
                  const titleDivs = htmlparser2.DomUtils.findAll(el => el.attribs && el.attribs.class && el.attribs.class.split(' ').includes('title'), article.children);
                  if (titleDivs.length !== 1) return null;
                  const titleElement = htmlparser2.DomUtils.findOne(el => el.name === 'a', titleDivs[0].children);
                  const title = titleElement ? htmlparser2.DomUtils.getText(titleElement) : null;
                  const link = titleElement ? url + htmlparser2.DomUtils.getAttributeValue(titleElement, 'href') : null;
                
                  //return image
                  const imageDivs = htmlparser2.DomUtils.findAll(el => el.attribs && el.attribs.class && el.attribs.class.split(' ').includes('image'), article.children);
                  if (imageDivs.length !== 1) return null;
                  const imageElement = htmlparser2.DomUtils.findOne(el => el.name === 'img', imageDivs[0].children);
                  const image = imageElement ? htmlparser2.DomUtils.getAttributeValue(imageElement, 'data-src') : null;
                
                  //return unix timestamp
                  const timeElement = htmlparser2.DomUtils.findAll(el => el.attribs && el.attribs.class && el.attribs.class.split(' ').includes('realtime'), article.children);
                  if (timeElement.length !== 1) return null;
                  const timestamp = timeElement ? htmlparser2.DomUtils.getAttributeValue(timeElement[0], 'data-ts') : null;

                  //return empty summary
                  const summary = "";
                  
                  if (!title && !image && !timestamp && !link) return null;
                
                  return { title, image, timestamp, link, summary };
                }).filter(Boolean) : [];
                setData(articlesData);
                await storage.setItem('data', JSON.stringify(articlesData));
                await storage.setItem('dataHash', sha256(JSON.stringify(articlesData)).toString());
              }
            });

            const parser = new htmlparser2.Parser(handler);
            parser.write(html);
            parser.end();
          })
          .catch(setError);
      } catch (e) {
        setError(e);
      }
    };

    getData();
  }, [url, corsProxy]);

  return { data, error };
};