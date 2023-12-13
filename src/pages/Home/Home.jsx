import React, { useState, useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";
import media from "../../json/media.js";
import $ from "jquery";

import Nav from "../../components/Nav/Nav.jsx";

const Home = () => {
  const [canvasFilters, setCanvasFilters] = useState({
    sepia: 0,
    contrast: 100,
    saturate: 100,
    opacity: 100,
  });
  const [videoFilter, setVideoFilter] = useState(
    '"grayscale(0.75) blur(3px) contrast(1.2)"'
  );

  const [
    updateVideoCurrentTimeCodeInterval,
    setUpdateVideoCurrentTimeCodeInterval,
  ] = useState(false);
  const [loadedmetadata, setLoadedmetadata] = useState(false);
  const [readyState, setReadyState] = useState(false);
  const [video, setVideo] = useState(false);
  const [duration, setDuration] = useState(false);
  const [FPS, setFPS] = useState(false);
  const [clickCounter, setClickCounter] = useState(0);
  const [thumbnails, setThumbnails] = useState([]);

  const canvasRef = useRef();
  const ctxRef = useRef();
  const videoRef = useRef();

  const [conn, setConn] = useState(new WebSocket("ws://localhost:9000/"));

  // const conn = ;

  useEffect(() => {
    setupGlue();
    buildMediaPreview();

    conn.onopen = () =>
      conn.send(JSON.stringify({ type: "sendQueue", data: [] }));
    // conn.send(JSON.stringify({ type: "sendQueue", data: queueVideos }));

    conn.onmessage = (e) => {
      console.log(e);
    };

    return () => {
      // Cleanup or componentWillUnmount logic here
    };
  }, []); // Empty dependency array means this effect will run once after the initial render

  const buildMediaPreview = () => {
    const videoArray = media["media"];
    const thumbnails = Object.keys(videoArray).map((i) => {
      const file = media["media"][i];
      return (
        <video
          key={i}
          onClick={() => changeVideo(file)}
          className="Home__thumbnail"
        >
          <source src={`./video/${file}#t=5`} type="video/mp4" />
        </video>
      );
    });
    setThumbnails(thumbnails);
  };

  const throttleSearchYoutube = (e) => {
    console.log(e.target.value);
    // let searchThrottle; // needs to be more globally accessible
    // clearTimeout(searchThrottle);
    // const searchThrottle = setTimeout((e) => {
    const conn = new WebSocket("ws://localhost:9000/");

    conn.onmessage = (e) => {
      const thumbnails = JSON.parse(e.data).map((videoData) => {
        return (
          <img
            src={videoData.thumbnail}
            // onClick={() => changeVideo(file)}
            className="Home__thumbnail"
          />
        );
      });

      console.log(thumbnails);
      setThumbnails(thumbnails);
    };

    const options = JSON.stringify({
      type: "youtubeSearch",
      searchTerm: e.target.value,
    });

    conn.onopen = () => conn.send(options);
    // }, 500);
  };

  const startYoutubeDl = (videoData) => {
    const conn = new WebSocket("ws://localhost:9000/");
    const options = JSON.stringify({
      type: "youtubeDL",
      videoData,
    });
    conn.onopen = () => conn.send(options);
  };

  const changeVideo = (file) => {
    videoRef.current.src = `./video/${file}`;
    play();
  };

  const setupGlue = () => {
    const video = videoRef.current;
    video.muted = true;
    video.width = window.innerWidth;
    video.height = window.innerWidth * (9 / 16);

    video.addEventListener("ended", videoEnded, false);

    const canvas = canvasRef.current;
    canvas.width = video.width;
    canvas.height = video.height;
    const ctx = canvas.getContext("2d");

    ctxRef.current = ctx;
    setVideo(video);
    setReadyState(true);

    drawVideoCanvas();
    // video.addEventListener("loadedmetadata", function () {
    //   // Access the duration of the video
    //   var videoDuration = video.duration;
    //   console.log("Video duration: " + videoDuration + " seconds");
    //   setLoadedmetadata(videoDuration);
    // });

    $(".Betamax__videoSeeker1").mousemove((e) => {
      const seekTime =
        videoRef.current.duration * (e.clientX / window.innerWidth);
      videoRef.current.currentTime = seekTime;
      videoRef.current.pause;
    });
  };
  const seekFrames = (nr_of_frames, fps, pause) => {
    if (!videoRef.current) {
      return;
    }

    if (pause) {
      videoRef.current.pause();
    }

    nr_of_frames = nr_of_frames * 5;

    setClickCounter((prevClickCounter) => prevClickCounter + 1);

    const currentFrames = videoRef.current.currentTime * fps;

    let newPos = (currentFrames + nr_of_frames) / fps;
    newPos = newPos + 0.00001;
    videoRef.current.currentTime = newPos; // TELL THE PLAYER TO GO HERE
  };

  const getDigits = (val) => {
    var fullVal = parseFloat(val);
    var newVal = fullVal - Math.floor(parseFloat(fullVal));
    newVal = newVal.toFixed(2);
    return newVal;
  };

  const timecodeToSeconds = (hh_mm_ss_ff, fps) => {
    var tc_array = hh_mm_ss_ff.split(":");
    var tc_hh = parseInt(tc_array[0]);
    var tc_mm = parseInt(tc_array[1]);
    var tc_ss = parseInt(tc_array[2]);
    var tc_ff = parseInt(tc_array[3]);
    var tc_in_seconds = tc_hh * 3600 + tc_mm * 60 + tc_ss + tc_ff / fps;
    return tc_in_seconds;
  };

  const seekToTimecode = (hh_mm_ss_ff, fps) => {
    // const seekTime = timecodeToSeconds(hh_mm_ss_ff, fps);
    // videoRef.current.currentTime = seekTime;
  };

  const videoEnded = () => {
    play();
  };

  const drawVideoCanvas = () => {
    let deg = 180;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");

    c.width = window.innerWidth;
    c.height = window.innerWidth;

    const myLoop = () => {
      //   ctxRef.current.clearRect(0, 0, c.width, c.height);
      ctxRef.current.filter = "grayscale(50%)";

      ctxRef.current.globalAlpha = Math.round(canvasFilters.opacity * 10);
      ctxRef.current.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      // Visualizer
      deg++;
      if (deg === 180) {
        deg = 0;
      }

      //   ctx.clearRect(0, 0, c.width, c.height);

      ctx.beginPath();

      //   for (let x = 0; x <= c.width; x += 1) {
      //     let y =
      //       videoRef.current.height / 2 -
      //       Math.sin(((x + deg) * Math.PI) / 180) * 120;
      //     ctx.lineTo(x, y);
      //   }

      ctx.strokeStyle = "#ccc";
      ctx.stroke();
    };

    videoRef.current.addEventListener("play", myLoop);
    play();
  };

  const play = () => {
    console.log(videoRef.current);
    videoRef.current.play();
  };

  const pause = () => {
    videoRef.current.pause();
  };
  const mute = () => {
    console.log(videoRef.current.muted);
    videoRef.current.muted = !videoRef.current.muted;
  };

  const setFilter = () => {
    let canvasFilterString = "";

    Object.entries(canvasFilters).forEach((entry) => {
      const [key, value] = entry;
      canvasFilterString += `${key}(${value / 100}) `;
    });

    setCanvasFilters(canvasFilterString);
    drawVideoCanvas();
  };

  const clearFilter = () => {
    setCanvasFilters("");
  };

  const handleChange = (e) => {
    const value = e.target.value;
    const updatedCanvasFilters = { ...canvasFilters, [e.target.id]: value };

    function generateFilterString(filters) {
      const filterArray = Object.entries(filters).map(([key, value]) => {
        return `${key}(${typeof value === "number" ? value : value + "%"})`;
      });

      return filterArray.join(" ");
    }
    console.log(generateFilterString(updatedCanvasFilters));
    setVideoFilter(generateFilterString(updatedCanvasFilters));
    setCanvasFilters(updatedCanvasFilters);
    drawVideoCanvas();
  };

  return (
    <div style={{ background: "#000" }} className="Home">
      <img
        className="Home__logo"
        src={require("../../svg/beta-max-logo.svg")}
        alt=""
      />

      <canvas
        style={{
          display: "none",
          //   width: "100%",
          //   height: "100%",
        }}
        ref={canvasRef}
      />
      <video
        style={{
          filter: videoFilter,

          //   display: "none",
          //   width: "100%",
          //   height: "100%",
        }}
        ref={videoRef}
      >
        <source src={"./video/animation1.mp4"} type="video/mp4" />
      </video>

      <div className="Home__wrapButtons">
        <div className="Home__mediaGallery">{thumbnails}</div>

        <div
          className="Home__videoCtrls"
          style={{
            position: "fixed",
            left: 0,
            bottom: 0,
          }}
        >
          <input onChange={throttleSearchYoutube}></input>
          <div onClick={play}>play</div>
          <div onClick={pause}>||</div>
          <div onClick={mute}>mute</div>
          <div onClick={() => seekFrames(-1, 29.97, true)}>back</div>
          <div onClick={() => seekFrames(1, 29.97, true)}>forward</div>
        </div>
        <div
          style={{
            display: "block",
            width: "100%",
            height: "50px",
            background: "#fff",
          }}
          className="Betamax__videoSeeker1"
        ></div>

        <div className="Home__filterCtrls">
          <label htmlFor="sepia">sepia</label>
          <input
            type="range"
            id="sepia"
            name="sepia"
            min="0"
            max="100"
            step="1"
            value={canvasFilters.sepia}
            onChange={handleChange}
          />
          <label htmlFor="contrast">contrast</label>
          <input
            type="range"
            id="contrast"
            name="contrast"
            min="0"
            max="100"
            step="1"
            value={canvasFilters.contrast}
            onChange={handleChange}
          />
          <label htmlFor="saturate">saturate</label>
          <input
            type="range"
            id="saturate"
            name="saturate"
            min="0"
            max="100"
            step="1"
            value={canvasFilters.saturate}
            onChange={handleChange}
          />
          <label htmlFor="opacity">visualizer fade</label>
          <input
            type="range"
            id="opacity"
            name="opacity"
            min="0"
            max="100"
            step="1"
            value={canvasFilters.opacity}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default withRouter(Home);
