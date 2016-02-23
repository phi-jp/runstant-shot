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
  slimer.wait(4000);
  page.viewportSize = { width:1024, height:768 };
  page.render(argv.output);
  slimer.exit();
});
