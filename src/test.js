var Nightmare = require('nightmare');
var nightmare = Nightmare({show: false});

var url  = 'http://dev.runstant.com/cx20/project/5600a99d/full';
var dummy = nightmare
  .goto(url)
  .wait(2500)
  .viewport(320, 240)
  // .screenshot('hoge.png')
  .screenshot('hoge.png', {
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
  })
  ;
