import { useEffect, useState } from "react";
import sha256 from "crypto-js/sha256";
import storage from "../config/storage";

export const useFetchAndParse = (url, corsProxy, refreshKey, setData) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUrl = url + "/topStories";

    const getData = async () => {
      try {
        // const storedData = await storage.getItem("data");
        // const storedHash = await storage.getItem("dataHash");
        // const parsedData = storedData ? JSON.parse(storedData) : null;
        // const currentHash = sha256(JSON.stringify(parsedData)).toString();

        // if (storedHash === currentHash && parsedData) {
        //   setData(parsedData);
        //   return;
        // }

        fetch(fetchUrl)
          .then((response) => response.json())
          .then(async (content) => {
            setData(content);
            await storage.setItem("data", JSON.stringify(content));
            await storage.setItem(
              "dataHash",
              sha256(JSON.stringify(content)).toString(),
            );
          })
          .catch(setError);
      } catch (e) {
        setError(e);
      }
    };

    getData();
  }, [url, corsProxy, refreshKey]);

  return { error };
};
