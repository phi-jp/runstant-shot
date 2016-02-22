var exec = require('child_process').exec;

module.exports = {
  shot: function(url, output, options, callback) {
    var args = {
      url: url,
      output: output,
    };
    var argstrings = [];

    for (var key in args) {
      argstrings.push('--' + key + ' ' + args[key]);
    }

    var phantomScript = __dirname + '/ss.slimer.js';

    var command = options.phantomPath + ' ' + phantomScript + ' ' + argstrings.join(' ');
    exec(command, function(error, stdout, stderr) {
      if (error) {
        console.error(error);
      }
      console.log(stdout);
      console.log(stderr);

      callback && callback();
    });
  },
};

