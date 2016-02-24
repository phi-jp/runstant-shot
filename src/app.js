/*
 * app.js
 */

var express = require('express');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var crc = require('crc');
var webshot = require('webshot');
var Nightmare = require('nightmare');
var nightmare = null;
var shot = require('./lib/shot.js');
var app = express();

var phantomPath = (function() {
  var p = require('slimerjs').path;
  if (process.env.PORT) {
    return 'xvfb-run --server-args="-screen 0 1024x768x24" ' + p;
  }
  else {
    return p;
  }
})();

// aws
var AWS = require('aws-sdk');
// local
if (process.env.PORT) {
  AWS.config.update({
    // region: 'Tokyo',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
}
else {
  AWS.config.loadFromPath(path.join(__dirname, 'credentials.json'));
}
var s3 = new AWS.S3();


app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// ログ出力
app.use(morgan('dev', {}));
// app.use(express.compress());
app.use(require('less-middleware')(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, '../static')));

app.get('/', function (req, res) {
  res.send('index');
  // res.render('index');
});

app.get('/shot', function(req, res) {
  var url = req.query.url;
  var name = crc.crc32(url).toString(16);
  var output = 'static/images/' + name + '.png';
  var options = {
    phantomPath: phantomPath,
    renderDelay: 4,
  };

  s3.getObject({
    Bucket: 'runstant-shot',
    Key: name,
  }, function(err, data) {
    // データがあればそれを返す
    if (data) {
      console.log('hoge');
      res.writeHead(200, {'Content-Type': data.ContentType });
      res.end(data.Body);
    }
    // なければダミーを返してショットキューに入れる
    else {
      res.sendFile(path.join(__dirname, '../static/images/dummy.png'));
      shot.shot(url, output, options, function(err) {
        // console.log(err);

        var img = fs.readFileSync(path.join(__dirname, '../', output));
        s3.putObject({
          Bucket: 'runstant-shot',
          Key: name,
          ContentType: 'image/png',
          ACL: 'public-read',
          Body: img,
        }, function(err, data) {
          if (err) {
            console.log(err);
          }
          else {
            console.log('success upload ' + name + ' to s3.');
          }
        });
      });
    }
  });
});

// queue の状態を見れるようにする
app.get('/queue', function(req, res) {

});


app.get('/hoge', function(req, res) {

  // var img = fs.readFileSync('static/images/13ab8409.png');
  // res.writeHead(200, {'Content-Type': 'image/png' });
  // res.end(img);

  // return ;


  s3.getObject({
    Bucket: 'runstant-shot',
    Key: 'dummy.png',
  }, function(err, data) {
    console.log(data);
    res.writeHead(200, {'Content-Type': data.ContentType });
    res.end(data.Body);
  });


  // var img = fs.readFileSync('static/images/13ab8409.png');
  // s3.putObject({
  //   Bucket: 'runstant-shot',
  //   Key: 'aaaaa.txt',
  //   Body: 'Hello, BBBB!',
  //   // Key: 'hoge.png',
  //   // Body: img,
  // }, function(err, data) {
  //   console.log(data);
  //   res.send('success update!');
  // });

});

// launch server
var server = app.listen(app.get('port'), function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});