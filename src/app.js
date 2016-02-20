/*
 * app.js
 */

var express = require('express');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var crc = require('crc');
// var webshot = require('webshot');
var Nightmare = require('nightmare');
var nightmare = null;
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// ログ出力
app.use(morgan('dev', {}));
// app.use(express.compress());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', function (req, res) {
  res.send('index');
  // res.render('index');
});
app.get('/shot', function (req, res) {
  var url = req.query.url;
  var name = crc.crc32(url).toString(16);
  var output = 'static/images/' + name + '.png';
  console.log('shot: ' + output);

  // あればそれを返す
  if (fs.existsSync(output)) {
    res.sendFile(path.join(__dirname, '../', output));
  }
  else if (nightmare) {
    res.sendFile(path.join(__dirname, '../static/images/dummy.png'));
  }
  else {
    // とりあえずダミーを投げる
    res.sendFile(path.join(__dirname, '../static/images/dummy.png'));

    console.log('create');

    // なければ作る
    nightmare = Nightmare({show: false});
    var dummy = nightmare
      .goto(url)
      .wait(2500)
      .viewport(320, 240)
      .screenshot(output, {
        x: 0,
        y: 0,
        width: 320,
        height: 240,
      })
      .evaluate(function() {
        return location.origin + location.pathname;
      })
      .end()
      .then(function(result) {
        console.log(result);
        nightmare = null;
      }, function(error) {
        console.log(error);
      })
      ;
  }

});

// app.get('/shot2', function (req, res) {
//   var url = req.query.url;
//   var name = crc.crc32(url).toString(16);
//   var output = 'static/images/' + name + '.png';
//   console.log(output);

//   webshot(url, output, function(err) {
//     // screenshot now saved to google.png
//     console.log(err);
//     res.sendFile(path.join(__dirname, '../', output));
//   });
// });

// launch server
var server = app.listen(app.get('port'), function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});