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

  // あればそれを返す
  if (fs.existsSync(output)) {
    res.sendFile(path.join(__dirname, '../', output));
  }
  // キュー待ちも除外
  else {
    res.sendFile(path.join(__dirname, '../static/images/dummy.png'));
    shot.shot(url, output, options, function(err) {
      console.log(err);
      // res.sendFile(path.join(__dirname, '../', output));
    });
  }
});

// launch server
var server = app.listen(app.get('port'), function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});