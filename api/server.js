var express = require("express");
var expressWs = require("express-ws");
var expressWs = expressWs(express());
var app = expressWs.app;
const yts = require("yt-search");

app.use(express.static("public"));

var aWss = expressWs.getWss("/");

const fs = require("fs");
const ytdl = require("ytdl-core");

//requiring path and fs modules
const path = require("path");
const dirPath = "../public/video/";
fs.mkdirSync(dirPath, { recursive: true });
const directoryPath = path.join(__dirname, dirPath);

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

function sendQueue(videos) {
  aWss.clients.forEach(function (client) {
    client.send(JSON.stringify({ type: "queueUpdate", videos }));
  });
}
function pushFilterData(filterData) {
  aWss.clients.forEach(function (client) {
    client.send(JSON.stringify({ type: "filterUpdate", filterData }));
  });
}
function getAllVideos(ws) {
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    // console.log(files)
    //listing all files using forEach
    const videos = [];
    files.forEach(function (file) {
      if (file.indexOf(".json") !== -1) {
        videos.push(JSON.parse(fs.readFileSync(dirPath + file, "utf8")));
      }
    });

    aWss.clients.forEach(function (client) {
      client.send(JSON.stringify({ type: "allLocalVideos", videos }));
    });
  });
}

function handleYoutubeSearch(searchTerm, ws) {
  console.log(searchTerm);
  yts(searchTerm, function (err, r) {
    if (err || !r) {
      return;
    }
    const videos = r.videos;
    const playlists = r.playlists || r.lists;
    const channels = r.channels || r.accounts;

    console.log(videos);

    ws.send(JSON.stringify(videos));
  });
}
async function handleYoutubeDownload(videoData, ws) {
  console.log("download here", videoData.url);

  // Start the download
  const stream = ytdl(videoData.url, {
    filter: (format) => format.container === "mp4",
  }).pipe(fs.createWriteStream(`../public/video/${Math.random()}.mp4`));

  // Events
  stream.on("info", ({ ...data }) => {
    // this works
    // console.log('data', data);
  });
  stream.on("closed", ({ ...data }) => {
    console.log("closed");
  });
  stream.on("end", ({ ...data }) => {
    console.log("end");
  });
  stream.on("finished", ({ ...data }) => {
    console.log("finished");
  });

  // Update the queue/JSON
  const videoData1 = {
    id: "asdf123",
  };
  fs.writeFile(
    "../media/" + "media" + ".json",
    JSON.stringify(videoData1),
    "utf8",
    (err) => {
      // console.log(err);
    }
  );

  // Send the data-back to earth
  const videos = getAllVideos(ws);
  // console.log(videos)
  aWss.clients.forEach(function (client) {
    // console.log(client)
    client.send("Finished download");
  });
}

app.ws("/", function (ws, req) {
  ws.onmessage = function (msg) {
    console.log("Messaged Received", msg.data);

    const message = JSON.parse(msg.data);

    if (message.type === "youtubeDL") {
      handleYoutubeDownload(message.videoData, ws);
    } else if (message.type === "youtubeSearch") {
      handleYoutubeSearch(message.searchTerm, ws);
    } else if (message.type === "localVideoList") {
      getAllVideos(ws);
    } else if (message.type === "filters") {
      pushFilterData(message.data);
    } else if (message.type === "sendQueue") {
      sendQueue(message.data);
    }
  };
});
app.listen(9000);
