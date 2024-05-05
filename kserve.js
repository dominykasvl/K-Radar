const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const port = 3000;

const fetchNewsData = require("./K-Serve-functions/News.js");
const fetchExtraData = require("./K-Serve-functions/ExtraData.js");

app.use(cors()); // Enable All CORS Requests
app.use(express.json()); // for parsing application/json

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Vilnius",
  });
  console.log(`[${timestamp}] New ${req.method} request to ${req.path}`);
  next();
});

app.get("/topStories", async (req, res) => {
  try {
    //Cache the data for testing purposes as to not stress 3rd party website with needless requests.
    // if (data) {
    //   console.log("Got cached data. Sending it instead. Sending...");
    //   res.json(data);
    // } else {
    const response = await fetchNewsData();
    if (response) {
      console.log("Got defined data response. Saving to temporary memory.");
      data = response;
      if (data) {
        const responseWithExtras = await fetchExtraData(data);
        if (responseWithExtras) {
          console.log(
            "Got defined summary response. Saving to temporary memory.",
          );
          data = responseWithExtras;
          console.log("Data cached. Sending it...");
          res.json(data);
          console.log("Data sent.");
        } else throw new Error("No data found");
      } else throw new Error("No data found");
    } else throw new Error("No data found");
    // }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the top stories" });
  }
});

http.createServer(app).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
