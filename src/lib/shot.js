var exec = require('child_process').exec;

var lock = false;
var queue = {};

module.exports = {
  shot: function(url, output, options, callback) {
    var _callback = function() {
      callback();
      this._checkQueue();
    }.bind(this);
    // すでにキューにある場合は無視
    if (queue[url]) {
      return ;
    }
    // ロック中はキューに入れる
    else if (lock) {
      queue[url] = [url, output, options, _callback];
    }
    else {
      this._shot.call(this, url, output, options, _callback);
    }
  },
  _shot: function(url, output, options, callback) {
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
    lock = true;
    console.log('shot start: ' + url);
    exec(command, function(error, stdout, stderr) {
      if (error) {
        console.error(error);
      }
      // console.log(stdout);
      // console.log(stderr);

      lock = false;
      console.log('shot finish: ' + url);

      callback && callback();
    });
  },

  _checkQueue: function() {
    var keys = Object.keys(queue);
    // キューの中身がなければキャンセル
    if (keys.length <= 0) {
      return ;
    }

    var key = keys[0];
    var args = queue[key];
    delete queue[key];

    if (args) {
      this._shot.apply(this, args);
    }
  },
};

