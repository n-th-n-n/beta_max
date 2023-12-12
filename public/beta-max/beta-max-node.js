var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var mediaStack = [];
var walk    = require('walk');
// var mediaFiles   = {};
var mediaFiles   = [];

app.use(function (req, res, next) {
  return next();
});

app.get('/get-media', function(req, res) {
  console.log('testing')
  var walker  = walk.walk('./media', { followLinks: false });
  //
  //
  walker.on('file', function(root, stat, next) {
    var name = (root.replace('./media', '')+stat.name)
    mediaFiles.push(name);
    // console.log('test', name)
    // mediaFiles[stat.ino] = root + '/' + stat.name
    next();
  });
  //
  //
  walker.on('end', function() {
    // console.log(mediaFiles)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(mediaFiles)
  });
});


app.get('/user-input', function(req, res) {
  mediaStack.push({
    type: '',
    data : req.originalUrl.replace('/user-input?userInput=', '')
  });
  res.setHeader("Access-Control-Allow-Origin", "*");

  //Response String
  res.send('{"success": "true"}');
});

app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
    ws.send(JSON.stringify(mediaStack.shift()));
  });
});


app.listen(4000);
console.log('now listening 4000')
