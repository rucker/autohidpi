var main = require('./main');
var simple_prefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');

exports["test when user sets pixel ratio 1.2 " +
        "and mode is min screen width " +
        "and screen is greater than specified width " +
        "then devPixelsPerPx is set to 1.2"] = function(assert) {
  main.setDevPixelsPerPx(main.setMinWidthMode(5000, '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '1.2');
};

exports["test when mode is min screen width " +
        "and screen is not greater than specified width " +
        "then devPixelsPerPx is set to 1"] = function(assert) {
  main.setDevPixelsPerPx(main.setMinWidthMode(500, '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '1');
};

exports["test when user sets pixel ratio 1.2 " +
        "and mode is exact screen size " +
        "and screen matches specified screen size " +
        "then devPixelsPerPx is set to 1.2"] = function(assert) {
  main.setDevPixelsPerPx(main.setExactScreenSizeMode('1920', '1080', '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '1.2');
};

exports["test when mode is exact screen size " +
        "and screen does not match specified size " +
        "then devPixelsPerPx is set to 1"] = function(assert) {
  main.setDevPixelsPerPx(main.setExactScreenSizeMode('1920', '1200', '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '1');
};

exports["test main async"] = function(assert, done) {
  assert.pass("async Unit test running!");
  done();
};

require("sdk/test").run(exports);
