/*
 * app.js
 */

var express = require('express');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var crc = require('crc');
var capstant = require('capstant');
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
  res.render('index');
});


var queue = [];
app.get('/shot/:size', function(req, res) {
  var key = crc.crc32(req.originalUrl).toString(16);
  var url = req.query.url;
  var output = 'static/images/' + key + '.png';
  var delay = req.query.delay || 0;
  var sizes = req.params.size.split('x');
  var width = +sizes[0];
  var height = +sizes[1];
  var options = {
    phantomPath: phantomPath,
    url: url,
    output: output,
    width: width,
    height: height,
    delay: delay,
  };

  s3.getObject({
    Bucket: 'runstant-shot',
    Key: key,
  }, function(err, data) {
    if (data) {
      res.writeHead(200, {'Content-Type': data.ContentType });
      res.end(data.Body);
    }
    else {
      res.sendFile(path.join(__dirname, '../static/images/dummy.png'));

      if (queue.indexOf(key) !== -1) {
        console.log('キューにあるので無視');
        return ;
      }
      
      // キューに追加
      queue.push(key);

      // スクショ
      capstant.shot(url, output, options).then(function() {
        var img = fs.readFileSync(path.join(__dirname, '../', output));
        s3.putObject({
          Bucket: 'runstant-shot',
          Key: key,
          ContentType: 'image/png',
          ACL: 'public-read',
          Body: img,
        }, function(err, data) {
          if (err) {
            console.log(err);
          }
          else {
            console.log('success upload ' + key + ' to s3.');
            // キューから削除
            queue.splice(queue.indexOf(key), 1);
          }
        });

      });
    }
  });
});

// queue の状態を見れるようにする
app.get('/queue', function(req, res) {
  res.send('<pre>' + JSON.stringify(queue, null, '  ') + '</pre>');
});


// launch server
var server = app.listen(app.get('port'), function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});