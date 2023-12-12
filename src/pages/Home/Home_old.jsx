import React from "react";
import { Route } from "react-router-dom";
import { withRouter } from "react-router";

import media from "../../json/media.js";

import $ from "jquery";

// Components
import Nav from "../../components/Nav/Nav.jsx";

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.drawVideoCanvas = this.drawVideoCanvas.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.setFilter = this.setFilter.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.init = this.init.bind(this);
    this.setupGlue = this.setupGlue.bind(this);
    // this.initEventListeners = this.initEventListeners.bind(this);
    this.seekToTimecode = this.seekToTimecode.bind(this);
    this.seekFrames = this.seekFrames.bind(this);
    this.getDigits = this.getDigits.bind(this);
    this.secondsToTimecode = this.secondsToTimecode.bind(this);
    this.timecodeToSeconds = this.timecodeToSeconds.bind(this);
    this.changeVideo = this.changeVideo.bind(this);
    this.buildMediaPreview = this.buildMediaPreview.bind(this);
    this.videoEnded = this.videoEnded.bind(this);

    this.state = {
      canvasFilters: {},
      updateVideoCurrentTimeCodeInterval: false,
      loadedmetadata: false,
      readyState: false,
      video: false,
      duration: false,
      FPS: false,
      clickCounter: 0,
      thumbnails: [],
      sepia: 0,
      contrast: 100,
      saturate: 100,
      opacity: 100,
    };
  }

  componentDidMount() {
    $(document).ready(() => {
      this.init();
      this.buildMediaPreview();
    });
  }

  buildMediaPreview() {
    const videoArray = media["media"];

    const thumbnails = Object.keys(videoArray).map((i) => {
      const file = media["media"][i];

      return (
        <video
          onClick={this.changeVideo.bind(this, file)}
          className="Home__thumbnail"
        >
          <source src={`./video/${file}#t=5`} type="video/mp4" />
        </video>
      );
    });

    this.setState({
      thumbnails,
    });
  }

  changeVideo(file) {
    this.state.video.src = "./video/" + file;
    this.play();
  }

  init() {
    this.setupGlue();

    $(".Betamax__videoSeeker").mouseup((e) => {
      // $('.Betamax__videoSeeker').mousemove((e)=> {
      // console.log('asdfasdf', e)
      // console.log('asdfasdf', window.innerWidth, e.clientX)

      // console.log(e.clientX/window.innerWidth)

      // 4*60

      this.seekToTimecode();
      // var seekTime = timecodeToSeconds(hh_mm_ss_ff, fps);
      var seekTime = $("video")[0].duration * (e.clientX / window.innerWidth);
      // var str_seekInfo = "video was at: " + this.state.video.currentTime + "<br/>";
      // str_seekInfo += "seeking to (fixed): <b>" + seekTime + "</b><br/>";
      this.state.video.currentTime = seekTime;
      // str_seekInfo += "seek done, got: " + this.state.video.currentTime + "<br/>";
      // $("#seekInfo").html(str_seekInfo);
    });
  }

  setupGlue() {
    const video = document.querySelectorAll(".Home__videoEle")[0];
    video.muted = true;
    video.width = window.innerWidth;
    video.height = window.innerWidth * (9 / 16);

    video.addEventListener("ended", this.videoEnded, false);

    const canvas = document.querySelectorAll(".Home__canvasVideo")[0];
    canvas.width = video.width;
    canvas.height = video.height;
    const ctx = canvas.getContext("2d");

    this.setState(
      {
        canvas,
        ctx,
        video,
      },
      () => {
        this.drawVideoCanvas();
      }
    );
  }

  seekToTimecode(hh_mm_ss_ff, fps) {
    var seekTime = this.state.timecodeToSeconds(hh_mm_ss_ff, fps);
    this.state.video.currentTime = seekTime;
  }

  videoEnded() {
    // this.play();
  }

  seekFrames(nr_of_frames, fps, ele) {
    if (!this.state.video) {
      return;
    }

    nr_of_frames = nr_of_frames * 5;

    this.state.clickCounter++;

    // this.play();

    var currentFrames = this.state.video.currentTime * fps;

    var newPos = (currentFrames + nr_of_frames) / fps;
    newPos = newPos + 0.00001;
    this.state.video.currentTime = newPos; // TELL THE PLAYER TO GO HERE
  }

  getDigits(val) {
    var fullVal = parseFloat(val);
    var newVal = fullVal - Math.floor(parseFloat(fullVal));
    newVal = newVal.toFixed(2);
    return newVal;
  }

  //SMTE Time-code calculation functions
  //=======================================================================================================

  timecodeToSeconds(hh_mm_ss_ff, fps) {
    var tc_array = hh_mm_ss_ff.split(":");
    var tc_hh = parseInt(tc_array[0]);
    var tc_mm = parseInt(tc_array[1]);
    var tc_ss = parseInt(tc_array[2]);
    var tc_ff = parseInt(tc_array[3]);
    var tc_in_seconds = tc_hh * 3600 + tc_mm * 60 + tc_ss + tc_ff / fps;
    return tc_in_seconds;
  }

  secondsToTimecode(time, fps) {
    var hours = Math.floor(time / 3600) % 24;
    var minutes = Math.floor(time / 60) % 60;
    var seconds = Math.floor(time % 60);
    var frames = Math.floor(((time % 1) * fps).toFixed(3));

    var result =
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds) +
      ":" +
      (frames < 10 ? "0" + frames : frames);

    return result;
  }

  drawVideoCanvas() {
    // let canvas = document.getElementById('Home__canvasVideo');
    // let ctx = canvas.getContext('2d');
    // let video = document.getElementById('Home__videoEle');

    // this.drawSin()

    //visuzliat data
    let canvasFilters = this.state.canvasFilterString;

    let deg = 180;
    var c = document.querySelectorAll(".Home__visualizer")[0];
    var ctx = c.getContext("2d");

    c.width = window.innerWidth;
    c.height = window.innerWidth;

    let myLoop = () => {
      this.state.ctx.clearRect(
        0,
        0,
        this.state.canvas.width,
        this.state.canvas.height
      );
      this.state.ctx.filter = this.state.canvasFilterString;
      // this.state.ctx.save();
      this.state.ctx.globalAlpha = Math.round(
        this.state.canvasFilters.opacity * 10
      );
      this.state.ctx.drawImage(
        this.state.video,
        0,
        0,
        this.state.canvas.width,
        this.state.canvas.height
      );
      // this.state.ctx.restore();

      // visualizer
      deg++;
      if (deg === 180) {
        deg = 0;
      }
      // ctx.clearRect(0, 0, c.width, c.height);
      ctx.clearRect(0, 0, c.width, c.height);
      // ctx.stroke();

      // for(let x=0; x<360; x += 20){
      //     ctx.moveTo(x+5,180);
      //     ctx.lineTo(x,180);
      // }
      // ctx.moveTo(0,180);

      ctx.beginPath();

      for (let x = 0; x <= c.width; x += 1) {
        let y =
          this.state.video.height / 2 -
          Math.sin(((x + deg) * Math.PI) / 180) * 120;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#ccc";
      ctx.stroke();
    };
    this.state.video.addEventListener("play", myLoop);
    this.play();
  }

  play() {
    var video = document.querySelectorAll(".Home__videoEle")[0];
    video.play();
    // console.log('busted')
  }

  pause() {
    var video = document.querySelectorAll(".Home__videoEle")[0];
    video.pause();
  }

  setFilter() {
    let canvasFilterString = "";

    Object.entries(this.state.canvasFilters).forEach((entry) => {
      let key = entry[0];
      let value = entry[1];

      canvasFilterString += `${key}(${value / 100}) `;
    });
    console.log(canvasFilterString);

    this.setState(
      {
        canvasFilterString,
        // });
      },
      () => {
        this.drawVideoCanvas();
      }
    );
  }

  clearFilter() {
    this.setState({
      canvasFilterString: "",
    });
  }

  handleChange(e) {
    const value = e.target.value;
    const canvasFilters = this.state.canvasFilters;
    canvasFilters[e.target.id] = value;
    this.setState(
      {
        [e.target.id]: value,
        canvasFilters,
      },
      () => {
        this.setFilter();
      }
    );
  }

  render() {
    //
    // <Nav />
    return (
      <div className="Home">
        <img
          className="Home__logo"
          src={require("../../svg/beta-max-logo.svg")}
          alt=""
        />

        <canvas className="Home__visualizer" />
        <canvas className="Home__canvasVideo" />
        <video className="Home__videoEle">
          <source src={"./video/growth.mp4"} type="video/mp4" />
        </video>

        <div className="Home__wrapButtons">
          <div className="Home__mediaGallery">{this.state.thumbnails}</div>

          <div className="Home__videoCtrls">
            <div onClick={this.play}>play</div>
            <div onClick={this.pause}>||</div>
            <div onClick={this.seekFrames.bind(this, -1, 29.97)}>back</div>

            <div onClick={this.seekFrames.bind(this, 1, 29.97)}>forward</div>
            <div class="Betamax__videoSeeker"></div>
          </div>

          <div className="Home__filterCtrls">
            <label for="sepia">sepia</label>
            <input
              type="range"
              id="sepia"
              name="sepia"
              min="0"
              max="100"
              step="1"
              value={this.state.sepia}
              onChange={this.handleChange}
            />
            <label for="contrast">contrast</label>
            <input
              type="range"
              id="contrast"
              name="contrast"
              min="0"
              max="100"
              step="1"
              value={this.state.contrast}
              onChange={this.handleChange}
            />
            <label for="saturate">saturate</label>
            <input
              type="range"
              id="saturate"
              name="saturate"
              min="0"
              max="100"
              step="1"
              value={this.state.saturate}
              onChange={this.handleChange}
            />
            <label for="opacity">visualizer fade</label>
            <input
              type="range"
              id="opacity"
              name="opacity"
              min="0"
              max="100"
              step="1"
              value={this.state.opacity}
              onChange={this.handleChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
