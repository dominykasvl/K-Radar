const htmlparser2 = require("htmlparser2-without-node-native");

async function fetchNewsData() {
  const url = "https://www.allkpop.com";

  try {
    console.log("Fetching data...");
    const response = await fetch(url);
    const content = await response.text();

    return new Promise((resolve, reject) => {
      const html = content;
      const handler = new htmlparser2.DomHandler(async (error, dom) => {
        if (error) {
          throw new Error("An error occurred while parsing HTML.");
        } else {
          const articles = htmlparser2.DomUtils.findAll(
            (el) =>
              el.attribs &&
              el.attribs.class &&
              el.attribs.class.split(" ").includes("list"),
            dom,
          );
          const articlesData = articles
            ? articles
                .map((article) => {
                  //return title and link
                  const titleDivs = htmlparser2.DomUtils.findAll(
                    (el) =>
                      el.attribs &&
                      el.attribs.class &&
                      el.attribs.class.split(" ").includes("title"),
                    article.children,
                  );
                  if (titleDivs.length !== 1) return null;
                  const titleElement = htmlparser2.DomUtils.findOne(
                    (el) => el.name === "a",
                    titleDivs[0].children,
                  );
                  const title = titleElement
                    ? htmlparser2.DomUtils.getText(titleElement)
                    : null;
                  const link = titleElement
                    ? url +
                      htmlparser2.DomUtils.getAttributeValue(
                        titleElement,
                        "href",
                      )
                    : null;

                  //return image
                  const imageDivs = htmlparser2.DomUtils.findAll(
                    (el) =>
                      el.attribs &&
                      el.attribs.class &&
                      el.attribs.class.split(" ").includes("image"),
                    article.children,
                  );
                  if (imageDivs.length !== 1) return null;
                  const imageElement = htmlparser2.DomUtils.findOne(
                    (el) => el.name === "img",
                    imageDivs[0].children,
                  );
                  const image = imageElement
                    ? htmlparser2.DomUtils.getAttributeValue(
                        imageElement,
                        "data-src",
                      )
                    : null;

                  //return unix timestamp
                  const timeElement = htmlparser2.DomUtils.findAll(
                    (el) =>
                      el.attribs &&
                      el.attribs.class &&
                      el.attribs.class.split(" ").includes("realtime"),
                    article.children,
                  );
                  if (timeElement.length !== 1) return null;
                  const timestamp = timeElement
                    ? htmlparser2.DomUtils.getAttributeValue(
                        timeElement[0],
                        "data-ts",
                      )
                    : null;

                  //return empty summary
                  const summary = "";

                  if (!title && !image && !timestamp && !link) return null;

                  return { title, image, timestamp, link, summary };
                })
                .filter(Boolean)
            : [];
          resolve(articlesData);
        }
      });

      const parser = new htmlparser2.Parser(handler);
      parser.write(html);
      parser.end();
    });
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}

module.exports = fetchNewsData;
