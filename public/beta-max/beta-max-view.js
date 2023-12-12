var BetaMaxView = React.createClass({
  // getInitialState : function(){
  // 	return {
  // 		false
  // 	};
  // },

  componentDidMount : function(){
    console.log('hiii')
    this.setup();
  },

  setup: function(){
    // document.querySelectorAll('.control-bar')[0].addEventListener('click', function(e){
    // document.querySelectorAll('.control-bar')[0].addEventListener('mousemove', function(e){
    //
    //     clearTimeout(interval)
    //
    //     interval = setInterval(function () {
    //       console.log('hiii')
    //       nativeVid.pause();
    //       nativeVid.currentTime  = 78*(e.clientX/window.innerWidth)
    //       nativeVid.play();
    //     }, 10);
    //     });
    // });
    //


    var vm = this;
	  this.setState({
 			connection : new WebSocket('ws://localhost:4000/'),
      nativeVid : document.querySelectorAll('.native-vid')[0],
      audio : document.querySelectorAll('audio')[0]
 		}, function(){
      vm.playMutedVideo();
 				vm.wsHandles();
      // vm.playAudio();
 				vm.changeNativeVideo('./video/evolution.mp4');
 		}.bind(this));
  },

  wsHandles :function(){
    var vm = this;
    console.log('hello')
    console.log(		vm.state.connection)
    vm.state.connection.onmessage = function (event) {
      console.log('New Media Receive', event);
    }
  },

  playAudio :function(){
    this.state.audio.play();
  },

  changeVideo : function(url){
    this.state.nativeVid.src = url
    this.playMutedVideo();
  },

  playVideo :function(){
    this.state.nativeVid.muted = false;
    this.state.nativeVid.play();
  },

  playMutedVideo :function(){
    this.state.nativeVid.muted = true;
    this.state.nativeVid.play();
  },

  changeNativeVideo : function(url){
    this.state.nativeVid.src = url
    this.playMutedVideo();
  },

  // <iframe className="testing" src="../tetsuo.html"></iframe>
  render: function() {
    return (
      <div>

        <video muted="true" className="native-vid"></video>
        <audio controls="true"></audio>
      </div>
    );
  }
});
//End of Design View

ReactDOM.render(
  <BetaMaxView />,
  document.getElementById('beta-max-view')
);
