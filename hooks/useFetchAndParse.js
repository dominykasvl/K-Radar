import { useEffect, useState } from 'react';
import htmlparser2 from 'htmlparser2-without-node-native';
import { DomUtils } from 'htmlparser2';

export const useFetchAndParse = (url, corsProxy) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUrl = corsProxy + encodeURIComponent(url);

    fetch(fetchUrl)
      .then(response => response.json())
      .then(content => {
        const html = content.contents;
        const handler = new htmlparser2.DomHandler((error, dom) => {
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

              if (!title && !image && !timestamp && !link) return null;
            
              return { title, image, timestamp, link };
            }).filter(Boolean) : [];
            setData(articlesData);
          }
        });

        const parser = new htmlparser2.Parser(handler);
        parser.write(html);
        parser.end();
      })
      .catch(setError);
  }, [url, corsProxy]);

  return { data, error };
};