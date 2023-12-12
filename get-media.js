const mediaFolder = './public/video/';
const fs = require('fs');

fs.readdir(mediaFolder, (err, files) => {
  // let files
  // files.forEach(file => {
  //   console.log(file);
  // });

  var json = JSON.stringify(files);
  var wstream = fs.createWriteStream('./src/json/media.js');
    wstream.write('export default { "media" :');
    wstream.write(json);
    wstream.end('};');
})
