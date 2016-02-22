var page = require('webpage').create();
var system = require('system');
var args = system.args;

var url = args[1] || 'http://phiary.me';

page.open(url, function (status) {
  slimer.wait(4000)
  // page.viewportSize = { width:1024, height:768 };
  page.render('static/images/screenshot.png');
  slimer.exit();
});
