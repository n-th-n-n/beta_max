import React from 'react';
import {
  Route
} from 'react-router-dom';
import { withRouter } from 'react-router';


import $ from 'jquery';


class Home extends React.Component {
  constructor(props) {
    super(props);

    this.drawCanvas = this.drawCanvas.bind(this);
    this.numberLoop = this.numberLoop.bind(this);

    this.state = {
      number : 0,
      // x : 0,
      y: 0,
    };
  }

  componentDidMount(){
    // $(document).ready(() => {
    // 	this.init();
    // });
      console.log('hii')
     window.addEventListener('load', () => {
      const canvas = document.querySelectorAll('.Number__canvas')[0];
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
       this.setState({
       canvas,
       ctx: canvas.getContext('2d')
       }, () => {
         this.drawCanvas();
       });
   });
     // }, )});

  }

  drawCanvas() {

    // setInterval(this.numberLoop, 50)
    this.numberLoop();

  }

  numberLoop(){
    let number = this.state.number;
    let y = this.state.y;


    this.state.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
    y+= 10;
    for(let x=2; x<=this.state.canvas.width; x+= 12){
    for(let y=2; y<=this.state.canvas.height; y+= 12){
      // console.log('hi', x)

        this.state.ctx.font = "10px Arial";
        this.state.ctx.fillStyle = 'white';
        this.state.ctx.fillText(Math.floor(Math.random()*10), x, y);
    }
    }

    number++

    if(number === 10){
      number = 0;
    }
    // if(y > this.state.canvas.width){
    //   y = 0;
    // }
    // console.log(number)
    this.setState({
      number,
      // y,
    }, ()=>{
      // if(number === 1){
      setTimeout(this.numberLoop, 250)
    // }
    })
  }

  fallingNumberLoop(){
    let number = this.state.number;
    let y = this.state.y;


    this.state.ctx.clearRect(0, y-20, this.state.canvas.width, y);
    y+= 10;
    for(let x=0; x<=640; x+= 10){
      // console.log('hi', x)

        this.state.ctx.font = "10px Arial";
        this.state.ctx.fillStyle = 'white';
        this.state.ctx.fillText(this.state.number, x, y);
    }

    number++

    if(number === 10){
      number = 0;
    }
    if(y > this.state.canvas.width){
      y = 0;
    }
    console.log(number)
    this.setState({
      number,
      y,
    }, ()=>{
      // if(number === 1){
      setTimeout(this.numberLoop, 20)
    // }
    })
  }

  render() {
    return (
      <div className="Number">
        <canvas className="Number__canvas" width="900" height="600"/>

        <div className="Number__shadow1"/>
        <div className="Number__shadow2"/>
      </div>
    );
  }
};

export default withRouter(Home);
