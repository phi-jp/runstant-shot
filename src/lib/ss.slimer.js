var page = require('webpage').create();
var system = require('system');

var args = system.args;
args.shift();

var argv = {};

for (var i=0; i<args.length; ++i) {
  var v = args[i++];
  v = v.substr(2);
  argv[v] = args[i];
  console.log(v + ': ' + argv[v]);
};

page.open(argv.url, function (status) {
  page.viewportSize = { width:640, height:480 };
  // page.viewportSize = { width:640, height:480 };
  page.clipRect = {
    top: 0,
    left: 0,
    width: 640,
    height: 480,
  };
  slimer.wait(4000);
  page.render(argv.output);
  slimer.exit();
});
