var page = require('webpage').create();

page.open("http://phiary.me", function (status) {
  page.viewportSize = { width:1024, height:768 };
  page.render('screenshot.png')
});
