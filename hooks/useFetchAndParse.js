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
              const titleDiv = htmlparser2.DomUtils.findOne(el => el.attribs && el.attribs.class && el.attribs.class.split(' ').includes('title'), article.children);
              if (!titleDiv) return null;
              const titleElement = htmlparser2.DomUtils.findOne(el => el.name === 'a', titleDiv.children);
              if (!titleElement) return null;
              const title = htmlparser2.DomUtils.getText(titleElement);
              return title;
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