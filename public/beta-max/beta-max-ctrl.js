var BetaMaxCtrl = React.createClass({
  getInitialState : function(){
    return {
      connection : new WebSocket('ws://localhost:4000/'),
      modalDisplay : 'hide'
    };
  },

  componentDidMount : function(){
    this.ajaxRequest('http://localhost:4000/get-media', 'GET', this.processMediaList);
  },

  ajaxRequest: function(url, requestType, callback) {
    var request = new XMLHttpRequest();
    request.open(requestType, url, true);

    request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
		    callback(JSON.parse(request.responseText));
		  } else {

		    // We reached our target server, but it returned an error
		  }
    };

    request.onerror = function() {
		  // There was a connection error of some sort
      console.log('asdfasdf', request)
    };

    request.send();
  },

  processMediaList : function(data){
    var mediaTypes
    data.forEach(function(d, i){
      data[i] = d.split('/');
      data[i].shift();
    });

    var fileHTML = data.map((d) =>
      <div className='media-entry'>{this.folderHTML(d)}</div>
    );

    this.setState({
      fileHTML : fileHTML,
      searchDisplay : 'search-view'
    })

    this.playMedia()
  },

  folderHTML : function(data){
    var folderHTML = [];
    var vm = this;

    data.forEach(function(d, i){
      if(data.length-1 === i){
        folderHTML.push(<div className='file'>{d} <span onClick={vm.playMedia}>play</span></div>)
      } else{
        folderHTML.push(<div className='folder'>{d}</div>)
      }
    });

    return folderHTML;
  },

  playMedia : function(obj){
    var modalHTML = [
      <div>
        <div className="modal-btn" onClick={this.queueMedia} >Queue</div>
        <div className="modal-btn" onClick={this.playNow}>Play Now</div>
        <div className="modal-btn" onClick={this.closeModal}>Cancel</div>
      </div>
    ];

    this.setState({
      selectedMedia : obj,
      modalDisplay : '',
      modalHTML : modalHTML
    });
  },

  closeModal: function(){
    this.setState({
      modalDisplay : 'hide',
      modalHTML : ''
    });
  },

  submitInput : function(data){
    this.ajaxRequest('http://localhost:4000/user-input?user-input='+document.querySelectorAll('.input-field')[0].value, 'GET', this.sendWSMsg);
  },

  sendWSMsg : function(data){
	  this.state.connection.send('Media Upload Confirmed');
  },

  wsHandles :function(){

  },

  render: function() {
    return (
      <div>
        <img className={this.state.searchDisplay+' beta-logo'} src='./beta-max-logo.svg' />
        <p className={this.state.searchDisplay+' title'}>beta max</p>
        <div  className={this.state.searchDisplay+' seach-container'}>
          <input placeholder='search' className={this.state.searchDisplay+' input-field'}/>
          <button onClick={this.submitInput} className={this.state.searchDisplay+' submit'}>submit</button>
        </div>
        {this.state.fileHTML}
        <div className={this.state.modalDisplay+" modal-container"}>{this.state.modalHTML}</div>
      </div>
    );
  }
});
//End of Design View



ReactDOM.render(
  <BetaMaxCtrl />,
  document.getElementById('beta-max-ctrl')
);
